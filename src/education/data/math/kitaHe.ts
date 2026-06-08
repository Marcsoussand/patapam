import type { MathLevelDefinition } from '../../types/math'
import { compareLevel, placeholderLevel } from './buildLevels'

/** Kita he / CM2 — 20 niveaux */
export const KITA_HE_MATH_LEVELS: MathLevelDefinition[] = [
  compareLevel(0, '1', 'max', 1000, 99999, 'Le plus grand (grands nombres)', 'Biggest (large)', 'הגדול (מספרים גדולים)'),
  compareLevel(1, '2', 'min', 1000, 99999, 'Le plus petit (grands nombres)', 'Smallest (large)', 'הקטן (מספרים גדולים)'),
  compareLevel(2, '3', 'max', -50, 50, 'Comparer — le plus grand', 'Biggest (with negatives)', 'הגדול (כולל שליליים)'),
  compareLevel(3, '4', 'min', -50, 50, 'Comparer — le plus petit', 'Smallest (with negatives)', 'הקטן (כולל שליליים)'),
  placeholderLevel(4, '5', 'ordering', 'Ranger fractions', 'Order fractions', 'סדר שברים', {
    kind: 'order',
    count: 3,
    max: 12,
  }),
  placeholderLevel(5, '6', 'mixed', 'Fractions — addition', 'Add fractions', 'חיבור שברים', {
    kind: 'mixed',
    max: 12,
  }),
  placeholderLevel(6, '7', 'mixed', 'Fractions — soustraction', 'Subtract fractions', 'חיסור שברים', {
    kind: 'mixed',
    max: 12,
  }),
  placeholderLevel(7, '8', 'mixed', 'Pourcentages simples', 'Simple percentages', 'אחוזים', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(8, '9', 'mixed', 'Décimaux × entier', 'Decimal × whole', 'עשרוני × שלם', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(9, '10', 'multiplication', 'Multiplication (2 × 2 chiffres)', '2-digit × 2-digit', 'כפל דו-ספרתי', {
    kind: 'multiply',
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  }),
  placeholderLevel(10, '11', 'addition', 'Division longue', 'Long division', 'חילוק ארוך', {
    kind: 'mixed',
    max: 10000,
  }),
  placeholderLevel(11, '12', 'mixed', 'Volume de pavé droit', 'Volume of cuboid', 'נפח תיבה', {
    kind: 'mixed',
    max: 1000,
  }),
  placeholderLevel(12, '13', 'mixed', 'Priorité des opérations', 'Order of operations', 'סדר פעולות', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(13, '14', 'mixed', 'Équations simples (x + a = b)', 'Simple equations', 'משוואות פשוטות', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(14, '15', 'mixed', 'Ratio et proportion', 'Ratio and proportion', 'יחס ופרופורציה', {
    kind: 'mixed',
    max: 1000,
  }),
  placeholderLevel(15, '16', 'mixed', 'Pourcentages et réductions', 'Discounts & %', 'הנחות ואחוזים', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(16, '17', 'mixed', 'Nombres décimaux — division', 'Divide decimals', 'חילוק עשרוני', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(17, '18', 'mixed', 'Problèmes concrets', 'Word problems', 'בעיות מילוליות', {
    kind: 'mixed',
    max: 10000,
  }),
  placeholderLevel(18, '19', 'review', 'Calcul mental avancé', 'Advanced mental math', 'חשבון בראש מתקדם', {
    kind: 'review',
    max: 1000,
  }),
  placeholderLevel(19, '20', 'review', 'Bilan kita he', 'Kita he review', 'חזרה כיתה ה', {
    kind: 'review',
    max: 99999,
  }),
]
