import { Fragment, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { A } from '../assets'
import { caseById, casesFor } from '../data/cases'
import { helpScenarios, helpToggles, people, type HelpToggleId, type PersonId } from '../data/people'
import { Sheet, useToast } from '../shell/overlay'
import { Screen } from '../shell/Screen'
import { useStore } from '../state/store'
import { plural } from '../state/selectors'
import { Avatar, BookIcon, Card, Divider, LinkCard, PrimaryButton, StatusLine, TimeIcon, Toggle } from '../ui/kit'
import { useNav } from '../shell/nav'

const toggleIcon: Record<HelpToggleId, string> = {
  calls: A.iconPhoneRow,
  transfers: A.iconSortArrow,
  confirm: A.iconRingMove,
  quick: A.iconSend,
}

/** Frame 20 — «Помощь близким»: настройки помощи конкретному человеку. */
export function HelpRelative() {
  const { personId } = useParams()
  const { go } = useNav()
  const toast = useToast()
  const { state, dispatch } = useStore()
  const [confirmOff, setConfirmOff] = useState(false)
  const [scenarios, setScenarios] = useState(false)

  if (personId !== 'mama' && personId !== 'papa') return <Navigate to="/trust" replace />
  const id: PersonId = personId
  const p = people[id]
  const h = state.helpers[id]
  const history = casesFor(id)
  const active = p.activeCaseId ? caseById(p.activeCaseId) : undefined
  const status = h.enabled ? p.status : { tone: 'muted' as const, text: 'Помощь отключена' }

  return (
    <Screen title="Помощь близким">
      <div className="flex items-start">
        <Avatar letter={p.initial} size={70} />
        <div className="ml-[15px] pt-[12.8px]">
          <div className="text-t20 font-bold">{p.name}</div>
          <div className="ml-[1px] mt-[3px]">
            <StatusLine tone={status.tone} text={status.text} />
          </div>
        </div>
      </div>

      {active && h.enabled && (
        <button onClick={() => go(`/case/${active.id}`)} className="mt-[15px] flex w-full items-center gap-[12px] rounded-[15px] border border-danger/40 bg-[#fff1f1] px-[15px] py-[12px] text-left">
          <span className="flex-1">
            <span className="block text-t14 font-bold">Новая ситуация: {active.title.toLowerCase()}</span>
            <span className="block text-t12">{active.date} · нужен ваш разбор</span>
          </span>
          <img alt="" src={A.chevronSm} />
        </button>
      )}

      <Card className="mt-[15px] px-[15px]">
        {helpToggles.map((t, i) => (
          <Fragment key={t.id}>
            {i > 0 && <Divider />}
            <div className="relative pb-[16px] pt-[15px]">
              <img alt="" src={toggleIcon[t.id]} className="absolute left-[-5px] top-[14px]" />
              <div className="absolute right-0 top-[20px]">
                <Toggle
                  label={t.title}
                  on={h.toggles[t.id]}
                  disabled={!h.enabled}
                  onChange={(v) => {
                    dispatch({ type: 'helperToggle', person: id, id: t.id, value: v })
                    toast(v ? `${t.title}: включено` : `${t.title}: выключено`)
                  }}
                />
              </div>
              <div className="ml-[27px]">
                <div className="whitespace-nowrap text-t14 font-bold">{t.title}</div>
                <p className="mt-[5px] max-w-[207px] text-t14">{t.text}</p>
              </div>
            </div>
          </Fragment>
        ))}
      </Card>

      <div className="mt-[5px]">
        {h.enabled ? (
          <PrimaryButton onClick={() => setConfirmOff(true)}>Отключить помощь</PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={() => {
              dispatch({ type: 'helperEnabled', person: id, value: true })
              toast('Помощь снова включена')
            }}
          >
            Включить помощь
          </PrimaryButton>
        )}
      </div>

      <div className="mt-[10px] flex flex-col gap-[5px]">
        <LinkCard
          icon={<TimeIcon />}
          title="История защиты"
          subtitle={`${history.length} ${plural(history.length, ['ситуация', 'ситуации', 'ситуаций'])}`}
          onClick={() => go(`/history?person=${id}`)}
        />
        <LinkCard icon={<BookIcon />} title="Сценарии помощи" subtitle="Узнай, как обезопасить близкого" onClick={() => setScenarios(true)} />
      </div>

      <Sheet open={confirmOff} onClose={() => setConfirmOff(false)} title="Отключить помощь?">
        <p className="mb-[16px] text-t14">
          Вы перестанете получать сигналы о подозрительных звонках и переводах {id === 'mama' ? 'мамы' : 'папы'}. Включить помощь снова можно в любой момент.
        </p>
        <PrimaryButton
          onClick={() => {
            dispatch({ type: 'helperEnabled', person: id, value: false })
            setConfirmOff(false)
            toast('Помощь отключена')
          }}
        >
          Отключить
        </PrimaryButton>
        <PrimaryButton variant="soft" className="mt-[7px]" onClick={() => setConfirmOff(false)}>
          Оставить
        </PrimaryButton>
      </Sheet>

      <Sheet open={scenarios} onClose={() => setScenarios(false)} title="Сценарии помощи">
        <div className="flex flex-col gap-[7px]">
          {helpScenarios.map((s) => (
            <Card key={s.title} tone="light" className="px-[15px] py-[12px]">
              <div className="text-t14 font-bold">{s.title}</div>
              <p className="mt-[3px] text-t14">{s.text}</p>
            </Card>
          ))}
        </div>
      </Sheet>
    </Screen>
  )
}
