import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'motion/react'
import { A } from '../assets'
import type { Tone } from '../data/people'

/** Размытое пятно из Figma: SVG натурального размера, центр в (x, y) относительно плитки. */
export function Glow({ src, x, y, rotate = 0, style }: { src: string; x: number | string; y: number; rotate?: number; style?: CSSProperties }) {
  return (
    <img
      alt=""
      src={src}
      className="pointer-events-none absolute"
      style={{ left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate}deg)`, ...style }}
    />
  )
}

export function CheckDot({ checked }: { checked: boolean }) {
  return (
    <span className="relative inline-block size-[15px] shrink-0">
      <img alt="" src={checked ? A.checkFilled : A.checkEmpty} className="absolute inset-0" />
      {checked && <img alt="" src={A.checkMark} className="absolute left-[4px] top-[5px]" />}
    </span>
  )
}

const toneColor: Record<Tone, string> = { ok: 'text-ok', danger: 'text-danger', muted: 'text-muted' }

export function StatusLine({ tone, text }: { tone: Tone; text: string }) {
  return (
    <div className="flex items-center gap-[9px]">
      {tone === 'muted' ? (
        <span className="size-[7px] rounded-full bg-muted" />
      ) : (
        <img alt="" src={tone === 'ok' ? A.dotGreen : A.dotRed} />
      )}
      <span className={`text-t14 ${toneColor[tone]}`}>{text}</span>
    </div>
  )
}

export function Avatar({ letter, size }: { letter: string; size: 50 | 70 }) {
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <img alt="" src={size === 50 ? A.avatar50 : A.avatar70} className="absolute inset-0" />
      <span className={`relative font-bold text-brand ${size === 50 ? 'text-t24' : 'text-t36'}`}>{letter}</span>
    </div>
  )
}

export function Toggle({ on, onChange, disabled, label }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative h-[25px] w-[46px] shrink-0 rounded-[60px] transition-colors duration-200 disabled:opacity-50 ${on ? 'bg-brand' : 'bg-toggle-off'}`}
    >
      <motion.img
        alt=""
        src={A.toggleKnob}
        className="absolute top-[2px]"
        initial={false}
        animate={{ left: on ? 23 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  variant = 'solid',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'solid' | 'soft' | 'ghost'
  className?: string
}) {
  const look = {
    solid: 'bg-brand text-white active:bg-[#003f9e]',
    soft: 'bg-light text-black active:bg-sky',
    ghost: 'bg-transparent text-brand text-t12',
  }[variant]
  return (
    <button onClick={onClick} className={`flex h-[40px] w-full items-center justify-center rounded-[10px] text-t16 font-bold transition-colors ${look} ${className}`}>
      {children}
    </button>
  )
}

export function Card({ children, className = '', tone = 'outline' }: { children: ReactNode; className?: string; tone?: 'outline' | 'light' }) {
  return (
    <div className={`relative rounded-[15px] ${tone === 'outline' ? 'border border-line' : 'bg-light'} ${className}`}>{children}</div>
  )
}

/** Голубая строка-переход: «Сценарии помощи», «История защиты». */
export function LinkCard({ icon, title, subtitle, onClick }: { icon: ReactNode; title: string; subtitle: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="relative flex h-[52px] w-full items-center rounded-[10px] bg-light text-left active:bg-sky">
      <span className="absolute left-0 top-0">{icon}</span>
      <span className="ml-[52px] flex flex-col">
        <span className="text-t14 font-bold">{title}</span>
        <span className="mt-[1px] text-t12">{subtitle}</span>
      </span>
      <img alt="" src={A.chevronLg} className="absolute right-[13.5px] top-[15px]" />
    </button>
  )
}

export const BookIcon = () => <img alt="" src={A.iconBook} className="absolute left-[12px] top-[13px]" />
export const TimeIcon = () => <img alt="" src={A.iconTime} className="absolute left-[8px] top-[8px]" />

export function TextLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-[10px] text-t14 font-semibold text-brand">
      {children}
      <img alt="" src={A.chevronSm} />
    </button>
  )
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-[5px]">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`h-[40px] flex-1 rounded-[10px] text-t16 font-bold transition-colors ${value === o.id ? 'bg-brand text-white' : 'bg-light text-black'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Chip({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-[32px] shrink-0 rounded-[16px] px-[14px] text-t14 font-semibold transition-colors ${active ? 'bg-brand text-white' : 'bg-light text-black'}`}
    >
      {children}
    </button>
  )
}

export const Divider = ({ className = '' }: { className?: string }) => <img alt="" src={A.divider} className={`block w-full ${className}`} style={{ height: 1 }} />
