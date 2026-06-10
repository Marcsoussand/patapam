export interface FlagLevelDefinition {
  id: number
  titleFr: string
  /** Nombre de questions (= pays tirés du panel, dans l'ordre seed) */
  questionCount: number
  /** Palier 1★ / 2★ / 3★ (bonnes réponses minimum) */
  starThresholds: [number, number, number]
  /** Nombre de drapeaux proposés par question */
  choiceCount: number
}

export const FLAG_LEVELS: FlagLevelDefinition[] = [
  {
    id: 1,
    titleFr: 'Niveau 1 — 5 drapeaux',
    questionCount: 5,
    starThresholds: [3, 4, 5],
    choiceCount: 2,
  },
  {
    id: 2,
    titleFr: 'Niveau 2 — 10 drapeaux',
    questionCount: 10,
    starThresholds: [6, 8, 10],
    choiceCount: 3,
  },
  {
    id: 3,
    titleFr: 'Niveau 3 — 20 drapeaux',
    questionCount: 20,
    starThresholds: [12, 16, 20],
    choiceCount: 4,
  },
]

export function getFlagLevel(levelNum: number): FlagLevelDefinition | undefined {
  return FLAG_LEVELS.find((l) => l.id === levelNum)
}

export function flagLevelKey(levelId: number): string {
  return String(levelId)
}
