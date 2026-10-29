import { useState } from 'react'
import { motion } from 'motion/react'
import { A } from '../../assets'
import { duoClues, duoSchemes, duoSides, type DuoSide } from '../../data/games/duo'
import { PrimaryButton, Segmented } from '../../ui/kit'
import { Explain, GameIntro, GameResult, GameScreen, useFinishGame } from './GameKit'

const suspiciousTotal = duoClues.filter((c) => c.suspicious).length

/** «Дело на двоих»: улики с вашего телефона и телефона мамы — отметьте подозрительные и назовите схему. */
export function DuoCase() {
  const finish = useFinishGame('duo')
  const [phase, setPhase] = useState<'intro' | 'clues' | 'scheme' | 'result'>('intro')
  const [side, setSide] = useState<DuoSide>('mama')
  const [seen, setSeen] = useState<DuoSide[]>(['mama'])
  const [marked, setMarked] = useState<string[]>([])
  const [scheme, setScheme] = useState<string | null>(null)
  const [result, setResult] = useState({ score: 0, gain: 0 })

  const start = () => {
    setSide('mama')
    setSeen(['mama'])
    setMarked([])
    setScheme(null)
    setPhase('clues')
  }

  const toggle = (id: string) => setMarked((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]))

  const submit = (schemeId: string) => {
    setScheme(schemeId)
    const right = duoClues.filter((c) => c.suspicious && marked.includes(c.id)).length
    const wrong = duoClues.filter((c) => !c.suspicious && marked.includes(c.id)).length
    const clueScore = Math.max(0, (right - wrong) / suspiciousTotal)
    const schemeOk = duoSchemes.find((s) => s.id === schemeId)?.correct ?? false
    const score = clueScore * 0.6 + (schemeOk ? 0.4 : 0)
    setResult({ score, gain: finish(score) })
    setPhase('result')
  }

  if (phase === 'intro')
    return (
      <GameScreen title="Дело на двоих">
        <GameIntro
          bg="#aedbff"
          icon={<img alt="" src={A.iconTrust} className="size-[96px]" />}
          title="Раскройте схему вместе с близким"
          text="Маме пишут с незнакомого номера. Посмотрите улики на её телефоне и на своём, отметьте подозрительные и назовите схему."
          onStart={start}
        />
      </GameScreen>
    )

  if (phase === 'result') {
    const ok = duoSchemes.find((s) => s.id === scheme)?.correct
    return (
      <GameScreen title="Дело на двоих">
        <GameResult
          score={result.score}
          gain={result.gain}
          title={ok ? 'Дело раскрыто!' : 'Схема не распознана'}
          text={ok ? 'Вы с мамой вовремя распознали фейкового родственника.' : 'Это была схема «Мама, я попал в беду».'}
          onReplay={start}
        >
          <div className="flex flex-col gap-[7px]">
            <h3 className="text-t16 font-bold">Разбор улик</h3>
            {duoClues.map((c) => {
              const right = c.suspicious === marked.includes(c.id)
              return <Explain key={c.id} ok={right} title={`${c.suspicious ? 'Подозрительно' : 'Нормально'}: ${c.text}`} text={c.why} />
            })}
          </div>
        </GameResult>
      </GameScreen>
    )
  }

  if (phase === 'scheme')
    return (
      <GameScreen title="Дело на двоих">
        <h2 className="pt-[16px] text-t24 font-bold">Какая это схема?</h2>
        <p className="mt-[6px] text-t14">Вы отметили {marked.length} {marked.length === 1 ? 'улику' : 'улик(и)'}. Осталось назвать схему.</p>
        <div className="mt-[16px] flex flex-col gap-[7px]">
          {duoSchemes.map((s) => (
            <button key={s.id} onClick={() => submit(s.id)} className="rounded-[15px] border border-line px-[15px] py-[14px] text-left text-t14 font-semibold active:bg-light">
              {s.text}
            </button>
          ))}
        </div>
      </GameScreen>
    )

  const clues = duoClues.filter((c) => c.side === side)
  const bothSeen = seen.length === duoSides.length
  return (
    <GameScreen title="Дело на двоих">
      <div className="pt-[6px]">
        <Segmented
          value={side}
          options={duoSides.map((s) => ({ id: s.id, label: s.title }))}
          onChange={(v) => {
            setSide(v)
            setSeen((s) => (s.includes(v) ? s : [...s, v]))
          }}
        />
      </div>
      <p className="mt-[12px] text-t14 text-muted">Нажмите на улику, чтобы отметить её как подозрительную.</p>
      <motion.div key={side} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="mt-[10px] flex flex-col gap-[7px]">
        {clues.map((c) => {
          const on = marked.includes(c.id)
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`rounded-[15px] border px-[15px] py-[12px] text-left transition-colors ${on ? 'border-danger bg-[#fff1f1]' : 'border-line bg-white'}`}
            >
              <div className="flex items-center justify-between text-t12 text-muted">
                <span>{c.source}</span>
                {on && <span className="font-bold text-danger">Подозрительно</span>}
              </div>
              <div className="mt-[4px] text-t14">{c.text}</div>
            </button>
          )
        })}
      </motion.div>
      <div className="mt-[16px]">
        {bothSeen ? (
          <PrimaryButton onClick={() => setPhase('scheme')}>Назвать схему</PrimaryButton>
        ) : (
          <PrimaryButton
            variant="soft"
            onClick={() => {
              const other = duoSides.find((s) => !seen.includes(s.id))!.id
              setSide(other)
              setSeen((s) => [...s, other])
            }}
          >
            Посмотреть второй телефон
          </PrimaryButton>
        )}
      </div>
    </GameScreen>
  )
}
