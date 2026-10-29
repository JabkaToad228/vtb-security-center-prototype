import { useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { A } from '../../assets'
import { patrolLevels, type PatrolLevel, type PatrolLine } from '../../data/games/patrol'
import { useToast } from '../../shell/overlay'
import { PrimaryButton } from '../../ui/kit'
import { Explain, GameIntro, GameResult, GameScreen, ProgressDots, useFinishGame } from './GameKit'

const totalTraps = patrolLevels.reduce((n, l) => n + l.lines.filter((x) => x.trap).length, 0)

/** «Фрод-патруль»: найдите ловушки на фейковом экране. */
export function FraudPatrol() {
  const finish = useFinishGame('patrol')
  const toast = useToast()
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro')
  const [level, setLevel] = useState(0)
  const [found, setFound] = useState<string[]>([])
  const [revealed, setRevealed] = useState<string[]>([])
  const [misses, setMisses] = useState(0)
  const [shake, setShake] = useState(0)
  const [result, setResult] = useState({ score: 0, gain: 0 })

  const lvl = patrolLevels[level]
  const traps = lvl.lines.filter((l) => l.trap)
  const key = (l: PatrolLine) => `${lvl.id}:${l.id}`
  const levelFound = traps.filter((t) => found.includes(key(t)) || revealed.includes(key(t))).length
  const levelDone = levelFound === traps.length

  const start = () => {
    setLevel(0)
    setFound([])
    setRevealed([])
    setMisses(0)
    setPhase('play')
  }

  const tap = (l: PatrolLine) => {
    if (levelDone) return
    const k = key(l)
    if (l.trap) {
      if (!found.includes(k)) setFound((f) => [...f, k])
    } else {
      setMisses((m) => m + 1)
      setShake((s) => s + 1)
      toast('Здесь всё в порядке')
    }
  }

  const next = () => {
    if (level + 1 < patrolLevels.length) return setLevel(level + 1)
    const score = Math.max(0, (found.length - misses * 0.25) / totalTraps)
    setResult({ score, gain: finish(score) })
    setPhase('result')
  }

  if (phase === 'intro')
    return (
      <GameScreen title="Фрод-патруль">
        <GameIntro
          bg="#004fc6"
          icon={<img alt="" src={A.iconChatSearch} className="translate-x-[10px]" />}
          title="Найдите ловушки на экране"
          text={`${patrolLevels.length} поддельных экрана: SMS, страница оплаты и сообщение «из ЦБ». Нажимайте на всё, что выдаёт мошенников. Лишние нажатия снижают результат.`}
          onStart={start}
        />
      </GameScreen>
    )

  if (phase === 'result')
    return (
      <GameScreen title="Фрод-патруль">
        <GameResult
          score={result.score}
          gain={result.gain}
          title={result.score >= 0.8 ? 'Зоркий глаз!' : 'Хороший патруль'}
          text={`Найдено ${found.length} из ${totalTraps} ловушек · лишних нажатий: ${misses}`}
          onReplay={start}
        />
      </GameScreen>
    )

  return (
    <GameScreen
      title="Фрод-патруль"
      top={
        <div>
          <div className="flex items-center justify-between px-[25px] pb-[8px] text-t14">
            <span>
              Уровень {level + 1} из {patrolLevels.length} · {lvl.title}
            </span>
            <span className="font-bold text-brand">
              {levelFound}/{traps.length}
            </span>
          </div>
          <ProgressDots total={traps.length} done={levelFound} />
        </div>
      }
    >
      <motion.div key={shake} animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : undefined} transition={{ duration: 0.3 }}>
        <FakeScreen level={lvl} isFound={(l) => found.includes(key(l))} isRevealed={(l) => revealed.includes(key(l))} onTap={tap} />
      </motion.div>

      <div className="mt-[14px]">
        {levelDone ? (
          <>
            <Explain ok title="Все ловушки найдены" text={traps.map((t) => t.trap).join('. ') + '.'} />
            <PrimaryButton className="mt-[10px]" onClick={next}>
              {level + 1 < patrolLevels.length ? 'Следующий уровень' : 'Результат'}
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton variant="soft" onClick={() => setRevealed((r) => [...r, ...traps.map(key)])}>
            Показать оставшиеся ловушки
          </PrimaryButton>
        )}
      </div>
    </GameScreen>
  )
}

function FakeScreen({
  level,
  isFound,
  isRevealed,
  onTap,
}: {
  level: PatrolLevel
  isFound: (l: PatrolLine) => boolean
  isRevealed: (l: PatrolLine) => boolean
  onTap: (l: PatrolLine) => void
}) {
  const T = ({ l, children, className = '' }: { l: PatrolLine; children: ReactNode; className?: string }) => {
    const hit = isFound(l)
    const shown = hit || isRevealed(l)
    return (
      <button onClick={() => onTap(l)} className={`block w-full rounded-[8px] px-[6px] py-[3px] text-left transition-colors ${shown ? (hit ? 'bg-[#fff1f1] ring-2 ring-danger' : 'bg-[#fff7e6] ring-2 ring-[#e3a008]') : ''} ${className}`}>
        {children}
        {shown && <span className="mt-[3px] block text-t12 font-semibold text-danger">{l.trap}</span>}
      </button>
    )
  }

  if (level.screen === 'sms')
    return (
      <div className="overflow-hidden rounded-[20px] border border-line bg-[#f7f8fa]">
        <div className="border-b border-divider bg-white px-[12px] py-[10px] text-center">
          <div className="mx-auto grid size-[34px] place-items-center rounded-full bg-toggle-off text-t14 font-bold text-muted">?</div>
          {level.lines.filter((l) => l.id === 'from').map((l) => <T key={l.id} l={l} className="mt-[4px] text-center text-t12 text-muted">{l.text}</T>)}
        </div>
        <div className="p-[12px]">
          <div className="max-w-[88%] rounded-[16px] rounded-bl-[4px] bg-white p-[8px] shadow-sm">
            {level.lines
              .filter((l) => l.kind !== 'meta')
              .map((l) => (
                <T key={l.id} l={l} className={l.kind === 'link' ? 'text-t14 text-brand underline' : 'text-t14'}>
                  {l.text}
                </T>
              ))}
          </div>
          {level.lines.filter((l) => l.id === 'time').map((l) => <T key={l.id} l={l} className="mt-[4px] text-t12 text-muted">{l.text}</T>)}
        </div>
      </div>
    )

  if (level.screen === 'web')
    return (
      <div className="overflow-hidden rounded-[20px] border border-line bg-white">
        <div className="flex items-center gap-[6px] bg-[#f1f3f6] px-[10px] py-[8px]">
          <span className="text-t12">🔒</span>
          {level.lines.filter((l) => l.kind === 'meta').map((l) => <T key={l.id} l={l} className="flex-1 rounded-[8px] bg-white text-t12">{l.text}</T>)}
        </div>
        <div className="flex flex-col gap-[6px] p-[12px]">
          {level.lines
            .filter((l) => l.kind !== 'meta')
            .map((l) => {
              if (l.kind === 'title') return <T key={l.id} l={l} className="text-t16 font-bold">{l.text}</T>
              if (l.kind === 'field')
                return (
                  <T key={l.id} l={l}>
                    <span className="block text-t12 text-muted">{l.label}</span>
                    <span className="mt-[2px] block rounded-[8px] border border-line px-[10px] py-[7px] text-t14 text-muted">{l.text}</span>
                  </T>
                )
              if (l.kind === 'timer') return <T key={l.id} l={l} className="text-center text-t12 font-semibold text-danger">{l.text}</T>
              if (l.kind === 'button')
                return (
                  <T key={l.id} l={l}>
                    <span className="block rounded-[10px] bg-[#2bb673] py-[9px] text-center text-t14 font-bold text-white">{l.text}</span>
                  </T>
                )
              return <T key={l.id} l={l} className="text-t14">{l.text}</T>
            })}
        </div>
      </div>
    )

  return (
    <div className="overflow-hidden rounded-[20px] border border-line bg-[#eef3f8]">
      <div className="flex items-center gap-[8px] bg-white px-[12px] py-[8px]">
        <span className="grid size-[32px] shrink-0 place-items-center rounded-full bg-brand text-t12 font-bold text-white">ЦБ</span>
        {level.lines.filter((l) => l.id === 'who').map((l) => <T key={l.id} l={l} className="flex-1 text-t14 font-semibold">{l.text}</T>)}
      </div>
      <div className="flex flex-col gap-[6px] p-[12px]">
        {level.lines
          .filter((l) => l.kind !== 'meta')
          .map((l) => (
            <div key={l.id} className="max-w-[90%] rounded-[14px] rounded-tl-[4px] bg-white p-[4px] shadow-sm">
              {l.kind === 'file' ? (
                <T l={l} className="text-t14">
                  <span className="flex items-center gap-[8px]">
                    <span className="grid size-[30px] place-items-center rounded-[8px] bg-[#e3f5e5] text-t10 font-bold text-ok">APK</span>
                    {l.text}
                  </span>
                </T>
              ) : (
                <T l={l} className="text-t14">{l.text}</T>
              )}
            </div>
          ))}
        {level.lines.filter((l) => l.id === 'time').map((l) => <T key={l.id} l={l} className="text-t12 text-muted">{l.text}</T>)}
      </div>
    </div>
  )
}
