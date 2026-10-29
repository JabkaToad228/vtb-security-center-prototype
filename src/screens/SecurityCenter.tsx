import { useNavigate } from 'react-router-dom'
import { A } from '../assets'
import { quizSituations } from '../data/games/quiz'
import { Screen } from '../shell/Screen'
import { useStore } from '../state/store'
import { activeHelpers, healthPercent, plural, protectionPercent, recommendations } from '../state/selectors'
import { ProtectionHero } from '../ui/hero'
import { AssistantTile, HistoryTile, RiskTile, TrustTile } from '../ui/tiles'

/** Frame 17 — главный экран «Центр безопасности». */
export function SecurityCenter() {
  const navigate = useNavigate()
  const { state } = useStore()
  const pct = protectionPercent(state)
  const recs = recommendations(state)
  const helpers = activeHelpers(state)
  const quizDone = state.quizDone.length
  const quizTotal = quizSituations.length

  return (
    <Screen title="Центр безопасности" logo>
      <div className="mt-[4px]">
        <ProtectionHero pct={pct} />
      </div>
      <h2 className="text-center text-t24 font-bold">{pct}% защиты настроено</h2>
      <p className="mx-auto mt-[5.5px] max-w-[316px] text-center text-t16">
        {pct >= 100 ? 'Все шаги выполнены. Вы и ваши финансы под защитой' : 'Осталось несколько шагов. Обезопась себя и свои финансы'}
      </p>

      <div className="mt-[30.5px] grid grid-cols-2 gap-[7px]">
        <RiskTile
          title="Риск-профиль"
          subtitle={recs ? `${recs} ${plural(recs, ['рекомендация', 'рекомендации', 'рекомендаций'])}` : 'Всё настроено'}
          onClick={() => navigate('/risk')}
        />
        <TrustTile
          title="Круг доверия"
          subtitle={`${helpers} ${plural(helpers, ['близкий', 'близких', 'близких'])} на связи`}
          onClick={() => navigate('/trust')}
        />
        <AssistantTile title="AI-помощник" subtitle="Узнать возможности" onClick={() => navigate('/assistant')} />
        <HistoryTile title="История защиты" subtitle="Обновлено вчера" onClick={() => navigate('/history')} />
      </div>

      <button onClick={() => navigate('/quiz')} className="relative mt-[7px] block h-[64px] w-full overflow-hidden rounded-[10px] bg-light text-left active:bg-sky">
        <span className="absolute left-[15px] top-[8px] text-t14 font-bold">А вы бы поверили?</span>
        <span className="absolute left-[15px] top-[25px] text-t12">Узнай уловку мошенников</span>
        <span className="absolute left-[15px] top-[51px] flex gap-[2px]">
          {quizSituations.map((q, i) => (
            <span key={q.id} className={`h-[5px] w-[17px] rounded-[30px] border border-brand ${i < quizDone ? 'bg-brand' : ''}`} />
          ))}
        </span>
        <span className="absolute left-[113px] top-[48px] text-t8">
          Пройдено {quizDone} из {quizTotal} ситуаций
        </span>
        <img alt="" src={A.chevronBanner} className="absolute right-[14px] top-[11.6px]" />
      </button>

      <button onClick={() => navigate('/games')} className="relative mt-[7px] flex h-[64px] w-full items-center overflow-hidden rounded-[10px] bg-brand text-left text-white active:bg-[#003f9e]">
        <span className="ml-[15px] flex flex-col">
          <span className="text-t14 font-bold">Игры для безопасности</span>
          <span className="mt-[1px] text-t12">Цифровое здоровье: {healthPercent(state)}%</span>
        </span>
        <img alt="" src={A.chevronBanner} className="absolute right-[14px] top-[24.6px] brightness-0 invert" />
      </button>
    </Screen>
  )
}
