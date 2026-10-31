import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { firstFlag, RECORD_NOTE, recordings, type CallRecording } from '../../data/games/record'
import { CheckDot, PrimaryButton } from '../../ui/kit'
import { Explain, GameIntro, GameResult, GameScreen, ProgressDots, useFinishGame } from './GameKit'

type Phase = 'intro' | 'play' | 'debrief' | 'result'

/** Сколько «звучит» реплика: длинные фразы держатся дольше. */
const lineDelay = (text: string) => Math.min(3400, 900 + text.length * 26)

/**
 * Насколько вовремя игрок положил трубку. `stop` — индекс последней прозвучавшей реплики,
 * null — дослушал разговор до конца.
 */
function scoreFor(r: CallRecording, stop: number | null) {
  if (stop === null) return 0
  const f = firstFlag(r)
  if (stop < f) return 0.6
  return Math.max(0.2, 1 - (stop - f) * 0.2)
}

function verdict(r: CallRecording, stop: number | null) {
  const f = r.lines[firstFlag(r)]
  // строчной делаем только первую букву, чтобы не превратить «SMS» в «sms»
  const flag = f.flag ? f.flag[0].toLowerCase() + f.flag.slice(1) : ''
  const hint = `Первый тревожный сигнал — на ${f.at}: ${flag}.`
  if (stop === null) return { ok: false, title: 'Вы дослушали до конца', text: hint }
  const s = scoreFor(r, stop)
  if (stop < firstFlag(r)) return { ok: true, title: 'Осторожно — и правильно', text: `Явных признаков ещё не было, но перестраховаться не вредно. ${hint}` }
  if (s >= 0.8) return { ok: true, title: 'Вовремя!', text: `Вы положили трубку, как только прозвучал подвох. ${hint}` }
  return { ok: false, title: 'Можно было раньше', text: hint }
}

/** «Запись звонка»: расшифровка разговора идёт в реальном времени — нажмите «Стоп», как только поймёте, что это мошенники. */
export function CallRecord() {
  const finish = useFinishGame('record')
  const [phase, setPhase] = useState<Phase>('intro')
  const [rec, setRec] = useState(0)
  const [shown, setShown] = useState(1)
  const [stop, setStop] = useState<number | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const [result, setResult] = useState({ score: 0, gain: 0 })
  const bottom = useRef<HTMLDivElement>(null)
  const r = recordings[rec]

  const hangUp = (at: number | null) => {
    setStop(at)
    setScores((s) => [...s, scoreFor(r, at)])
    setPhase('debrief')
  }

  // Реплики «звучат» по одной; дослушали до конца — разговор закончился без вас.
  useEffect(() => {
    if (phase !== 'play') return
    const t =
      shown >= r.lines.length
        ? window.setTimeout(() => hangUp(null), 1600)
        : window.setTimeout(() => setShown((n) => n + 1), lineDelay(r.lines[shown - 1].text))
    return () => window.clearTimeout(t)
  }, [phase, shown, rec])

  useEffect(() => {
    const box = bottom.current?.closest('.overflow-y-auto')
    box?.scrollTo({ top: phase === 'play' ? box.scrollHeight : 0, behavior: phase === 'play' ? 'smooth' : 'auto' })
  }, [shown, phase])

  const startRecording = (i: number) => {
    setRec(i)
    setShown(1)
    setStop(null)
    setPhase('play')
  }

  const start = () => {
    setScores([])
    startRecording(0)
  }

  const next = () => {
    if (rec + 1 < recordings.length) return startRecording(rec + 1)
    const score = scores.reduce((a, b) => a + b, 0) / scores.length
    setResult({ score, gain: finish(score) })
    setPhase('result')
  }

  if (phase === 'intro')
    return (
      <GameScreen title="Запись звонка">
        <GameIntro
          bg="linear-gradient(135deg, #0b1f4d, #004fc6)"
          icon={
            <div className="w-[78px] overflow-hidden">
              <Wave playing />
            </div>
          }
          title="Остановите мошенника"
          text={`${recordings.length} расшифровки звонков клиентам банка. Реплики появляются по ходу разговора — нажмите «Стоп», как только поймёте, что звонят мошенники. Чем раньше, тем лучше.`}
          onStart={start}
        />
        <p className="mt-[12px] text-center text-t12 text-muted">{RECORD_NOTE}</p>
      </GameScreen>
    )

  if (phase === 'result')
    return (
      <GameScreen title="Запись звонка">
        <GameResult
          score={result.score}
          gain={result.gain}
          title={result.score >= 0.8 ? 'Вы бы не попались' : result.score >= 0.5 ? 'Почти вовремя' : 'Мошенники успели бы'}
          text="Чем раньше положить трубку, тем меньше мошенники успевают узнать и внушить."
          onReplay={start}
        />
      </GameScreen>
    )

  const debrief = phase === 'debrief'
  const v = verdict(r, stop)
  const lines = debrief ? r.lines : r.lines.slice(0, shown)

  return (
    <GameScreen
      title="Запись звонка"
      top={
        <div>
          <div className="px-[25px] pb-[8px] text-t14">
            Запись {rec + 1} из {recordings.length} · {r.title}
          </div>
          <ProgressDots total={recordings.length} done={rec + (debrief ? 1 : 0)} />
        </div>
      }
    >
      <div className="relative mt-[6px] overflow-hidden rounded-[15px] bg-gradient-to-r from-[#0b1f4d] to-[#004fc6] px-[14px] py-[12px] text-white">
        <div className="flex items-center gap-[8px] text-t12">
          <motion.span
            className="size-[8px] rounded-full bg-[#ff4d4f]"
            animate={debrief ? { opacity: 1 } : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: debrief ? 0 : Infinity }}
          />
          <span className="font-semibold">{debrief ? 'Запись остановлена' : 'Идёт запись'}</span>
          <span className="ml-auto text-white/70">
            {r.client} · {r.duration}
          </span>
        </div>
        <div className="mt-[10px]">
          <Wave playing={!debrief} />
        </div>
      </div>

      {debrief && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-[12px]">
          <Explain ok={v.ok} title={v.title} text={v.text} />
        </motion.div>
      )}

      <div className="mt-[12px] flex flex-col gap-[8px]">
        {lines.map((l, i) => {
          const muted = debrief && stop !== null && i > stop
          return (
            <motion.div
              key={`${r.id}-${i}`}
              initial={debrief ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: muted ? 0.45 : 1, y: 0 }}
              className={l.who === 'client' ? 'ml-auto max-w-[82%]' : 'max-w-[90%]'}
            >
              <div className={`mb-[2px] flex gap-[6px] text-t10 ${l.who === 'client' ? 'justify-end' : ''} text-muted`}>
                <span>{l.at}</span>
                <span className="font-semibold">{l.who === 'client' ? r.client.split(',')[0] : l.role}</span>
              </div>
              <div
                className={`rounded-[16px] px-[13px] py-[9px] text-t14 ${
                  l.who === 'client' ? 'rounded-br-[4px] bg-light' : 'rounded-bl-[4px] bg-[#f1f3f6]'
                } ${debrief && l.flag ? 'ring-2 ring-danger' : ''}`}
              >
                {l.text}
              </div>
              {debrief && l.flag && (
                <div className="mt-[4px] flex items-start gap-[6px] text-t12 font-semibold text-danger">
                  <span className="mt-[1px] grid size-[15px] shrink-0 place-items-center rounded-full bg-danger text-[10px] text-white">!</span>
                  {l.flag}
                </div>
              )}
              {debrief && stop === i && (
                <div className="mt-[8px] rounded-[8px] bg-brand px-[10px] py-[4px] text-center text-t12 font-bold text-white">Здесь вы положили трубку</div>
              )}
            </motion.div>
          )
        })}
      </div>

      {debrief && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-[16px] flex flex-col gap-[10px]">
          <div className="rounded-[15px] bg-[#fff1f1] px-[15px] py-[12px]">
            <div className="text-t14 font-bold text-danger">Чем закончилось</div>
            <p className="mt-[3px] text-t14">{r.ending}</p>
          </div>
          <div className="rounded-[15px] bg-light px-[15px] py-[12px]">
            <div className="text-t14 font-bold">Где вмешался бы Центр безопасности</div>
            <ul className="mt-[6px] flex flex-col gap-[6px]">
              {r.withUs.map((w) => (
                <li key={w} className="flex items-start gap-[8px] text-t14">
                  <span className="mt-[2px]">
                    <CheckDot checked />
                  </span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-center text-t12 text-muted">{RECORD_NOTE}</p>
        </motion.div>
      )}

      <div ref={bottom} className="sticky bottom-0 -mx-[25px] mt-[14px] bg-gradient-to-t from-white from-70% to-white/0 px-[25px] pb-[4px] pt-[12px]">
        {debrief ? (
          <PrimaryButton onClick={next}>{rec + 1 < recordings.length ? 'Следующая запись' : 'Результат'}</PrimaryButton>
        ) : (
          <div className="flex gap-[7px]">
            <button
              onClick={() => hangUp(shown - 1)}
              className="flex h-[48px] flex-1 items-center justify-center rounded-[12px] bg-danger text-t16 font-bold text-white active:bg-[#b00000]"
            >
              Стоп! Это мошенник
            </button>
            <button
              aria-label="Следующая реплика"
              disabled={shown >= r.lines.length}
              onClick={() => setShown((n) => Math.min(r.lines.length, n + 1))}
              className="h-[48px] w-[64px] rounded-[12px] bg-light text-[18px] font-bold text-brand disabled:opacity-40"
            >
              ▸▸
            </button>
          </div>
        )}
      </div>
    </GameScreen>
  )
}

/** Звуковая волна из столбиков: «играет», пока идёт запись. */
function Wave({ playing }: { playing: boolean }) {
  const bars = [0.5, 0.8, 0.35, 1, 0.6, 0.9, 0.4, 0.75, 0.55, 1, 0.45, 0.7, 0.3, 0.85, 0.6, 0.95, 0.4, 0.65, 0.8, 0.5]
  return (
    <div className="flex h-[28px] items-center justify-center gap-[3px]">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] origin-center rounded-full bg-white/90 ${playing ? 'animate-[wave_1.1s_ease-in-out_infinite]' : ''}`}
          style={{ height: `${h * 100}%`, animationDelay: `${(i % 7) * 0.12}s`, transform: playing ? undefined : 'scaleY(0.35)' }}
        />
      ))}
    </div>
  )
}
