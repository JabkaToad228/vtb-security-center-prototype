/** Локальная эвристическая проверка ссылки для демо AI-помощника. */
export type LinkVerdict = {
  level: 'safe' | 'warn' | 'danger'
  host: string
  reasons: string[]
}

const OFFICIAL = ['vtb.ru']
const SHORTENERS = ['bit.ly', 'clck.ru', 'tinyurl.com', 'goo.su', 'cutt.ly', 'vk.cc', 't.ly', 'is.gd']
const RISKY_TLD = ['top', 'xyz', 'icu', 'online', 'site', 'click', 'shop', 'live', 'buzz', 'store']
const BAIT = /(pay|oplat|bonus|prize|priz|viplat|vyplat|kompens|compens|unlock|razblok|dostavk|delivery|sdelk|verify|secure|login|gift)/

export function findUrl(text: string): string | null {
  const m = text.match(/((https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?)/i)
  return m ? m[0] : null
}

export function checkLink(raw: string): LinkVerdict | null {
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    return null
  }
  const host = url.hostname.toLowerCase()
  const isOfficial = OFFICIAL.some((d) => host === d || host.endsWith(`.${d}`))
  const danger: string[] = []
  const warn: string[] = []

  if (host.includes('xn--')) danger.push('Домен с подменой букв (punycode) — может выглядеть как настоящий')
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) danger.push('Вместо домена — IP-адрес')
  if (!isOfficial && /vtb|vtbank|vtb24/.test(host)) danger.push('Похож на домен банка, но не принадлежит ему')
  if (SHORTENERS.includes(host)) warn.push('Сокращённая ссылка скрывает настоящий адрес')
  if (url.protocol === 'http:') warn.push('Нет шифрования (http вместо https)')
  const tld = host.split('.').pop() ?? ''
  if (!isOfficial && RISKY_TLD.includes(tld)) warn.push(`Доменная зона .${tld} часто используется для фишинга`)
  if (!isOfficial && BAIT.test(host + url.pathname)) warn.push('Слова-приманки: «оплата», «выплата», «бонус», «разблокировка»')
  if (host.split('.').length > 3 || (host.match(/-/g)?.length ?? 0) >= 2) warn.push('Длинный составной домен — так маскируют подделки')

  if (danger.length) return { level: 'danger', host, reasons: [...danger, ...warn] }
  if (warn.length) return { level: 'warn', host, reasons: isOfficial ? ['Официальный домен банка', ...warn] : warn }
  if (isOfficial) return { level: 'safe', host, reasons: ['Официальный домен банка', 'Соединение защищено (https)'] }
  return {
    level: 'warn',
    host,
    reasons: ['Явных признаков фишинга нет, но сайт мне неизвестен', 'Не вводите данные карты и коды, если не уверены в сайте'],
  }
}
