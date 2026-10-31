import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { A } from '../assets'

/** Слой поверх экрана внутри рамки телефона: тосты, плашки и bottom sheets. */
export const OVERLAY_ID = 'phone-overlay'

const ToastCtx = createContext<(text: string) => void>(() => {})

type Banner = { title: string; text: string }
const BannerCtx = createContext<(b: Banner) => void>(() => {})

const BANNER_MS = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const show = useCallback((text: string) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), text })
    timer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  // bump растёт при повторном показе той же плашки — она «встряхивается», а не выезжает заново
  const [banner, setBanner] = useState<(Banner & { bump: number }) | null>(null)
  const bannerTimer = useRef<number | undefined>(undefined)
  const hideBanner = useCallback(() => {
    window.clearTimeout(bannerTimer.current)
    setBanner(null)
  }, [])
  const showBanner = useCallback((b: Banner) => {
    window.clearTimeout(bannerTimer.current)
    setBanner((prev) => ({ ...b, bump: prev ? prev.bump + 1 : 0 }))
    bannerTimer.current = window.setTimeout(() => setBanner(null), BANNER_MS)
  }, [])

  return (
    <ToastCtx.Provider value={show}>
      <BannerCtx.Provider value={showBanner}>
        {children}
      </BannerCtx.Provider>
      <OverlayPortal>
        <AnimatePresence>
          {banner && (
            <motion.div
              key="banner"
              role="status"
              className="pointer-events-auto absolute inset-x-[10px] top-[max(10px,env(safe-area-inset-top))] z-[70] cursor-pointer touch-none"
              initial={{ y: '-140%' }}
              animate={{ y: 0 }}
              exit={{ y: '-140%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.7, bottom: 0.08 }}
              onDragEnd={(_, info) => info.offset.y < -24 && hideBanner()}
              onClick={hideBanner}
            >
              <motion.div
                key={banner.bump}
                initial={banner.bump ? { x: 0 } : false}
                animate={banner.bump ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
                transition={{ duration: 0.35 }}
                className="overflow-hidden rounded-[22px] bg-gradient-to-br from-[#003a96] via-[#004fc6] to-[#2f7bff] px-[16px] pb-[10px] pt-[14px] text-white shadow-[0_16px_40px_rgba(0,40,120,0.4)]"
              >
                <div className="flex items-start gap-[12px]">
                  <img alt="" src={A.iconShieldBanner} className="-my-[6px] -ml-[4px] size-[64px] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-t16 font-bold leading-[1.25]">{banner.title}</div>
                    <div className="mt-[5px] text-t12 leading-[1.35] text-white/85">{banner.text}</div>
                  </div>
                </div>
                <span className="mx-auto mt-[10px] block h-[4px] w-[36px] rounded-full bg-white/35" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </OverlayPortal>
      <OverlayPortal>
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-x-[25px] bottom-[96px] z-[60] flex justify-center"
            >
              <div className="rounded-[12px] bg-[#0b1f4d]/92 px-[16px] py-[11px] text-center text-t14 font-semibold text-white shadow-lg">
                {toast.text}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </OverlayPortal>
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)

/** Большая плашка, выезжающая сверху (как системное уведомление). */
export const useBanner = () => useContext(BannerCtx)

function OverlayPortal({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null)
  useEffect(() => setEl(document.getElementById(OVERLAY_ID)), [])
  return el ? createPortal(children, el) : null
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  return (
    <OverlayPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            className="pointer-events-auto absolute inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button aria-label="Закрыть" className="absolute inset-0 cursor-default bg-black/35" onClick={onClose} />
            <motion.div
              role="dialog"
              aria-label={title}
              className="relative max-h-[85%] overflow-y-auto rounded-t-[24px] bg-white px-[25px] pb-[34px] pt-[10px]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            >
              <div className="mx-auto mb-[14px] h-[5px] w-[40px] rounded-full bg-toggle-off" />
              <h2 className="mb-[12px] text-t20 font-bold">{title}</h2>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </OverlayPortal>
  )
}
