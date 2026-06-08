/** Piste alignée sur le système israélien (kita) — référence FR entre parenthèses. */
export type MathGradeTrack =
  | 'kita_aleph' // CP
  | 'kita_bet' // CE1
  | 'kita_gimel' // CE2
  | 'kita_dalet' // CM1
  | 'kita_he' // CM2

export type MathGameType =
  | 'compare_max'
  | 'compare_min'
  | 'addition'
  | 'subtraction'
  | 'mixed'
  | 'complement'
  | 'ordering'
  | 'multiplication'
  | 'review'

export interface MathLevelDefinition {
  id: string
  index: number
  gameType: MathGameType
  titleFr: string
  titleEn: string
  titleHe: string
  /** true = jouable dans l'app */
  implemented: boolean
  questions: number
  config: MathLevelConfig
}

export type MathLevelConfig =
  | { kind: 'compare'; min: number; max: number; mode: 'max' | 'min' }
  | { kind: 'add'; maxSum: number }
  | { kind: 'subtract'; maxMinuend: number }
  | { kind: 'mixed'; max: number }
  | { kind: 'complement'; target: number }
  | { kind: 'order'; count: number; max: number }
  | { kind: 'multiply'; tables: number[] }
  | { kind: 'review'; max: number }

export interface CompareQuestion {
  a: number
  b: number
  correct: number
}
