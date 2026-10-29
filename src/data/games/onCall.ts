/** Ветвящийся диалог «На связи». Реплики звонящего и варианты ответа игрока. */
export type CallChoice = { text: string; next: string }

export type CallNode =
  | { kind: 'line'; id: string; text: string; flag?: string; choices: CallChoice[] }
  | { kind: 'end'; id: string; good: boolean; score: number; title: string; text: string }

export const CALLER = { name: 'Служба безопасности', number: '+7 495 012-44-90' }

export const callNodes: Record<string, CallNode> = {
  start: {
    kind: 'line',
    id: 'start',
    text: 'Здравствуйте, служба безопасности банка. С вашей карты пытаются перевести 47 000 ₽ в Самару. Это вы?',
    flag: 'Звонок «из банка» с неизвестного номера',
    choices: [
      { text: 'Нет, не я!', next: 'code' },
      { text: 'Кто вы? Назовите ФИО и отдел', next: 'name' },
      { text: 'Я сам перезвоню в банк', next: 'endCallback' },
    ],
  },
  name: {
    kind: 'line',
    id: 'name',
    text: 'Специалист Смирнов Алексей, отдел финансового мониторинга. Время идёт — деньги могут списать в любую секунду!',
    flag: 'Давление срочностью',
    choices: [
      { text: 'Хорошо, что мне делать?', next: 'code' },
      { text: 'Я проверю и перезвоню сам', next: 'endCallback' },
    ],
  },
  code: {
    kind: 'line',
    id: 'code',
    text: 'Операцию нужно срочно отменить. Сейчас вам придёт SMS — продиктуйте код, и мы всё заблокируем.',
    flag: 'Просят код из SMS',
    choices: [
      { text: 'Диктую код…', next: 'endCode' },
      { text: 'Зачем вам мой код?', next: 'blame' },
      { text: 'Коды никому не сообщают. Кладу трубку', next: 'endHangUp' },
    ],
  },
  blame: {
    kind: 'line',
    id: 'blame',
    text: 'Код нужен для блокировки. Если откажетесь — ответственность за списание будет на вас. Или переведите деньги на безопасный счёт.',
    flag: 'Запугивание и «безопасный счёт»',
    choices: [
      { text: 'Ладно, вот код', next: 'endCode' },
      { text: 'Переведу на безопасный счёт', next: 'endTransfer' },
      { text: 'Банк не просит коды. До свидания', next: 'endHangUp' },
    ],
  },
  endCallback: {
    kind: 'end',
    id: 'endCallback',
    good: true,
    score: 1,
    title: 'Идеально!',
    text: 'Вы не стали разговаривать и перезвонили по номеру на обороте карты. Так мошенники теряют над вами контроль.',
  },
  endHangUp: {
    kind: 'end',
    id: 'endHangUp',
    good: true,
    score: 0.85,
    title: 'Вы не попались',
    text: 'Вы вовремя положили трубку. В следующий раз можно закончить разговор ещё раньше — сразу после слов «служба безопасности».',
  },
  endCode: {
    kind: 'end',
    id: 'endCode',
    good: false,
    score: 0.15,
    title: 'Код у мошенников',
    text: 'С этим кодом списали бы 47 000 ₽. Код из SMS — ваша подпись под операцией. Его никому не диктуют.',
  },
  endTransfer: {
    kind: 'end',
    id: 'endTransfer',
    good: false,
    score: 0,
    title: 'Деньги ушли мошенникам',
    text: '«Безопасных счетов» не бывает. Банк сам защищает деньги и никогда не просит их переводить.',
  },
}

export const DECLINE_END: CallNode = {
  kind: 'end',
  id: 'endDecline',
  good: true,
  score: 1,
  title: 'Лучшая защита',
  text: 'Незнакомый номер, который называет себя банком, лучше сбросить и перезвонить в банк самостоятельно.',
}
