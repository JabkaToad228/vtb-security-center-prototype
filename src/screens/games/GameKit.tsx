import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import type { GameId } from '../../data/games'
import { Header } from '../../shell/chrome'
import { useStore } from '../../state/store'
import { healthPercent } from '../../state/selectors'
import { PrimaryButton } from '../../ui/kit'

export function GameScreen({ title, children, top }: { title: string; children: ReactNode; top?: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <Header title={title} gear={false} />
      {top}
      <div className="no-scrollbar relative flex-1 overflow-y-auto px-[25px] pb-[calc(30px+env(safe-area-inset-bottom))]">{children}</div>
    </div>
  )
}

export function ProgressDots({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex gap-[3px] px-[25px] pb-[10px]">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-[5px] flex-1 rounded-[30px] border border-brand transition-colors ${i < done ? 'bg-brand' : ''}`} />
      ))}
    </div>
  )
}

/** Сохраняет лучший результат и возвращает прирост «цифрового здоровья». */
export function useFinishGame(id: GameId) {
  const { state, dispatch } = useStore()
  return (score: number) => {
    const before = healthPercent(state)
    const after = healthPercent({ ...state, games: { ...state.games, [id]: Math.max(state.games[id], Math.min(1, score)) } })
    dispatch({ type: 'gameScore', id, score })
    return after - before
  }
}

export function GameResult({
  score,
  gain,
  title,
  text,
  children,
  onReplay,
}: {
  score: number
  gain: number
  title: string
  text: string
  children?: ReactNode
  onReplay: () => void
}) {
  const navigate = useNavigate()
  const pct = Math.round(score * 100)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pt-[10px]">
      <div className="mx-auto grid size-[120px] place-items-center rounded-full border-[10px] border-brand bg-light">
        <span className="text-t30 font-bold text-brand">{pct}%</span>
      </div>
      <h2 className="mt-[16px] text-center text-t24 font-bold">{title}</h2>
      <p className="mt-[6px] text-center text-t16">{text}</p>
      <div className="mx-auto mt-[12px] w-fit rounded-[10px] bg-light px-[12px] py-[6px] text-t14 font-semibold text-brand">
        {gain > 0 ? `+${gain}% к цифровому здоровью` : 'Цифровое здоровье: лучший результат сохранён'}
      </div>
      {children && <div className="mt-[20px]">{children}</div>}
      <div className="mt-[20px] flex flex-col gap-[7px]">
        <PrimaryButton onClick={onReplay}>Сыграть ещё</PrimaryButton>
        <PrimaryButton variant="soft" onClick={() => navigate('/games')}>
          К играм
        </PrimaryButton>
      </div>
    </motion.div>
  )
}

export function GameIntro({ icon, bg, title, text, onStart, cta = 'Начать' }: { icon: ReactNode; bg: string; title: string; text: string; onStart: () => void; cta?: string }) {
  return (
    <div className="pt-[24px] text-center">
      <div className="mx-auto grid size-[110px] place-items-center rounded-[28px]" style={{ background: bg }}>
        {icon}
      </div>
      <h2 className="mt-[18px] text-t24 font-bold">{title}</h2>
      <p className="mt-[8px] text-t16">{text}</p>
      <PrimaryButton className="mt-[24px]" onClick={onStart}>
        {cta}
      </PrimaryButton>
    </div>
  )
}

export function Explain({ ok, title, text }: { ok: boolean; title: string; text: string }) {
  return (
    <div className={`rounded-[15px] px-[15px] py-[12px] ${ok ? 'bg-[#eef9ef]' : 'bg-[#fff1f1]'}`}>
      <div className={`text-t14 font-bold ${ok ? 'text-ok' : 'text-danger'}`}>{title}</div>
      <p className="mt-[3px] text-t14">{text}</p>
    </div>
  )
}
