import { Fragment, useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { caseById } from '../data/cases'
import { people } from '../data/people'
import { EVENT_WEIGHT } from '../data/risk'
import { useToast } from '../shell/overlay'
import { Screen } from '../shell/Screen'
import { useStore } from '../state/store'
import { Avatar, Card, CheckDot, Divider, PrimaryButton, StatusLine } from '../ui/kit'
import { OutcomeBanner } from '../ui/OutcomeBanner'
import { useNav } from '../shell/nav'

/** Frame 21 — «Разбор ситуации». Шаблон, заполняемый данными кейса. */
export function CaseReview() {
  const { caseId = '' } = useParams()
  const c = caseById(caseId)
  const { go, back } = useNav()
  const toast = useToast()
  const { state, dispatch } = useStore()
  const eventOpen = c?.riskEventId ? state.events[c.riskEventId] === 'open' : false

  // Разбор звонка считается проверкой события из риск-профиля.
  useEffect(() => {
    if (c?.riskEventId === 'call' && eventOpen) {
      dispatch({ type: 'event', id: 'call', status: 'reviewed' })
      toast(`Звонок разобран · +${EVENT_WEIGHT}% к защите`)
    }
  }, [c?.riskEventId, eventOpen, dispatch, toast])

  if (!c) return <Navigate to="/history" replace />
  const owner = c.owner === 'me' ? { name: 'Вы', initial: 'Я' } : people[c.owner]
  const dative = c.owner === 'mama' ? 'маме' : 'папе'

  return (
    <Screen title="Разбор ситуации">
      <div className="-ml-[4px] flex items-start">
        <Avatar letter={owner.initial} size={70} />
        <div className="ml-[16px] pt-[12.8px]">
          <div className="text-t20 font-bold">{owner.name}</div>
          <div className="mt-[3px]">
            <StatusLine tone={c.ownerStatus.tone} text={c.ownerStatus.text} />
          </div>
        </div>
      </div>

      <h2 className="mt-[10px] max-w-[245px] text-t24 font-bold">{c.title}</h2>
      <div className="ml-[1px] mt-[1px] text-t14">{c.date}</div>

      <div className="mt-[10px]">
        <OutcomeBanner title={c.outcome.title} subtitle={c.outcome.subtitle} />
      </div>

      <h3 className="mt-[20px] text-t16 font-bold">Что произошло</h3>
      <p className="mt-[5px] whitespace-pre-line text-t14">{c.what}</p>

      <h3 className="mt-[20px] text-t16 font-bold">Что заметил AI</h3>
      <Card tone="light" className="mt-[5px] px-[15px] pb-[15px] pt-[15px]">
        {c.aiNotes.map((n, i) => (
          <Fragment key={n.title}>
            {i > 0 && <Divider className="my-[15px]" />}
            <div className="flex items-start gap-[10px]">
              <span className="mt-[2px]">
                <CheckDot checked />
              </span>
              <div className="max-w-[250px]">
                <div className="text-t14 font-bold">{n.title}</div>
                <p className="mt-[3px] whitespace-pre-line text-t14">{n.text}</p>
              </div>
            </div>
          </Fragment>
        ))}
        <Divider className="my-[15px]" />
        <div className="flex gap-[8px] text-t14">
          <span className="font-bold">Итог:</span>
          <span>{c.verdict}</span>
        </div>
      </Card>

      <h3 className="mt-[20px] text-t16 font-bold">Как помог сервис</h3>
      <ul className="mt-[5px] flex flex-col gap-[5px]">
        {c.help.map((h) => (
          <li key={h} className="flex items-start gap-[10px]">
            <span className="mt-[2px]">
              <CheckDot checked />
            </span>
            <span className="text-t14">{h}</span>
          </li>
        ))}
      </ul>

      <div className="mt-[20px] flex flex-col gap-[7px]">
        {c.riskEventId === 'sim' && eventOpen && (
          <>
            <PrimaryButton
              onClick={() => {
                dispatch({ type: 'event', id: 'sim', status: 'reviewed' })
                toast(`Отлично, проверка снята · +${EVENT_WEIGHT}% к защите`)
                back()
              }}
            >
              Это был я
            </PrimaryButton>
            <PrimaryButton
              variant="soft"
              onClick={() => {
                dispatch({ type: 'event', id: 'sim', status: 'reviewed' })
                toast('Новое устройство отключено. Мы перезвоним вам')
              }}
            >
              Это был не я
            </PrimaryButton>
          </>
        )}
        {c.owner !== 'me' && (
          <PrimaryButton onClick={() => toast(`Звоним ${dative}…`)}>Позвонить {dative}</PrimaryButton>
        )}
        <PrimaryButton variant="soft" onClick={() => go(`/assistant?topic=${c.topic}`)}>
          Спросить AI-помощника
        </PrimaryButton>
      </div>
    </Screen>
  )
}
