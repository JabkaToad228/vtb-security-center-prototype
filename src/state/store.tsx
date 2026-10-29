import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { HelpToggleId, PersonId } from '../data/people'
import { people } from '../data/people'
import type { ChecklistId, RiskEventId } from '../data/risk'
import type { GameId } from '../data/games'

export type EventStatus = 'open' | 'reviewed' | 'dismissed'

export type State = {
  version: 1
  events: Record<RiskEventId, EventStatus>
  checklist: Record<ChecklistId, boolean>
  helpers: Record<PersonId, { enabled: boolean; toggles: Record<HelpToggleId, boolean> }>
  /** Лучший результат 0..1 по каждой игре. */
  games: Record<GameId, number>
  quizDone: string[]
}

export const initialState: State = {
  version: 1,
  events: { sim: 'open', call: 'open' },
  checklist: { login: false, relatives: true, limit: true, credit: true },
  helpers: {
    mama: { enabled: true, toggles: { ...people.mama.defaultToggles } },
    papa: { enabled: true, toggles: { ...people.papa.defaultToggles } },
  },
  games: { patrol: 0.6, oncall: 0, duo: 0, believe: 0.6, quiz: 0.6 },
  quizDone: ['q1', 'q2', 'q3'],
}

type Action =
  | { type: 'event'; id: RiskEventId; status: EventStatus }
  | { type: 'checklist'; id: ChecklistId; value: boolean }
  | { type: 'helperToggle'; person: PersonId; id: HelpToggleId; value: boolean }
  | { type: 'helperEnabled'; person: PersonId; value: boolean }
  | { type: 'gameScore'; id: GameId; score: number }
  | { type: 'quizDone'; id: string; total: number }
  | { type: 'reset' }

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'event':
      if (s.events[a.id] !== 'open' && a.status !== 'open') return s
      return { ...s, events: { ...s.events, [a.id]: a.status } }
    case 'checklist':
      return { ...s, checklist: { ...s.checklist, [a.id]: a.value } }
    case 'helperToggle': {
      const h = s.helpers[a.person]
      return { ...s, helpers: { ...s.helpers, [a.person]: { ...h, toggles: { ...h.toggles, [a.id]: a.value } } } }
    }
    case 'helperEnabled': {
      const h = s.helpers[a.person]
      return { ...s, helpers: { ...s.helpers, [a.person]: { ...h, enabled: a.value } } }
    }
    case 'gameScore':
      if (a.score <= s.games[a.id]) return s
      return { ...s, games: { ...s.games, [a.id]: Math.min(1, a.score) } }
    case 'quizDone': {
      const quizDone = s.quizDone.includes(a.id) ? s.quizDone : [...s.quizDone, a.id]
      const quiz = Math.max(s.games.quiz, quizDone.length / a.total)
      return { ...s, quizDone, games: { ...s.games, quiz } }
    }
    case 'reset':
      return initialState
  }
}

const KEY = 'vtb-security-center-prototype'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as State
    return parsed.version === initialState.version ? { ...initialState, ...parsed } : initialState
  } catch {
    return initialState
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // приватный режим / заблокированное хранилище — работаем без сохранения
    }
  }, [state])
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside StoreProvider')
  return v
}
