/** Étoiles drapeaux — paliers explicites par niveau */
export function flagsStarsFromCorrect(
  correct: number,
  thresholds: [number, number, number],
): 0 | 1 | 2 | 3 {
  if (correct >= thresholds[2]) return 3
  if (correct >= thresholds[1]) return 2
  if (correct >= thresholds[0]) return 1
  return 0
}

export { starLabel } from './mathStars'
