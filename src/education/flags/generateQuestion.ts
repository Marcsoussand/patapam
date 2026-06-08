import type { FlagCountry, FlagQuestion } from '../../types/flags'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Tirage d'une question : 1 pays cible + N-1 leurres dans le panel. */
export function generateFlagQuestion(
  countries: FlagCountry[],
  choiceCount: number,
): FlagQuestion | null {
  if (countries.length < choiceCount || choiceCount < 2) return null

  const promptCountry = countries[Math.floor(Math.random() * countries.length)]
  const distractors = shuffle(countries.filter((c) => c.id !== promptCountry.id)).slice(
    0,
    choiceCount - 1,
  )

  return {
    promptCountry,
    choices: shuffle([promptCountry, ...distractors]),
  }
}
