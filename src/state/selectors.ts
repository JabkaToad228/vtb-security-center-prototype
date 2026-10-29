import { checklist, EVENT_WEIGHT, PROTECTION_BASE, riskEvents } from '../data/risk'
import { games, HEALTH_BASE, type GameId } from '../data/games'
import { personOrder } from '../data/people'
import type { State } from './store'

export function protectionPercent(s: State) {
  const items = checklist.reduce((sum, c) => sum + (s.checklist[c.id] ? c.weight : 0), 0)
  const events = riskEvents.reduce((sum, e) => sum + (s.events[e.id] === 'open' ? 0 : EVENT_WEIGHT), 0)
  return Math.min(100, PROTECTION_BASE + items + events)
}

export function healthPercent(s: State) {
  const sum = (Object.keys(games) as GameId[]).reduce((acc, id) => acc + games[id].weight * s.games[id], 0)
  return Math.min(100, Math.round(HEALTH_BASE + sum))
}

export const openEvents = (s: State) => riskEvents.filter((e) => s.events[e.id] === 'open')

export const recommendations = (s: State) => checklist.filter((c) => !s.checklist[c.id]).length

export const activeHelpers = (s: State) => personOrder.filter((id) => s.helpers[id].enabled).length

export function plural(n: number, forms: [string, string, string]) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return forms[1]
  return forms[2]
}
