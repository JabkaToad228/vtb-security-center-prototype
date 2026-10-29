/** «Дело на двоих»: улики с двух телефонов, игрок отмечает подозрительные и называет схему. */
export type DuoSide = 'me' | 'mama'
export type DuoClue = { id: string; side: DuoSide; source: string; text: string; suspicious: boolean; why: string }

export const duoSides: { id: DuoSide; title: string }[] = [
  { id: 'mama', title: 'Телефон мамы' },
  { id: 'me', title: 'Ваш телефон' },
]

export const duoClues: DuoClue[] = [
  {
    id: 'm1',
    side: 'mama',
    source: 'Мессенджер · +7 977 …',
    text: 'Мам, это я, телефон разбился, пишу с нового номера',
    suspicious: true,
    why: 'Новый номер без звонка — первый признак подмены',
  },
  {
    id: 'm2',
    side: 'mama',
    source: 'Мессенджер · +7 977 …',
    text: 'Срочно нужно 25 000 ₽, потом объясню. Только не звони, я на совещании',
    suspicious: true,
    why: 'Срочная просьба о деньгах и запрет звонить',
  },
  {
    id: 'm3',
    side: 'mama',
    source: 'Напоминание',
    text: 'Записаться к врачу в четверг',
    suspicious: false,
    why: 'Обычная заметка',
  },
  {
    id: 'y1',
    side: 'me',
    source: 'Телефон',
    text: 'Ваш телефон в порядке, пропущенных от мамы нет',
    suspicious: false,
    why: 'Подтверждает, что «новый номер» — не ваш',
  },
  {
    id: 'y2',
    side: 'me',
    source: 'Центр безопасности',
    text: 'Мама собирается перевести 25 000 ₽ новому получателю. Подтвердить?',
    suspicious: true,
    why: 'Сервис заметил нетипичный перевод и спросил вас',
  },
  {
    id: 'y3',
    side: 'me',
    source: 'Чат с мамой',
    text: 'Мама: «Приедешь в субботу на дачу?»',
    suspicious: false,
    why: 'Обычная переписка',
  },
]

export const duoSchemes = [
  { id: 'relative', text: '«Мама, я попал в беду» — фейковый родственник', correct: true },
  { id: 'bank', text: 'Звонок из «службы безопасности банка»', correct: false },
  { id: 'lottery', text: 'Выигрыш в лотерею', correct: false },
]
