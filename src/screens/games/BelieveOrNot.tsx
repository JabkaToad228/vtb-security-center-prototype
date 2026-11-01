import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { BELIEVE_SECONDS, believeCards, type BelieveCard } from '../../data/games/believe'
import { PrimaryButton } from '../../ui/kit'
import { A } from '../../assets'
import { Explain, GameIntro, GameResult, GameScreen, ProgressDots, useFinishGame } from './GameKit'

type Answer = { card: BelieveCard; correct: boolean }

/** «Верю — не верю»: свайп карточек-сообщений на время. */
export function BelieveOrNot() {
  const finish = useFinishGame('believe')
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro')
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [left, setLeft] = useState(BELIEVE_SECONDS)
  const [feedback, setFeedback] = useState<Answer | null>(null)
  const [result, setResult] = useState({ score: 0, gain: 0 })

  const end = (list: Answer[]) => {
    const score = list.filter((a) => a.correct).length / believeCards.length
    setResult({ score, gain: finish(score) })
    setPhase('result')
  }

  useEffect(() => {
    if (phase !== 'play') return
    if (left <= 0) return end(answers)
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
    // end и answers берутся из рендера, в котором таймер дошёл до нуля
  }, [phase, left])

  const start = () => {
    setIdx(0)
    setAnswers([])
    setLeft(BELIEVE_SECONDS)
    setFeedback(null)
    setPhase('play')
  }

  const answer = (believe: boolean) => {
    if (feedback) return
    const card = believeCards[idx]
    const a = { card, correct: believe === !card.scam }
    setAnswers((prev) => [...prev, a])
    setFeedback(a)
  }

  const next = () => {
    setFeedback(null)
    if (idx + 1 >= believeCards.length) end(answers)
    else setIdx(idx + 1)
  }

  if (phase === 'result') {
    const mistakes = answers.filter((a) => !a.correct)
    const correct = answers.length - mistakes.length
    return (
      <GameScreen title="Верю — не верю">
        <GameResult
          score={result.score}
          gain={result.gain}
          title={result.score >= 0.8 ? 'Отличная интуиция!' : result.score >= 0.5 ? 'Неплохо!' : 'Есть над чем поработать'}
          text={`Верно ${correct} из ${believeCards.length}${answers.length < believeCards.length ? ' — время вышло' : ''}`}
          onReplay={start}
        >
          {mistakes.length > 0 && (
            <div className="flex flex-col gap-[7px]">
              <h3 className="text-t16 font-bold">Разбор ошибок</h3>
              {mistakes.map((m) => (
                <Explain key={m.card.id} ok={false} title={m.card.scam ? 'Это мошенники' : 'Это было безопасно'} text={`${m.card.text} — ${m.card.explain}`} />
              ))}
            </div>
          )}
        </GameResult>
      </GameScreen>
    )
  }

  if (phase === 'intro')
    return (
      <GameScreen title="Верю — не верю">
        <GameIntro
          bg="#165fcf"
          icon={<img alt="" src={A.iconCheckRing} />}
          title="Проверьте интуицию за минуту"
          text={`${believeCards.length} сообщений и звонков. Смахните вправо — «Верю», влево — «Не верю». Успейте за ${BELIEVE_SECONDS} секунд.`}
          onStart={start}
        />
      </GameScreen>
    )

  const card = believeCards[idx]
  return (
    <GameScreen
      title="Верю — не верю"
      top={
        <div>
          <div className="flex items-center justify-between px-[25px] pb-[8px] text-t14">
            <span>
              {idx + 1} / {believeCards.length}
            </span>
            <span className={`font-bold ${left <= 10 ? 'text-danger' : 'text-brand'}`}>0:{String(left).padStart(2, '0')}</span>
          </div>
          <ProgressDots total={believeCards.length} done={answers.length} />
        </div>
      }
    >
      <div className="relative mt-[10px] h-[250px]">
        <AnimatePresence>
          <SwipeCard key={card.id} card={card} locked={!!feedback} onAnswer={answer} />
        </AnimatePresence>
      </div>

      {feedback ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-[14px]">
          <Explain ok={feedback.correct} title={feedback.correct ? 'Верно!' : 'Ошибка'} text={`${feedback.card.scam ? 'Мошенники. ' : 'Безопасно. '}${feedback.card.explain}`} />
          <PrimaryButton className="mt-[10px]" onClick={next}>
            {idx + 1 >= believeCards.length ? 'Результат' : 'Дальше'}
          </PrimaryButton>
        </motion.div>
      ) : (
        <div className="mt-[14px] flex gap-[7px]">
          <PrimaryButton variant="soft" className="text-danger!" onClick={() => answer(false)}>
            ← Не верю
          </PrimaryButton>
          <PrimaryButton onClick={() => answer(true)}>Верю →</PrimaryButton>
        </div>
      )}
    </GameScreen>
  )
}

function SwipeCard({ card, locked, onAnswer }: { card: BelieveCard; locked: boolean; onAnswer: (believe: boolean) => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-160, 160], [-12, 12])
  const yes = useTransform(x, [20, 100], [0, 1])
  const no = useTransform(x, [-100, -20], [1, 0])
  return (
    <motion.div
      className="absolute inset-0 flex cursor-grab touch-pan-y flex-col rounded-[20px] border border-line bg-white p-[18px] shadow-[0_10px_30px_rgba(0,79,198,0.12)] active:cursor-grabbing"
      style={{ x, rotate }}
      drag={locked ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 90) onAnswer(true)
        else if (info.offset.x < -90) onAnswer(false)
      }}
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <motion.span style={{ opacity: yes }} className="absolute right-[16px] top-[16px] rounded-[8px] border-2 border-brand px-[8px] py-[2px] text-t14 font-bold text-brand">
        ВЕРЮ
      </motion.span>
      <motion.span style={{ opacity: no }} className="absolute left-[16px] top-[16px] rounded-[8px] border-2 border-danger px-[8px] py-[2px] text-t14 font-bold text-danger">
        НЕ ВЕРЮ
      </motion.span>
      <span className="mt-[30px] w-fit rounded-[6px] bg-light px-[8px] py-[3px] text-t12 font-semibold text-brand">{card.channel}</span>
      <span className="mt-[10px] text-t14 font-bold">{card.from}</span>
      <p className="mt-[8px] text-t16">{card.text}</p>
    </motion.div>
  )
}
