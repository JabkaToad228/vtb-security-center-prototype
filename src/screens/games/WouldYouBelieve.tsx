import { useState } from 'react'
import { motion } from 'motion/react'
import { quizSituations } from '../../data/games/quiz'
import { useStore } from '../../state/store'
import { PrimaryButton } from '../../ui/kit'
import { GameScreen, ProgressDots } from './GameKit'
import { useNav } from '../../shell/nav'

/** «А вы бы поверили?» — баннер с главной: 5 ситуаций, у каждой своя уловка. */
export function WouldYouBelieve() {
  const { returnTo } = useNav()
  const { state, dispatch } = useStore()
  const firstOpen = quizSituations.findIndex((q) => !state.quizDone.includes(q.id))
  const [idx, setIdx] = useState(firstOpen === -1 ? 0 : firstOpen)
  const [answer, setAnswer] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)
  const q = quizSituations[idx]

  const reveal = (believed: boolean) => {
    setAnswer(believed)
    dispatch({ type: 'quizDone', id: q.id, total: quizSituations.length })
  }

  const next = () => {
    setAnswer(null)
    if (idx + 1 < quizSituations.length) setIdx(idx + 1)
    else setFinished(true)
  }

  if (finished)
    return (
      <GameScreen title="А вы бы поверили?">
        <div className="pt-[30px] text-center">
          <h2 className="text-t24 font-bold">Все 5 ситуаций пройдены</h2>
          <p className="mt-[8px] text-t16">Теперь вы знаете главные уловки мошенников. Поделитесь ими с близкими.</p>
          <div className="mt-[24px] flex flex-col gap-[7px]">
            <PrimaryButton onClick={() => returnTo('/games')}>Другие игры</PrimaryButton>
            <PrimaryButton
              variant="soft"
              onClick={() => {
                setIdx(0)
                setFinished(false)
              }}
            >
              Пройти заново
            </PrimaryButton>
          </div>
        </div>
      </GameScreen>
    )

  return (
    <GameScreen
      title="А вы бы поверили?"
      top={
        <div>
          <div className="px-[25px] pb-[8px] text-t14">
            Ситуация {idx + 1} из {quizSituations.length} · пройдено {state.quizDone.length}
          </div>
          <ProgressDots total={quizSituations.length} done={state.quizDone.length} />
        </div>
      }
    >
      <motion.div key={q.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="pt-[10px]">
        <div className="rounded-[15px] bg-light px-[16px] py-[16px]">
          <div className="text-t12 font-semibold text-brand">{q.title}</div>
          <p className="mt-[6px] text-t16">{q.story}</p>
        </div>

        {answer === null ? (
          <>
            <h3 className="mt-[20px] text-center text-t16 font-bold">Вы бы поверили?</h3>
            <div className="mt-[10px] flex gap-[7px]">
              <PrimaryButton variant="soft" onClick={() => reveal(true)}>
                Поверил бы
              </PrimaryButton>
              <PrimaryButton onClick={() => reveal(false)}>Не поверил бы</PrimaryButton>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-[16px]">
            <div className={`rounded-[15px] px-[15px] py-[12px] ${answer ? 'bg-[#fff1f1]' : 'bg-[#eef9ef]'}`}>
              <div className={`text-t14 font-bold ${answer ? 'text-danger' : 'text-ok'}`}>{answer ? 'Это мошенники' : 'Правильно, это мошенники'}</div>
              <p className="mt-[4px] text-t14">
                <b>Уловка:</b> {q.trick}
              </p>
              <p className="mt-[4px] text-t14">
                <b>Как защититься:</b> {q.tip}
              </p>
            </div>
            <PrimaryButton className="mt-[10px]" onClick={next}>
              {idx + 1 < quizSituations.length ? 'Следующая ситуация' : 'Завершить'}
            </PrimaryButton>
          </motion.div>
        )}
      </motion.div>
    </GameScreen>
  )
}
