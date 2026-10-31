import { useLocation } from 'react-router-dom'
import { useStore } from '../state/store'
import { healthPercent, protectionPercent } from '../state/selectors'
import { useNav } from './nav'
import { useToast } from './overlay'

const groups: { title: string; items: { label: string; to: string; note?: string }[] }[] = [
  {
    title: 'Экраны макета',
    items: [
      { label: 'Центр безопасности', to: '/', note: 'Fr 17' },
      { label: 'Риск-профиль', to: '/risk', note: 'Fr 18' },
      { label: 'Круг доверия', to: '/trust', note: 'Fr 19' },
      { label: 'Помощь близким · Мама', to: '/trust/mama', note: 'Fr 20' },
      { label: 'Разбор ситуации · Папа', to: '/case/papa-phishing-link', note: 'Fr 21' },
      { label: 'Игры для безопасности', to: '/games', note: 'Fr 22' },
    ],
  },
  {
    title: 'Новые экраны',
    items: [
      { label: 'AI-помощник', to: '/assistant' },
      { label: 'История защиты', to: '/history' },
    ],
  },
  {
    title: 'Мини-игры',
    items: [
      { label: 'Фрод-патруль', to: '/games/patrol' },
      { label: 'На связи', to: '/games/on-call' },
      { label: 'Дело на двоих', to: '/games/duo' },
      { label: 'Верю — не верю', to: '/games/believe' },
      { label: 'А вы бы поверили?', to: '/quiz' },
    ],
  },
]

/** Панель для защиты кейса на десктопе: быстрые переходы, метрики и сброс демо. */
export function DemoNavigator() {
  const { jump, returnTo } = useNav()
  const { pathname } = useLocation()
  const { state, dispatch } = useStore()
  const toast = useToast()

  return (
    <aside className="w-[260px] shrink-0 text-white">
      <div className="text-[12px] font-semibold uppercase tracking-[1.5px] text-white/50">Прототип · кейс-чемпионат</div>
      <h1 className="mt-[6px] text-[22px] font-bold leading-tight">Центр безопасности</h1>
      <div className="mt-[14px] grid grid-cols-2 gap-[8px]">
        <Metric value={protectionPercent(state)} label="защиты" />
        <Metric value={healthPercent(state)} label="цифр. здоровья" />
      </div>
      {groups.map((g) => (
        <nav key={g.title} className="mt-[18px]">
          <div className="mb-[6px] text-[11px] font-semibold uppercase tracking-[1px] text-white/45">{g.title}</div>
          <ul className="flex flex-col gap-[2px]">
            {g.items.map((i) => {
              const active = pathname === i.to
              return (
                <li key={i.to}>
                  <button
                    onClick={() => jump(i.to)}
                    className={`flex w-full items-center justify-between rounded-[8px] px-[10px] py-[6px] text-left text-[13px] transition-colors ${active ? 'bg-white/15 font-semibold' : 'text-white/80 hover:bg-white/8'}`}
                  >
                    {i.label}
                    {i.note && <span className="text-[11px] text-white/40">{i.note}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      ))}
      <button
        onClick={() => {
          dispatch({ type: 'reset' })
          returnTo('/')
          toast('Демо сброшено к состоянию макета')
        }}
        className="mt-[18px] w-full rounded-[10px] border border-white/25 py-[9px] text-[13px] font-semibold hover:bg-white/10"
      >
        Сбросить демо
      </button>
      <p className="mt-[14px] text-[11px] leading-snug text-white/40">
        Прототип для кейс-чемпионата. Не является официальным приложением банка. Все данные вымышлены, ответы AI-помощника подготовлены заранее.
      </p>
    </aside>
  )
}

const Metric = ({ value, label }: { value: number; label: string }) => (
  <div className="rounded-[10px] bg-white/8 px-[10px] py-[8px]">
    <div className="text-[20px] font-bold">{value}%</div>
    <div className="text-[11px] text-white/55">{label}</div>
  </div>
)
