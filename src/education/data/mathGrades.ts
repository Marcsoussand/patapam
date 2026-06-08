import type { MathGradeTrack } from '../types/math'

export interface MathGradeInfo {
  track: MathGradeTrack
  labelFr: string
  labelEn: string
  labelHe: string
}

export const MATH_GRADES: MathGradeInfo[] = [
  { track: 'kita_aleph', labelFr: 'CP (Kita aleph)', labelEn: '1st Grade (Kita aleph)', labelHe: 'כיתה א' },
  { track: 'kita_bet', labelFr: 'CE1 (Kita bet)', labelEn: '2nd Grade (Kita bet)', labelHe: 'כיתה ב' },
  { track: 'kita_gimel', labelFr: 'CE2 (Kita gimel)', labelEn: '3rd Grade (Kita gimel)', labelHe: 'כיתה ג' },
  { track: 'kita_dalet', labelFr: 'CM1 (Kita dalet)', labelEn: '4th Grade (Kita dalet)', labelHe: 'כיתה ד' },
  { track: 'kita_he', labelFr: 'CM2 (Kita he)', labelEn: '5th Grade (Kita he)', labelHe: 'כיתה ה' },
]

/**
 * 5 familles de jeux par kita (à décliner sur 20 niveaux = 4 paliers × 5 types).
 * Référence curriculum — seul kita_aleph est implémenté pour l'instant.
 *
 * kita aleph : comparer → addition ≤10/20 → soustraction → compléments/doubles → reprise
 * kita bet   : opérations ≤100 → tables ×2,×5,×10 → problèmes → fractions simples → reprise
 * kita gimel : opérations ≤1000 → multiplication → division simple → géométrie → reprise
 * kita dalet : grands nombres → fractions/décimaux → périmètre/aire → proportion → reprise
 * kita he    : tout nombre → % et ratios → volumes → algèbre intro → reprise
 */
export function resolveMathTrack(birthYear: number | null | undefined): MathGradeTrack {
  if (!birthYear) return 'kita_aleph'

  const age = new Date().getFullYear() - birthYear
  if (age >= 11) return 'kita_he'
  if (age >= 10) return 'kita_dalet'
  if (age >= 9) return 'kita_gimel'
  if (age >= 8) return 'kita_bet'
  return 'kita_aleph'
}

export function gradeInfo(track: MathGradeTrack): MathGradeInfo {
  return MATH_GRADES.find((g) => g.track === track) ?? MATH_GRADES[0]
}
