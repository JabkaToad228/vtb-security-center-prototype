import { useSearchParams } from 'react-router-dom'
import { A } from '../assets'
import { cases, historyStats, type Case } from '../data/cases'
import { people } from '../data/people'
import { Screen } from '../shell/Screen'
import { plural } from '../state/selectors'
import { useStore } from '../state/store'
import { Avatar, Card, Chip } from '../ui/kit'
import { OutcomeBanner } from '../ui/OutcomeBanner'
import { useNav } from '../shell/nav'

const filters = [
  { id: 'all', label: 'Все' },
  { id: 'me', label: 'Мои' },
  { id: 'mama', label: 'Мама' },
  { id: 'papa', label: 'Папа' },
] as const
type Filter = (typeof filters)[number]['id']

/** Новый экран: лента всех разобранных ситуаций. */
export function History() {
  const [params, setParams] = useSearchParams()
  const { go } = useNav()
  const raw = params.get('person')
  const filter: Filter = filters.some((f) => f.id === raw) ? (raw as Filter) : 'all'
  const list = filter === 'all' ? cases : cases.filter((c) => c.owner === filter)
  const months = [...new Set(list.map((c) => c.month))]

  return (
    <Screen title="История защиты">
      <OutcomeBanner
        title={`Предотвращено ${historyStats.prevented} ${plural(historyStats.prevented, ['атака', 'атаки', 'атак'])}`}
        subtitle={`Сохранено ${historyStats.saved}`}
      />

      <div className="no-scrollbar -mx-[25px] mt-[15px] flex gap-[7px] overflow-x-auto px-[25px]">
        {filters.map((f) => (
          <Chip key={f.id} active={f.id === filter} onClick={() => setParams(f.id === 'all' ? {} : { person: f.id }, { replace: true })}>
            {f.label}
          </Chip>
        ))}
      </div>

      {months.map((m) => (
        <section key={m}>
          <h3 className="mb-[7px] mt-[20px] text-t16 font-bold">{m}</h3>
          <div className="flex flex-col gap-[7px]">
            {list
              .filter((c) => c.month === m)
              .map((c) => (
                <HistoryItem key={c.id} c={c} onClick={() => go(`/case/${c.id}`)} />
              ))}
          </div>
        </section>
      ))}
    </Screen>
  )
}

function HistoryItem({ c, onClick }: { c: Case; onClick: () => void }) {
  const { state } = useStore()
  const who = c.owner === 'me' ? { initial: 'Я', name: 'Вы' } : people[c.owner]
  const tag = c.riskEventId && state.events[c.riskEventId] !== 'open' ? { tone: 'ok', text: 'Проверено' } : c.tag
  return (
    <button onClick={onClick} className="block w-full text-left">
      <Card className="flex items-center gap-[12px] px-[12px] py-[12px] active:bg-light">
        <Avatar letter={who.initial} size={50} />
        <div className="min-w-0 flex-1">
          <div className="text-t12 text-muted">
            {who.name} · {c.date}
          </div>
          <div className="mt-[2px] text-t14 font-bold">{c.title}</div>
          <span className={`mt-[5px] inline-block rounded-[6px] px-[7px] py-[2px] text-t12 font-semibold ${tag.tone === 'ok' ? 'bg-[#e3f5e5] text-ok' : 'bg-light text-brand'}`}>
            {tag.text}
          </span>
        </div>
        <img alt="" src={A.chevronSm} className="shrink-0" />
      </Card>
    </button>
  )
}
