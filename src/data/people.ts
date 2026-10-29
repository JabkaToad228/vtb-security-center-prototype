export type PersonId = 'mama' | 'papa'
export type HelpToggleId = 'calls' | 'transfers' | 'confirm' | 'quick'
export type Tone = 'ok' | 'danger' | 'muted'

export type Person = {
  id: PersonId
  name: string
  initial: string
  status: { tone: Tone; text: string }
  /** Активная ситуация, которая ждёт разбора (у Папы — из макета Frame 21). */
  activeCaseId?: string
  defaultToggles: Record<HelpToggleId, boolean>
}

export const people: Record<PersonId, Person> = {
  mama: {
    id: 'mama',
    name: 'Мама',
    initial: 'М',
    status: { tone: 'ok', text: 'Всё в порядке' },
    defaultToggles: { calls: true, transfers: true, confirm: false, quick: true },
  },
  papa: {
    id: 'papa',
    name: 'Папа',
    initial: 'П',
    status: { tone: 'danger', text: 'Подозрительный звонок' },
    activeCaseId: 'papa-phishing-link',
    defaultToggles: { calls: true, transfers: false, confirm: false, quick: false },
  },
}

export const personOrder: PersonId[] = ['mama', 'papa']

export const helpToggles: { id: HelpToggleId; title: string; text: string }[] = [
  {
    id: 'calls',
    title: 'Подозрительные звонки',
    text: 'Сообщать мне о признаках мошенничества во время разговора',
  },
  {
    id: 'transfers',
    title: 'Помощь с переводом',
    text: 'Сообщать мне о признаках подозрительного перевода денежных средств',
  },
  {
    id: 'confirm',
    title: 'Подтверждение переводов',
    text: 'При подозрительных переводах мы отправим вам сообщение для подтверждения перевода',
  },
  {
    id: 'quick',
    title: 'Быстрая связь',
    text: 'Быть контактом по кнопке “Помоги разобраться”',
  },
]

/** Пункты в карточке близкого на экране «Круг доверия» выводятся из включённых тумблеров. */
export function permissionLines(t: Record<HelpToggleId, boolean>): string[] {
  const lines: string[] = []
  if (t.calls) lines.push('Уведомления о подозрительных звонках')
  if (t.transfers || t.confirm) lines.push('Подтверждение операций')
  if (t.quick && !t.transfers && !t.confirm) lines.push('Быстрая связь по кнопке')
  return lines
}

/** Кто помогает мне — вкладка «Мне помогают». */
export const myHelpers = [
  {
    id: 'anya',
    name: 'Аня',
    initial: 'А',
    note: 'Сестра',
    lines: ['Получает уведомления о подозрительных звонках', 'Подтверждает переводы от 50 000 ₽'],
  },
]

export const helpScenarios = [
  {
    title: 'Звонок «из банка» или «из полиции»',
    text: 'Попросите близкого положить трубку и перезвонить по номеру на обороте карты. Настоящий сотрудник не торопит и не просит коды.',
  },
  {
    title: '«Мама, я попал в беду»',
    text: 'Договоритесь о кодовом слове. Если просят деньги с нового номера — сначала позвонить на старый.',
  },
  {
    title: 'Ссылка на оплату или выплату',
    text: 'Для получения денег не нужны CVV и коды из SMS. Перешлите ссылку вам или AI-помощнику на проверку.',
  },
  {
    title: 'Выигрыш, компенсация, «налог»',
    text: 'Если за выигрыш просят заплатить — это мошенники. Помогите близкому удалить сообщение и не перезванивать.',
  },
]
