import type { MathGradeTrack, MathLevelDefinition } from '../types/math'
import { KITA_ALEPH_MATH_LEVELS } from './math/kitaAleph'
import { KITA_BET_MATH_LEVELS } from './math/kitaBet'
import { KITA_DALET_MATH_LEVELS } from './math/kitaDalet'
import { KITA_GIMEL_MATH_LEVELS } from './math/kitaGimel'
import { KITA_HE_MATH_LEVELS } from './math/kitaHe'

export { KITA_ALEPH_MATH_LEVELS } from './math/kitaAleph'
export { KITA_BET_MATH_LEVELS } from './math/kitaBet'
export { KITA_GIMEL_MATH_LEVELS } from './math/kitaGimel'
export { KITA_DALET_MATH_LEVELS } from './math/kitaDalet'
export { KITA_HE_MATH_LEVELS } from './math/kitaHe'

const TRACK_LEVELS = {
  kita_aleph: KITA_ALEPH_MATH_LEVELS,
  kita_bet: KITA_BET_MATH_LEVELS,
  kita_gimel: KITA_GIMEL_MATH_LEVELS,
  kita_dalet: KITA_DALET_MATH_LEVELS,
  kita_he: KITA_HE_MATH_LEVELS,
} as const

export function mathLevelsForTrack(track: MathGradeTrack): MathLevelDefinition[] {
  return TRACK_LEVELS[track] ?? []
}

export function mathLevelKey(track: MathGradeTrack, levelId: string): string {
  return `${track}:${levelId}`
}

export function getMathLevel(track: MathGradeTrack, levelNum: number): MathLevelDefinition | undefined {
  const levels = mathLevelsForTrack(track)
  return levels.find((l) => l.index === levelNum - 1)
}
