import { useEffect, useState, type ReactNode } from 'react'
import { HomeIndicator, StatusBar } from './chrome'
import { OVERLAY_ID } from './overlay'

const FRAME_W = 375 + 20
const FRAME_H = 812 + 20

function useViewport() {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight })
  const [vp, setVp] = useState(read)
  useEffect(() => {
    const on = () => setVp(read())
    window.addEventListener('resize', on)
    on() // окно могло измениться между первым рендером и подпиской

    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

/**
 * На десктопе — рамка iPhone 375×812 (масштабируется под высоту окна) и панель навигатора слева.
 * На телефоне — полноэкранно, без фейкового статус-бара.
 * Структура DOM одинаковая в обоих режимах, чтобы слой оверлея не пересоздавался.
 */
export function PhoneFrame({ children, side }: { children: ReactNode; side?: ReactNode }) {
  const { w, h } = useViewport()
  const phone = w <= 500
  const scale = Math.min(1, (h - 32) / FRAME_H)
  const showSide = !phone && w >= 900

  return (
    <div className={phone ? 'fixed inset-0 bg-white' : 'flex min-h-full items-center justify-center gap-[56px] p-[16px]'}>
      {showSide ? side : null}
      <div style={phone ? { height: '100%' } : { width: FRAME_W * scale, height: FRAME_H * scale, flexShrink: 0 }}>
        <div
          className={phone ? 'h-full' : 'rounded-[44px] bg-[#0c0c0c] p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]'}
          style={phone ? undefined : { width: FRAME_W, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <div className={phone ? 'relative h-full w-full overflow-hidden bg-white' : 'relative h-[812px] w-[375px] overflow-hidden rounded-[34px] bg-white'}>
            <div className="flex h-full flex-col">
              {phone ? <div className="shrink-0" style={{ height: 'max(env(safe-area-inset-top), 10px)' }} /> : <StatusBar />}
              <div className="relative flex-1 overflow-hidden">{children}</div>
            </div>
            {phone ? null : <HomeIndicator />}
            <div id={OVERLAY_ID} className="pointer-events-none absolute inset-0 z-50" />
          </div>
        </div>
      </div>
    </div>
  )
}
