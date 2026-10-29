import { useNavigate } from 'react-router-dom'
import { games } from '../data/games'
import { Screen } from '../shell/Screen'
import { useStore } from '../state/store'
import { healthPercent } from '../state/selectors'
import { HealthHero } from '../ui/hero'
import { BelieveTile, DuoTile, OnCallTile, PatrolTile } from '../ui/tiles'

/** Frame 22 — «Игры для безопасности». */
export function GamesHub() {
  const navigate = useNavigate()
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
        <PatrolTile title="Фрод-патруль" subtitle="Найдите ловушки на экране" done={done('patrol')} onClick={() => navigate(games.patrol.route)} />
        <OnCallTile title="На связи" subtitle="Разговор меняется от ваших решений" done={done('oncall')} onClick={() => navigate(games.oncall.route)} />
        <DuoTile title="Дело на двоих" subtitle="Раскройте схему вместе с близким" done={done('duo')} onClick={() => navigate(games.duo.route)} />
        <BelieveTile title="Верю — не верю" subtitle="Проверьте интуицию за минуту" done={done('believe')} onClick={() => navigate(games.believe.route)} />
      </div>
    </Screen>
  )
}
