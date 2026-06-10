import type { PackType } from '../../lib/packLogic'

export interface FlagLevelPackReward {
  type: PackType
  label: string
}

/** Pack offert au premier 3★ du niveau (drapeaux uniquement). */
const THREE_STAR_PACKS: Partial<Record<number, FlagLevelPackReward>> = {
  2: { type: 'simple', label: 'pack simple' },
  3: { type: 'gold', label: 'pack or' },
}

export function flagLevelPackReward(levelId: number): FlagLevelPackReward | undefined {
  return THREE_STAR_PACKS[levelId]
}

/** Pièces = delta d'étoiles (mathVictoryCoins) ; pack = premier passage à 3★. */
export function earnsFlagPackAtThreeStars(levelId: number, previousStars: number): boolean {
  return previousStars < 3 && flagLevelPackReward(levelId) !== undefined
}
