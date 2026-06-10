import type { PackType } from '../../lib/packLogic'
import { mathVictoryCoins } from '../../lib/awardProfileCoins'

export interface FlagLevelPackReward {
  type: PackType
  label: string
}

/** Pack à chaque 3★ (drapeaux uniquement, refarm). */
const THREE_STAR_PACKS: Partial<Record<number, FlagLevelPackReward>> = {
  2: { type: 'simple', label: 'pack simple' },
  3: { type: 'gold', label: 'pack or' },
}

export function flagLevelPackReward(levelId: number): FlagLevelPackReward | undefined {
  return THREE_STAR_PACKS[levelId]
}

/** Drapeaux : 3 🪙 à chaque victoire 3★ ; sinon delta d'étoiles (première progression). */
export function flagsVictoryCoins(previousStars: number, stars: 0 | 1 | 2 | 3): number {
  if (stars === 3) return 3
  return mathVictoryCoins(previousStars, stars)
}

export function flagsPackOnThreeStars(levelId: number, stars: 0 | 1 | 2 | 3): boolean {
  return stars === 3 && flagLevelPackReward(levelId) !== undefined
}
