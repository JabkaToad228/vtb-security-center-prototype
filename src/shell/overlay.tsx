import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

/** Слой поверх экрана внутри рамки телефона: тосты и bottom sheets. */
export const OVERLAY_ID = 'phone-overlay'

const ToastCtx = createContext<(text: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const show = useCallback((text: string) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), text })
    timer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
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
