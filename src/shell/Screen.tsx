import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { Header } from './chrome'
import { Sheet, useToast } from './overlay'
import { useStore } from '../state/store'
import { healthPercent, protectionPercent } from '../state/selectors'
import { PrimaryButton } from '../ui/kit'

const SettingsCtx = createContext<() => void>(() => {})
export const useOpenSettings = () => useContext(SettingsCtx)

/** Шестерёнка в шапке открывает настройки с кнопкой сброса демо. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { state, dispatch } = useStore()
  const toast = useToast()
  const location = useLocation()
  // Системное «назад» не должно оставлять настройки висеть поверх другого экрана.
  useEffect(() => setOpen(false), [location.key])
  return (
    <SettingsCtx.Provider value={() => setOpen(true)}>
      {children}
      <Sheet open={open} onClose={() => setOpen(false)} title="Настройки защиты">
        <div className="mb-[16px] grid grid-cols-2 gap-[7px]">
          <Stat value={`${protectionPercent(state)}%`} label="защиты настроено" />
          <Stat value={`${healthPercent(state)}%`} label="цифровое здоровье" />
        </div>
        <p className="mb-[16px] text-t14 text-muted">
          Это прототип для кейс-чемпионата: все данные вымышлены, ответы AI-помощника подготовлены заранее. Прогресс сохраняется в этом браузере.
        </p>
        <PrimaryButton
          onClick={() => {
            dispatch({ type: 'reset' })
            setOpen(false)
            toast('Демо сброшено к состоянию макета')
          }}
        >
          Сбросить демо
        </PrimaryButton>
      </Sheet>
    </SettingsCtx.Provider>
  )
}

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="rounded-[15px] bg-light px-[14px] py-[12px]">
    <div className="text-t24 font-bold text-brand">{value}</div>
    <div className="text-t12">{label}</div>
  </div>
)

type ScreenProps = {
  title: string
  children: ReactNode
  back?: boolean
  logo?: boolean
  gear?: boolean
  right?: ReactNode
  /** Отступ снизу под плавающий таббар. */
  bottom?: number
  pad?: boolean
}

/** Прокрутка каждой записи истории: вернулись «назад» — оказались там же, где ушли. */
const scrollMemory = new Map<string, number>()

function useScrollMemory(ref: RefObject<HTMLDivElement>) {
  const { key } = useLocation()
  const type = useNavigationType()
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (type === 'POP') el.scrollTop = scrollMemory.get(key) ?? 0
    const save = () => scrollMemory.set(key, el.scrollTop)
    el.addEventListener('scroll', save, { passive: true })
    return () => {
      // cleanup layout-эффекта идёт до удаления узла из DOM, так что позиция ещё читается
      save()
      el.removeEventListener('scroll', save)
    }
  }, [key, type, ref])
}

export function Screen({ title, children, back, logo, gear, right, bottom = 108, pad = true }: ScreenProps) {
  const openSettings = useOpenSettings()
  const scroller = useRef<HTMLDivElement>(null)
  useScrollMemory(scroller)
  return (
    <div ref={scroller} className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain bg-white">
      <Header title={title} back={back} logo={logo} gear={gear} onGear={openSettings} right={right} />
      <div className={pad ? 'px-[25px]' : ''} style={{ paddingBottom: `calc(${bottom}px + env(safe-area-inset-bottom))` }}>
        {children}
      </div>
    </div>
  )
}
