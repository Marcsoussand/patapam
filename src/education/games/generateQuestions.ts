import type { CompareQuestion } from '../types/math'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateCompareQuestions(
  count: number,
  min: number,
  max: number,
  mode: 'max' | 'min',
): CompareQuestion[] {
  const questions: CompareQuestion[] = []
  const seen = new Set<string>()

  while (questions.length < count) {
    let a = randInt(min, max)
    let b = randInt(min, max)
    while (a === b) {
      b = randInt(min, max)
    }
    const key = [a, b].sort((x, y) => x - y).join('-')
    if (seen.has(key)) continue
    seen.add(key)
    questions.push({
      a,
      b,
      correct: mode === 'max' ? Math.max(a, b) : Math.min(a, b),
    })
  }

  return questions
}
