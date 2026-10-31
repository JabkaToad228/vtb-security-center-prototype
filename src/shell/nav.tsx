import { useLayoutEffect, useMemo } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { caseById } from '../data/cases'

/**
 * Навигация приложения поверх react-router.
 *
 * Проблема «назад ведёт не туда» возникала из-за того, что `navigate(-1)` идёт в предыдущую
 * запись истории браузера, а не туда, откуда пользователь пришёл логически. Стоило нажать
 * таб «Сервисы» или «К играм» (это были обычные push) — и в истории появлялись дубли и петли.
 *
 * Правила здесь такие:
 *  - `go(to)`        — переход вперёд (push). «Назад» вернёт ровно сюда.
 *  - `back()`        — на экран, с которого пришли; если истории нет (прямая ссылка,
 *                      перезагрузка) — на логического родителя экрана.
 *  - `returnTo(to)`  — «вернуться к экрану, который уже есть в цепочке»: откатывает историю
 *                      до него, а не добавляет новую запись. Так работают «К играм», таб
 *                      «Сервисы» и «Сбросить демо» — петли `games → game → games` невозможны.
 *  - `jump(to)`      — телепорт для панели навигатора: «назад» ведёт к родителю экрана.
 *
 * Чтобы `returnTo` знал, что лежит в истории, `NavTracker` ведёт стек путей по индексу записи.
 */

const STORAGE_KEY = 'vtb-nav-stack'

function loadStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map((p) => (typeof p === 'string' ? p : '')) : []
  } catch {
    return []
  }
}

/** Путь каждой записи истории по её индексу. Переживает перезагрузку вместе с историей вкладки. */
const stack: string[] = loadStack()

function saveStack() {
  try {
    // дыры в разреженном массиве превращаем в '' — иначе индексы съедут после JSON
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(stack, (p) => p ?? '')))
  } catch {
    // приватный режим — работаем без сохранения
  }
}

/**
 * Открытие приложения всегда начинается с главного экрана, как у нативного приложения:
 * браузер мог восстановить вкладку на `#/trust` или прислать старую ссылку с хэшем.
 * Исключения: возврат кнопками истории (страница уже была открыта) и явная ссылка
 * для слайдов `?open=/games` — она открывает экран, а «назад» ведёт к его родителю.
 * Вызывается до создания роутера.
 */
export function startOnHome() {
  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  if (entry?.type === 'back_forward') return
  const params = new URLSearchParams(window.location.search)
  const open = params.get('open')
  params.delete('open')
  const query = params.toString()
  const target = open && open.startsWith('/') ? open : '/'
  stack.length = 0
  saveStack()
  window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}#${target}`)
}

const historyIndex = () => (window.history.state as { idx?: number } | null)?.idx ?? 0
const fullPath = (l: { pathname: string; search: string }) => l.pathname + l.search

type NavState = { parent?: string } | null

/** Логический родитель экрана: куда вести «назад», когда истории за спиной нет. */
export function parentOf(path: string): string | null {
  const pathname = path.split('?')[0]
  if (pathname === '/') return null
  if (pathname.startsWith('/games/')) return '/games'
  if (pathname.startsWith('/trust/')) return '/trust'
  if (pathname.startsWith('/case/')) {
    let id = pathname.slice('/case/'.length)
    try {
      id = decodeURIComponent(id)
    } catch {
      // битая ссылка вида /case/%E0 — ищем как есть, «назад» не должен падать
    }
    const c = caseById(id)
    if (c && c.owner !== 'me') return `/trust/${c.owner}`
    return c?.riskEventId ? '/risk' : '/history'
  }
  return '/'
}

/** Пока переход не завершился, повторные тапы игнорируются: двойной тап не перескакивает экран. */
let locked = false
let lockTimer: number | undefined
function lock() {
  locked = true
  window.clearTimeout(lockTimer)
  lockTimer = window.setTimeout(() => (locked = false), 600)
}
function unlock() {
  locked = false
  window.clearTimeout(lockTimer)
}

/** Записывает путь в стек на каждом переходе. Рендерится один раз внутри роутера. */
export function NavTracker() {
  const location = useLocation()
  const type = useNavigationType()
  useLayoutEffect(() => {
    const idx = historyIndex()
    // новая запись отбрасывает «вперёд» — так же поступает и браузер
    if (type === 'PUSH') stack.length = idx
    stack[idx] = fullPath(location)
    saveStack()
    unlock()
  }, [location, type])
  return null
}

export type Nav = {
  go: (to: string) => void
  back: () => void
  returnTo: (target: string) => void
  jump: (to: string) => void
}

export function useNav(): Nav {
  const navigate = useNavigate()
  const location = useLocation()
  const path = fullPath(location)
  const parent = (location.state as NavState)?.parent

  return useMemo(() => {
    const replaceWith = (to: string) => navigate(to, { replace: true, state: { parent: parentOf(to) ?? undefined } })

    const returnTo = (target: string) => {
      if (locked || target === path) return
      lock()
      const cur = historyIndex()
      for (let j = cur - 1; j >= 0; j--) {
        if (stack[j] === target) return navigate(j - cur)
      }
      replaceWith(target)
    }

    return {
      go(to) {
        if (locked || to === path) return
        lock()
        navigate(to)
      },

      back() {
        if (locked) return
        if (parent) return returnTo(parent)
        lock()
        if (historyIndex() > 0) return navigate(-1)
        const p = parentOf(path)
        if (p) replaceWith(p)
      },

      returnTo,

      jump(to) {
        if (locked || to === path) return
        if (to === '/') return returnTo('/')
        lock()
        // телепорт поверх телепорта заменяет запись, чтобы стек не пух за время презентации
        navigate(to, { replace: !!parent, state: { parent: parentOf(to) ?? undefined } })
      },
    }
  }, [navigate, path, parent])
}
