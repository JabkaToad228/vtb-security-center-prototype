export type RiskEventId = 'sim' | 'call'
export type ChecklistId = 'login' | 'relatives' | 'limit' | 'credit'

export type RiskEvent = {
  id: RiskEventId
  kind: 'sim' | 'call'
  date: string
  title: string
  text: string
  caseId: string
}

export const riskEvents: RiskEvent[] = [
  {
    id: 'sim',
    kind: 'sim',
    date: '20 октября',
    title: 'Смена SIM-карты',
    text: 'После замены sim-карты банк может дополнительно проверить некоторые операции',
    caseId: 'me-sim-swap',
  },
  {
    id: 'call',
    kind: 'call',
    date: '23 октября, 11:45 - 4 минуты',
    title: 'Подозрительный звонок',
    text: 'Подозрительное содержание звонка. Проверьте звонок на схему мошенников',
    caseId: 'me-suspicious-call',
  },
]

export type ChecklistItem = {
  id: ChecklistId
  title: string
  hint: string
  /** Вклад пункта в «% защиты настроено». */
  weight: number
}

export const checklist: ChecklistItem[] = [
  {
    id: 'login',
    title: 'Подтверждение входа',
    hint: 'Вход с нового устройства — только после подтверждения на текущем телефоне',
    weight: 15,
  },
  {
    id: 'relatives',
    title: 'Помощь близких',
    hint: 'Близкие из круга доверия получают сигнал о подозрительных операциях',
    weight: 10,
  },
  {
    id: 'limit',
    title: 'Лимит на переводы',
    hint: 'Не более 100 000 ₽ в сутки без дополнительной проверки',
    weight: 5,
  },
  {
    id: 'credit',
    title: 'Самозапрет на кредиты',
    hint: 'Никто не сможет оформить кредит на ваше имя дистанционно',
    weight: 5,
  },
]

/** База + чек-лист (35) + события (2 × 5) = 100. Начальное состояние даёт 75%, как в макете. */
export const PROTECTION_BASE = 55
export const EVENT_WEIGHT = 5
