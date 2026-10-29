export type GameId = 'patrol' | 'oncall' | 'duo' | 'believe' | 'quiz'

export type GameMeta = { id: GameId; title: string; route: string; weight: number }

/** База 35% + веса игр (65) = 100%. Начальные результаты дают 59%, как в макете. */
export const HEALTH_BASE = 35

export const games: Record<GameId, GameMeta> = {
  patrol: { id: 'patrol', title: 'Фрод-патруль', route: '/games/patrol', weight: 15 },
  oncall: { id: 'oncall', title: 'На связи', route: '/games/on-call', weight: 15 },
  duo: { id: 'duo', title: 'Дело на двоих', route: '/games/duo', weight: 10 },
  believe: { id: 'believe', title: 'Верю — не верю', route: '/games/believe', weight: 15 },
  quiz: { id: 'quiz', title: 'А вы бы поверили?', route: '/quiz', weight: 10 },
}
