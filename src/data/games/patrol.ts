/**
 * Уровни «Фрод-патруля». Каждый уровень — свёрстанный фейковый экран, разбитый на строки.
 * Строки с `trap` — ловушки, которые игрок должен найти тапом.
 */
export type PatrolLine = {
  id: string
  kind: 'meta' | 'title' | 'text' | 'link' | 'field' | 'button' | 'timer' | 'file'
  text: string
  label?: string
  trap?: string
}

export type PatrolLevel = {
  id: string
  title: string
  screen: 'sms' | 'web' | 'chat'
  header: string
  lines: PatrolLine[]
}

export const patrolLevels: PatrolLevel[] = [
  {
    id: 'p1',
    title: 'SMS о блокировке',
    screen: 'sms',
    header: '+7 951 204-18-33',
    lines: [
      { id: 'from', kind: 'meta', text: 'Отправитель: +7 951 204-18-33', trap: 'Банк пишет с короткого имени, а не с мобильного номера' },
      { id: 'hi', kind: 'text', text: 'Уважаемый клиент!' },
      { id: 'urgent', kind: 'text', text: 'Ваш счёт будет заблокирован через 30 минут.', trap: 'Срочность — главный инструмент давления' },
      { id: 'link', kind: 'link', text: 'vtb-bonus-24.ru/unlock', trap: 'Домен похож на банковский, но принадлежит мошенникам' },
      { id: 'code', kind: 'text', text: 'Для отмены сообщите код из SMS оператору.', trap: 'Коды из SMS никому не сообщают — даже «оператору банка»' },
      { id: 'time', kind: 'meta', text: 'Сегодня, 10:42' },
    ],
  },
  {
    id: 'p2',
    title: 'Страница «получения оплаты»',
    screen: 'web',
    header: 'bezopasnaya-sdelka.online',
    lines: [
      { id: 'domain', kind: 'meta', text: 'bezopasnaya-sdelka.online', trap: 'Незнакомый домен в зоне .online вместо сайта площадки' },
      { id: 'title', kind: 'title', text: 'Получение оплаты за товар' },
      { id: 'sum', kind: 'text', text: 'Сумма к зачислению: 42 000 ₽' },
      { id: 'card', kind: 'field', label: 'Номер карты', text: '•••• •••• •••• ••••' },
      { id: 'cvv', kind: 'field', label: 'CVV-код', text: '•••', trap: 'Чтобы получить деньги, CVV не нужен — только чтобы списать' },
      { id: 'balance', kind: 'field', label: 'Баланс карты', text: '₽', trap: 'Баланс спрашивают, чтобы понять, сколько можно украсть' },
      { id: 'timer', kind: 'timer', text: 'Оплата будет отменена через 09:59', trap: 'Таймер не даёт подумать и перепроверить' },
      { id: 'btn', kind: 'button', text: 'Получить деньги' },
    ],
  },
  {
    id: 'p3',
    title: 'Сообщение «из ЦБ»',
    screen: 'chat',
    header: 'Сотрудник ЦБ РФ',
    lines: [
      { id: 'who', kind: 'meta', text: 'Сотрудник ЦБ РФ · в сети', trap: 'Центробанк не пишет гражданам в мессенджеры' },
      { id: 'hi', kind: 'text', text: 'Добрый день! По вашему счёту зафиксирована подозрительная активность.' },
      { id: 'move', kind: 'text', text: 'Переведите средства на защищённый счёт до окончания проверки.', trap: '«Защищённых» и «безопасных» счетов не бывает' },
      { id: 'secret', kind: 'text', text: 'Никому не говорите, даже родственникам — это тайна следствия.', trap: 'Изоляция от близких — признак манипуляции' },
      { id: 'apk', kind: 'file', text: 'Support-Guard.apk · 12 МБ', trap: 'Такие «приложения защиты» дают удалённый доступ к телефону' },
      { id: 'time', kind: 'meta', text: '11:07' },
    ],
  },
]
