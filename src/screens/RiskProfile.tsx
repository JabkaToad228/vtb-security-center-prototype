import { AnimatePresence, motion } from 'motion/react'
import { A } from '../assets'
import { checklist, EVENT_WEIGHT, type RiskEvent } from '../data/risk'
import { useToast } from '../shell/overlay'
import { Screen } from '../shell/Screen'
import { useStore } from '../state/store'
import { openEvents, plural } from '../state/selectors'
import { HeroBadge } from '../ui/hero'
import { Card, CheckDot, PrimaryButton, TextLink } from '../ui/kit'
import { useNav } from '../shell/nav'

/** Frame 18 — «Риск профиль»: события для проверки и чек-лист. */
export function RiskProfile() {
  const { state, dispatch } = useStore()
  const toast = useToast()
  const events = openEvents(state)
  const n = events.length

  return (
    <Screen title="Риск профиль">
      <div className="mt-[7px]">
        <HeroBadge>
          <img alt="" src={A.iconRisk} className="size-[59.94px] rotate-45" />
        </HeroBadge>
      </div>
      <h2 className="mt-[5px] text-center text-t24 font-bold">
        {n ? `${n} ${plural(n, ['событие', 'события', 'событий'])} для проверки` : 'Событий для проверки нет'}
      </h2>
      <p className="text-center text-t16">{n ? 'Проверьте, чтобы обезопасить себя' : 'Вы проверили всё, что заметил сервис'}</p>

      <div className="mt-[20px] flex flex-col gap-[7px]">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div key={e.id} layout exit={{ opacity: 0, height: 0, marginTop: -7 }} transition={{ duration: 0.25 }} className="overflow-hidden">
              {e.kind === 'sim' ? (
                <SimCard event={e} />
              ) : (
                <CallCard
                  event={e}
                  onKnown={() => {
                    dispatch({ type: 'event', id: e.id, status: 'dismissed' })
                    toast(`Событие закрыто · +${EVENT_WEIGHT}% к защите`)
                  }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {n === 0 && (
          <Card tone="light" className="flex items-center gap-[12px] px-[15px] py-[16px]">
            <CheckDot checked />
            <span className="text-t14">Все события проверены. Мы сообщим, если заметим что-то новое.</span>
          </Card>
        )}
      </div>

      <h3 className="mt-[20px] text-t16 font-bold">Чек-лист безопасности</h3>
      <ul className="mt-[5.5px] flex flex-col gap-[3px]">
        {checklist.map((c) => {
          const on = state.checklist[c.id]
          return (
            <li key={c.id}>
              <button
                className="flex w-full items-start gap-[5px] text-left"
                onClick={() => {
                  dispatch({ type: 'checklist', id: c.id, value: !on })
                  toast(on ? `«${c.title}» выключено · −${c.weight}%` : `«${c.title}» включено · +${c.weight}%`)
                }}
              >
                <span className="mt-[2px]">
                  <CheckDot checked={on} />
                </span>
                <span className="flex flex-col">
                  <span className="text-t14">{c.title}</span>
                  {!on && <span className="text-t12 text-muted">{c.hint}</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Screen>
  )
}

function SimCard({ event }: { event: RiskEvent }) {
  const { go } = useNav()
  return (
    <Card className="min-h-[147px] pb-[14px] pl-[44px] pr-[14px] pt-[14px]">
      <img alt="" src={A.iconSim} className="absolute left-[7px] top-[10px] h-[32px] w-[27px] object-cover" />
      <div className="text-t12">{event.date}</div>
      <div className="mt-[3px] text-t16 font-bold">{event.title}</div>
      <p className="mt-[3px] max-w-[267px] text-t14">{event.text}</p>
      <div className="mt-[10px] -ml-[1px]">
        <TextLink onClick={() => go(`/case/${event.caseId}`)}>Подробнее</TextLink>
      </div>
    </Card>
  )
}

function CallCard({ event, onKnown }: { event: RiskEvent; onKnown: () => void }) {
  const { go } = useNav()
  return (
    <Card tone="light" className="min-h-[202px] pb-[15px] pt-[14px]">
      <img alt="" src={A.iconPhone} className="absolute left-[10px] top-[14px]" />
      <div className="pl-[44px] pr-[14px]">
        <div className="text-t12">{event.date}</div>
        <div className="mt-[3px] text-t16 font-bold">{event.title}</div>
        <p className="mt-[3px] max-w-[267px] text-t14">{event.text}</p>
      </div>
      <div className="mt-[14px] px-[15px]">
        <PrimaryButton onClick={() => go(`/case/${event.caseId}`)}>Разобрать звонок</PrimaryButton>
        <button onClick={onKnown} className="mx-auto mt-[12px] block text-t12 font-bold text-brand">
          Я знаю звонившего
        </button>
      </div>
    </Card>
  )
}
