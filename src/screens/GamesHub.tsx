import { A } from '../assets'
import { games } from '../data/games'
import { Screen } from '../shell/Screen'
import { useStore } from '../state/store'
import { healthPercent } from '../state/selectors'
import { HealthHero } from '../ui/hero'
import { Glow } from '../ui/kit'
import { BelieveTile, DuoTile, OnCallTile, PatrolTile } from '../ui/tiles'
import { useNav } from '../shell/nav'

/** Frame 22 — «Игры для безопасности». */
export function GamesHub() {
  const { go } = useNav()
  const { state } = useStore()
  const done = (id: keyof typeof games) => state.games[id] >= 1

  return (
    <Screen title="Игры для безопасности">
      <div className="-mt-[5px]">
        <HealthHero pct={healthPercent(state)} />
      </div>
      <h2 className="-mx-[20px] whitespace-nowrap text-center text-t24 font-bold">Ваше цифровое здоровье</h2>
      <p className="mx-auto mt-[20.5px] max-w-[308px] text-center text-t16">Учитесь безопасности в формате игр и получайте бонусы на связь</p>

      <div className="mt-[15.5px] grid grid-cols-2 gap-[7px]">
        <PatrolTile title="Фрод-патруль" subtitle="Найдите ловушки на экране" done={done('patrol')} onClick={() => go(games.patrol.route)} />
        <OnCallTile title="На связи" subtitle="Разговор меняется от ваших решений" done={done('oncall')} onClick={() => go(games.oncall.route)} />
        <DuoTile title="Дело на двоих" subtitle="Раскройте схему вместе с близким" done={done('duo')} onClick={() => go(games.duo.route)} />
        <BelieveTile title="Верю — не верю" subtitle="Проверьте интуицию за минуту" done={done('believe')} onClick={() => go(games.believe.route)} />
      </div>

      <button
        onClick={() => go(games.record.route)}
        className="relative mt-[7px] flex h-[76px] w-full items-center overflow-hidden rounded-[15px] bg-gradient-to-r from-[#0b1f4d] to-[#004fc6] pl-[16px] pr-[40px] text-left text-white transition-transform active:scale-[0.98]"
      >
        <Glow src={A.glowMidB} x="calc(100% - 40px)" y={8} />
        <span className="relative grid size-[44px] shrink-0 place-items-center rounded-full bg-white/15">
          <span className="flex h-[18px] items-center gap-[2px]">
            {[0.5, 1, 0.7, 0.9, 0.4].map((h, i) => (
              <span key={i} className="w-[3px] rounded-full bg-white" style={{ height: `${h * 100}%` }} />
            ))}
          </span>
        </span>
        <span className="relative ml-[12px] flex flex-col">
          <span className="flex items-center gap-[6px] text-t14 font-bold">
            Запись звонка
            <span className="rounded-[6px] bg-white/20 px-[6px] py-[1px] text-t10 font-semibold">новое</span>
          </span>
          <span className="mt-[2px] text-t12 text-white/85">Остановите мошенника по расшифровке разговора</span>
        </span>
        <img alt="" src={A.chevronBanner} className="absolute right-[16px] top-1/2 -translate-y-1/2 brightness-0 invert" />
        {done('record') && <span className="absolute right-[36px] top-[8px] text-t10 font-semibold text-white/80">пройдено</span>}
      </button>
    </Screen>
  )
}
