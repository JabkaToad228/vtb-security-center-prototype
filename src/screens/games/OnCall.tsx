import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { A } from '../../assets'
import { CALLER, callNodes, DECLINE_END, type CallNode } from '../../data/games/onCall'
import { Explain, GameResult, GameScreen, useFinishGame } from './GameKit'

type Line = { who: 'caller' | 'me'; text: string; flag?: string }
type End = Extract<CallNode, { kind: 'end' }>

/** «На связи»: ветвящийся разговор с «службой безопасности» и подсказками AI во время звонка. */
export function OnCall() {
  const finish = useFinishGame('oncall')
  const [phase, setPhase] = useState<'ringing' | 'talk' | 'result'>('ringing')
  const [nodeId, setNodeId] = useState('start')
  const [lines, setLines] = useState<Line[]>([])
  const [flags, setFlags] = useState<string[]>([])
  const [end, setEnd] = useState<{ node: End; gain: number } | null>(null)
  const [waiting, setWaiting] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const box = bottom.current?.closest('.overflow-y-auto')
    box?.scrollTo({ top: box.scrollHeight, behavior: 'smooth' })
  }, [lines, waiting])

  const node = callNodes[nodeId]

  const enter = (id: string) => {
    const n = callNodes[id]
    setWaiting(false)
    if (n.kind === 'end') return finishWith(n)
    setNodeId(id)
    setLines((l) => [...l, { who: 'caller', text: n.text, flag: n.flag }])
    if (n.flag) setFlags((f) => (f.includes(n.flag!) ? f : [...f, n.flag!]))
  }

  const finishWith = (n: End) => {
    setEnd({ node: n, gain: finish(n.score) })
    setPhase('result')
  }

  const restart = () => {
    setPhase('ringing')
    setNodeId('start')
    setLines([])
    setFlags([])
    setEnd(null)
    setWaiting(false)
  }

  if (phase === 'result' && end)
    return (
      <GameScreen title="На связи">
        <GameResult score={end.node.score} gain={end.gain} title={end.node.title} text={end.node.text} onReplay={restart}>
          {flags.length > 0 && (
            <div className="flex flex-col gap-[7px]">
              <h3 className="text-t16 font-bold">Что заметил AI в разговоре</h3>
              {flags.map((f) => (
                <Explain key={f} ok={false} title="Признак мошенничества" text={f} />
              ))}
            </div>
          )}
        </GameResult>
      </GameScreen>
    )

  if (phase === 'ringing')
    return (
      <div className="absolute inset-0 flex flex-col items-center bg-gradient-to-b from-[#0b1f4d] to-[#004fc6] px-[25px] pb-[60px] pt-[60px] text-white">
        <div className="text-t14 opacity-80">Входящий вызов</div>
        <motion.div
          className="mt-[24px] grid size-[96px] place-items-center rounded-full bg-white/15"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          <img alt="" src={A.iconPhone} className="size-[44px] brightness-0 invert" />
        </motion.div>
        <div className="mt-[20px] text-t24 font-bold">{CALLER.name}</div>
        <div className="mt-[4px] text-t16 opacity-80">{CALLER.number}</div>
        <div className="mt-[18px] rounded-[12px] bg-white/12 px-[14px] py-[10px] text-center text-t14">
          <b>AI-защита:</b> номер не принадлежит банку. Будьте внимательны
        </div>
        <div className="mt-auto flex w-full justify-around">
          <RoundBtn color="#d90000" label="Отклонить" onClick={() => finishWith(DECLINE_END as End)} />
          <RoundBtn color="#00a651" label="Ответить" onClick={() => (setPhase('talk'), enter('start'))} />
        </div>
      </div>
    )

  return (
    <GameScreen
      title="На связи"
      top={
        <div className="mx-[25px] mb-[8px] flex items-center justify-between rounded-[12px] bg-light px-[12px] py-[8px] text-t12">
          <span>
            <b>{CALLER.name}</b> · идёт звонок
          </span>
          <button onClick={() => finishWith(callNodes.endHangUp as End)} className="rounded-[8px] bg-danger px-[10px] py-[4px] font-bold text-white">
            Положить трубку
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-[8px] pt-[4px]">
        <AnimatePresence initial={false}>
          {lines.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={l.who === 'me' ? 'ml-auto max-w-[80%]' : 'max-w-[88%]'}>
              <div className={`rounded-[16px] px-[14px] py-[10px] text-t14 ${l.who === 'me' ? 'rounded-br-[4px] bg-brand text-white' : 'rounded-bl-[4px] bg-[#f1f3f6]'}`}>{l.text}</div>
              {l.flag && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-[4px] flex items-center gap-[6px] text-t12 font-semibold text-danger">
                  <span className="grid size-[16px] place-items-center rounded-full bg-danger text-[10px] text-white">!</span>
                  AI: {l.flag}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {node.kind === 'line' && !waiting && (
        <div className="mt-[16px] flex flex-col gap-[7px]">
          <div className="text-t12 text-muted">Ваш ответ:</div>
          {node.choices.map((c) => (
            <button
              key={c.text}
              onClick={() => {
                setLines((l) => [...l, { who: 'me', text: c.text }])
                setWaiting(true)
                window.setTimeout(() => enter(c.next), 650)
              }}
              className="rounded-[10px] border border-brand px-[14px] py-[10px] text-left text-t14 font-semibold text-brand active:bg-light"
            >
              {c.text}
            </button>
          ))}
        </div>
      )}
      <div ref={bottom} className="h-px" />
    </GameScreen>
  )
}

function RoundBtn({ color, label, onClick }: { color: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[8px]">
      <span className="grid size-[68px] place-items-center rounded-full" style={{ background: color }}>
        <img alt="" src={A.iconPhone} className={`size-[30px] brightness-0 invert ${label === 'Отклонить' ? 'rotate-[135deg]' : ''}`} />
      </span>
      <span className="text-t14">{label}</span>
    </button>
  )
}
