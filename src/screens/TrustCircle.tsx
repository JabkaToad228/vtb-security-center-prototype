import { useState } from 'react'
import { A } from '../assets'
import { helpScenarios, myHelpers, people, permissionLines, personOrder, type PersonId } from '../data/people'
import { Sheet, useToast } from '../shell/overlay'
import { Screen } from '../shell/Screen'
import { useStore } from '../state/store'
import { activeHelpers, plural } from '../state/selectors'
import { HeroBadge } from '../ui/hero'
import { Avatar, BookIcon, Card, CheckDot, LinkCard, PrimaryButton, Segmented, StatusLine, TextLink } from '../ui/kit'
import { useNav } from '../shell/nav'

type Tab = 'i-help' | 'help-me'

/** Frame 19 — «Круг доверия». */
export function TrustCircle() {
  const [tab, setTab] = useState<Tab>('i-help')
  const [invite, setInvite] = useState(false)
  const [scenarios, setScenarios] = useState(false)
  const { state } = useStore()
  const toast = useToast()
  const n = activeHelpers(state)

  return (
    <Screen title="Круг доверия">
      <div className="mt-[7px]">
        <HeroBadge>
          <img alt="" src={A.iconTrust} className="size-[97px]" />
        </HeroBadge>
      </div>
      <h2 className="-mx-[20px] mt-[5px] whitespace-nowrap text-center text-t24 font-bold">
        {tab === 'i-help' ? `${n} ${plural(n, ['близкий', 'близких', 'близких'])} в кругу доверия` : '1 близкий помогает вам'}
      </h2>

      <div className="mt-[20px]">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { id: 'i-help', label: 'Я помогаю' },
            { id: 'help-me', label: 'Мне помогают' },
          ]}
        />
      </div>

      <div className="mt-[10px] flex flex-col gap-[5px]">
        {tab === 'i-help'
          ? personOrder.map((id) => <PersonCard key={id} id={id} />)
          : myHelpers.map((h) => (
              <Card key={h.id} className="px-[15px] pb-[15px] pt-[15px]">
                <div className="flex gap-[9px]">
                  <Avatar letter={h.initial} size={50} />
                  <div className="flex-1">
                    <div className="pl-[4px] text-t20 font-bold">{h.name}</div>
                    <div className="pl-[4px] text-t14 text-muted">{h.note}</div>
                    <ul className="mt-[5px] flex flex-col gap-[5px]">
                      {h.lines.map((l) => (
                        <li key={l} className="flex items-start gap-[5px]">
                          <span className="mt-[1.5px]">
                            <CheckDot checked />
                          </span>
                          <span className="text-t14">{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <PrimaryButton className="mt-[12px]" variant="soft" onClick={() => toast('Аня получила запрос «Помоги разобраться»')}>
                  Помоги разобраться
                </PrimaryButton>
              </Card>
            ))}
      </div>

      <div className="mt-[5px]">
        <PrimaryButton onClick={() => setInvite(true)}>
          <span className="mr-[8px] text-t30 leading-none">+</span>Добавить близкого
        </PrimaryButton>
      </div>
      <div className="mt-[10px]">
        <LinkCard icon={<BookIcon />} title="Сценарии помощи" subtitle="Узнай, как обезопасить близкого" onClick={() => setScenarios(true)} />
      </div>

      <Sheet open={invite} onClose={() => setInvite(false)} title="Пригласить близкого">
        <p className="text-t14">Отправьте приглашение. Близкий сам выберет, какие уведомления вам доверить — без доступа к его деньгам и переписке.</p>
        <div className="my-[16px] rounded-[15px] bg-light px-[15px] py-[14px]">
          <div className="text-t12 text-muted">Код приглашения</div>
          <div className="text-t24 font-bold tracking-[2px] text-brand">7Q2F-K9</div>
        </div>
        <PrimaryButton
          onClick={() => {
            setInvite(false)
            toast('Приглашение отправлено')
          }}
        >
          Отправить приглашение
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

function PersonCard({ id }: { id: PersonId }) {
  const { go } = useNav()
  const { state } = useStore()
  const p = people[id]
  const h = state.helpers[id]
  const lines = h.enabled ? permissionLines(h.toggles) : []
  const status = h.enabled ? p.status : { tone: 'muted' as const, text: 'Помощь отключена' }

  return (
    <Card className="px-[15px] pb-[15px] pt-[15px]">
      <button aria-label={`Настройки: ${p.name}`} onClick={() => go(`/trust/${id}`)} className="absolute right-[2px] top-[2px] grid size-[44px] place-items-center">
        <img alt="" src={A.iconGear} className="h-[19px] w-[18px]" />
      </button>
      <div className="flex gap-[9px]">
        <Avatar letter={p.initial} size={50} />
        <div className="min-w-0 flex-1">
          <div className="pl-[4px] text-t20 font-bold">{p.name}</div>
          <div className="mt-[3px] pl-[4px]">
            <StatusLine tone={status.tone} text={status.text} />
          </div>
          <ul className="mt-[5px] flex flex-col gap-[5px]">
            {lines.map((l) => (
              <li key={l} className="flex items-start gap-[5px]">
                <span className="mt-[1.5px]">
                  <CheckDot checked />
                </span>
                <span className="text-t14">{l}</span>
              </li>
            ))}
          </ul>
          <div className="mt-[10px]">
            <TextLink onClick={() => go(`/trust/${id}`)}>Безопасность пользователя</TextLink>
          </div>
        </div>
      </div>
    </Card>
  )
}
