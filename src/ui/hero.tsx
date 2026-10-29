import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { A } from '../assets'

/** Кольцо прогресса как Group 24 в Figma: серый трек + синяя дуга от 12 часов по часовой. */
function Ring({ box, r, stroke, pct }: { box: number; r: number; stroke: number; pct: number }) {
  const c = box / 2
  const len = 2 * Math.PI * r
  return (
    <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} fill="none" className="absolute">
      <circle cx={c} cy={c} r={r} stroke="#F6F6F8" strokeWidth={stroke} />
      <motion.circle
        cx={c}
        cy={c}
        r={r}
        stroke="#004FC6"
        strokeWidth={stroke}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        strokeDasharray={len}
        initial={false}
        animate={{ strokeDashoffset: len * (1 - Math.max(0.001, Math.min(1, pct / 100))) }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

/** Стеклянный круг: белый 20% + размытие того, что под ним (даёт мягкое свечение дуг). */
function Glass({ x, y, w, h, alpha = 0.2 }: { x: number; y: number; w: number; h: number; alpha?: number }) {
  return (
    <div
      className="absolute rounded-full"
      style={{ left: x, top: y, width: w, height: h, background: `rgba(255,255,255,${alpha})`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    />
  )
}

/** Декоративная дуга-ассет: обёртка w×h, внутри повёрнутый блок iw×ih, картинка с отступом -pad. */
function Arc({ src, x, y, w, h, iw, ih, transform, pad }: { src: string; x: number; y: number; w: number; h: number; iw: number; ih: number; transform: string; pad: number }) {
  return (
    <div className="absolute flex items-center justify-center" style={{ left: x, top: y, width: w, height: h }}>
      <div className="relative flex-none" style={{ width: iw, height: ih, transform }}>
        <img alt="" src={src} className="absolute" style={{ left: -pad, top: -pad }} />
      </div>
    </div>
  )
}

/** Frame 17: щит в кольце «N% защиты настроено». */
export function ProtectionHero({ pct }: { pct: number }) {
  return (
    <div className="relative mx-auto size-[201px]" style={{ transform: 'translateX(0.5px)' }}>
      <Arc src={A.heroLgTrack} x={18.43} y={18.43} w={164} h={164} iw={164} ih={164} transform="rotate(-90deg)" pad={7} />
      <Arc src={A.heroLgArc} x={0} y={0} w={200.86} h={200.86} iw={164} ih={164} transform="rotate(165deg)" pad={7} />
      <Glass x={12.43} y={11.43} w={177} h={177} />
      <img alt="" src={A.iconShield} className="absolute size-[148px]" style={{ left: 26.43, top: 28.43 }} />
      <div className="absolute" style={{ left: 11.43, top: 11.43 }}>
        <Ring box={178} r={82} stroke={14} pct={pct} />
      </div>
    </div>
  )
}

/** Frame 18/19: иконка в мягком голубом свечении. */
export function HeroBadge({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto h-[123px] w-[116px]" style={{ transform: 'translateX(0.5px)' }}>
      <Arc src={A.heroSmTrack} x={11} y={11} w={95} h={100} iw={100} ih={95} transform="rotate(-90deg)" pad={7} />
      <Arc src={A.heroSmArc} x={0} y={0} w={116} h={123} iw={95.107} ih={100.056} transform="rotate(164.14deg) skewX(-1.68deg)" pad={7} />
      <Glass x={0} y={4} w={116} h={115} />
      <div className="absolute left-[58px] top-[61.4px] -translate-x-1/2 -translate-y-1/2">{children}</div>
    </div>
  )
}

/** Frame 22: кольцо «Ваше цифровое здоровье». */
export function HealthHero({ pct }: { pct: number }) {
  return (
    <div className="relative mx-auto size-[140px]" style={{ transform: 'translateX(-1.2px)' }}>
      <Arc src={A.heroGamesTrack} x={13.71} y={13} w={114} h={114} iw={114} ih={114} transform="rotate(-90deg)" pad={5} />
      <Arc src={A.heroGamesTrack} x={12.71} y={13} w={114} h={114} iw={114} ih={114} transform="rotate(-90deg)" pad={5} />
      <Arc src={A.heroGamesArc} x={0} y={0} w={140} h={140} iw={114.31} ih={114.31} transform="rotate(165deg)" pad={5} />
      <Glass x={8.71} y={8} w={124} h={123} />
      <Glass x={7.71} y={8} w={124} h={123} />
      <div className="absolute" style={{ left: 8.44, top: 7.85 }}>
        <Ring box={124.31} r={57.15} stroke={10} pct={pct} />
      </div>
      <div className="absolute" style={{ left: 7.36, top: 7.85 }}>
        <Ring box={124.31} r={57.15} stroke={10} pct={pct} />
      </div>
      <span className="absolute left-[71.2px] top-[70px] -translate-x-1/2 -translate-y-1/2 text-t36 font-bold text-brand">{pct}%</span>
    </div>
  )
}
