import type { MathLevelDefinition } from '../../types/math'

export function compareLevel(
  index: number,
  id: string,
  mode: 'max' | 'min',
  min: number,
  max: number,
  titleFr: string,
  titleEn: string,
  titleHe: string,
): MathLevelDefinition {
  return {
    id,
    index,
    gameType: mode === 'max' ? 'compare_max' : 'compare_min',
    titleFr,
    titleEn,
    titleHe,
    implemented: true,
    questions: 5,
    config: { kind: 'compare', min, max, mode },
  }
}

export function placeholderLevel(
  index: number,
  id: string,
  gameType: MathLevelDefinition['gameType'],
  titleFr: string,
  titleEn: string,
  titleHe: string,
  config: MathLevelDefinition['config'],
): MathLevelDefinition {
  return {
    id,
    index,
    gameType,
    titleFr,
    titleEn,
    titleHe,
    implemented: false,
    questions: 5,
    config,
  }
}
