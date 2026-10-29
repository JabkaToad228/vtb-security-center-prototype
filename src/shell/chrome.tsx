import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { A } from '../assets'
import { useToast } from './overlay'

/** Статус-бар iPhone из макета (только в режиме рамки на десктопе). */
export function StatusBar() {
  return (
    <div className="relative h-[44px] w-full shrink-0">
      <span className="absolute left-[21px] top-[13px] w-[54px] text-center text-[14px] font-semibold tracking-[-0.28px] text-ink" style={{ fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif' }}>
        9:41
      </span>
      <img alt="" src={A.statusCellular} className="absolute right-[64.35px] top-[17.67px]" />
      <img alt="" src={A.statusWifi} className="absolute right-[44.03px] top-[17.33px]" />
      <img alt="" src={A.statusBattery} className="absolute right-[14.67px] top-[17.33px]" />
    </div>
  )
}

export function useBack(fallback = '/') {
  const navigate = useNavigate()
  return () => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }
}

/** Шапка экрана: назад · заголовок · шестерёнка (или логотип на главной). Центр строки — y=55 в макете. */
export function Header({ title, back = true, logo, gear = true, onGear, right }: { title: string; back?: boolean; logo?: boolean; gear?: boolean; onGear?: () => void; right?: ReactNode }) {
  const goBack = useBack()
  return (
    <div className="sticky top-0 z-20 h-[36px] shrink-0 bg-white">
      <div className="relative h-[22px]">
        {logo && <img alt="ВТБ" src={A.logoVtb} className="absolute left-[22px] top-[-3px] h-[27px] w-[57px] object-cover" />}
        {back && !logo && (
          <button aria-label="Назад" onClick={goBack} className="absolute left-[12px] top-[-11px] grid h-[44px] w-[36px] place-items-center">
            <img alt="" src={A.arrowBack} className="rotate-180" />
          </button>
        )}
        <h1 className="absolute inset-x-[64px] top-1/2 -translate-y-1/2 truncate text-center text-t16 font-bold">{title}</h1>
        {right ??
          (gear && (
            <button aria-label="Настройки" onClick={onGear} className="absolute right-[13px] top-[-11px] grid size-[44px] place-items-center">
              <img alt="" src={A.iconGear} className="h-[19px] w-[18px]" />
            </button>
          ))}
      </div>
    </div>
  )
}

const tabs = [
  { id: 'home', label: 'Главная', x: 45.5 },
  { id: 'payments', label: 'Платежи', x: 120.5 },
  { id: 'services', label: 'Сервисы', x: 198 },
  { id: 'profile', label: 'Профиль', x: 276.5 },
] as const

/** Плавающий таббар 325×60 из макета; активна вкладка «Сервисы». */
export function TabBar() {
  const toast = useToast()
  const navigate = useNavigate()
  return (
    <nav className="absolute bottom-[calc(20px+env(safe-area-inset-bottom))] left-1/2 z-30 h-[60px] w-[325px] -translate-x-1/2 rounded-[40px] bg-white shadow-tabbar">
      {tabs.map((t) => {
        const active = t.id === 'services'
        return (
          <button
            key={t.id}
            onClick={() => (active ? navigate('/') : toast('Раздел вне прототипа'))}
            className="absolute top-0 flex h-full w-[60px] -translate-x-1/2 flex-col items-center"
            style={{ left: t.x }}
          >
            <span className="relative mt-[13px] grid h-[22px] w-[28px] place-items-center">
              <TabIcon id={t.id} />
            </span>
            <span className={`absolute top-[38px] text-t8 ${active ? 'text-brand' : 'text-muted'}`}>{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function TabIcon({ id }: { id: (typeof tabs)[number]['id'] }) {
  if (id === 'home') return <img alt="" src={A.tabHome} className="h-[23.5px] w-[21.5px]" />
  if (id === 'payments') return <img alt="" src={A.tabPayments} />
  if (id === 'services')
    return (
      <span className="grid grid-cols-2 gap-[1.58px]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="size-[10.21px] rounded-[2px] bg-brand" />
        ))}
      </span>
    )
  return (
    <span className="relative size-[22px]">
      <img alt="" src={A.tabProfileHead} className="absolute left-1/4 top-0 h-1/2 w-1/2" />
      <img alt="" src={A.tabProfileBody} className="absolute bottom-0 left-[12.5%] h-[41.67%] w-3/4" />
    </span>
  )
}

export const HomeIndicator = () => (
  <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-40 h-[5px] w-[134px] -translate-x-1/2 rounded-[100px] bg-black" />
)
