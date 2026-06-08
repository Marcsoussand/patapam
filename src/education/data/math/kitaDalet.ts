import type { MathLevelDefinition } from '../../types/math'
import { compareLevel, placeholderLevel } from './buildLevels'

/** Kita dalet / CM1 — 20 niveaux */
export const KITA_DALET_MATH_LEVELS: MathLevelDefinition[] = [
  compareLevel(0, '1', 'max', 100, 999, 'Le plus grand (100–999)', 'Biggest (100–999)', 'הגדול (100–999)'),
  compareLevel(1, '2', 'min', 100, 999, 'Le plus petit (100–999)', 'Smallest (100–999)', 'הקטן (100–999)'),
  compareLevel(2, '3', 'max', 1, 9999, 'Le plus grand (≤9999)', 'Biggest (≤9999)', 'הגדול (≤9999)'),
  compareLevel(3, '4', 'min', 1, 9999, 'Le plus petit (≤9999)', 'Smallest (≤9999)', 'הקטן (≤9999)'),
  placeholderLevel(4, '5', 'ordering', 'Ranger grands nombres', 'Order large numbers', 'סדר מספרים גדולים', {
    kind: 'order',
    count: 4,
    max: 9999,
  }),
  placeholderLevel(5, '6', 'addition', 'Additions jusqu\'à 1000', 'Add up to 1000', 'חיבור עד 1000', {
    kind: 'add',
    maxSum: 1000,
  }),
  placeholderLevel(6, '7', 'addition', 'Additions jusqu\'à 5000', 'Add up to 5000', 'חיבור עד 5000', {
    kind: 'add',
    maxSum: 5000,
  }),
  placeholderLevel(7, '8', 'subtraction', 'Soustractions (≤5000)', 'Subtract (≤5000)', 'חיסור (≤5000)', {
    kind: 'subtract',
    maxMinuend: 5000,
  }),
  placeholderLevel(8, '9', 'multiplication', 'Multiplication (2 chiffres × 1)', '2-digit × 1-digit', 'כפל דו-ספרתי', {
    kind: 'multiply',
    tables: [2, 3, 4, 5, 6, 7, 8, 9],
  }),
  placeholderLevel(9, '10', 'addition', 'Division euclidienne', 'Division with remainder', 'חילוק עם שארית', {
    kind: 'mixed',
    max: 1000,
  }),
  placeholderLevel(10, '11', 'mixed', 'Fractions — comparer', 'Compare fractions', 'השוואת שברים', {
    kind: 'mixed',
    max: 12,
  }),
  placeholderLevel(11, '12', 'mixed', 'Fractions — repères', 'Unit fractions', 'שברים יסודיים', {
    kind: 'mixed',
    max: 12,
  }),
  placeholderLevel(12, '13', 'addition', 'Décimaux — addition', 'Add decimals', 'חיבור עשרוני', {
    kind: 'add',
    maxSum: 100,
  }),
  placeholderLevel(13, '14', 'subtraction', 'Décimaux — soustraction', 'Subtract decimals', 'חיסור עשרוני', {
    kind: 'subtract',
    maxMinuend: 100,
  }),
  placeholderLevel(14, '15', 'mixed', 'Périmètre de carré/rectangle', 'Perimeter', 'היקף', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(15, '16', 'mixed', 'Aire de rectangle', 'Area of rectangle', 'שטח מלבן', {
    kind: 'mixed',
    max: 200,
  }),
  placeholderLevel(16, '17', 'multiplication', 'Tables jusqu\'à 12', 'Times up to 12', 'כפולות עד 12', {
    kind: 'multiply',
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  }),
  placeholderLevel(17, '18', 'mixed', 'Problèmes à deux étapes', 'Two-step problems', 'בעיות בשני שלבים', {
    kind: 'mixed',
    max: 5000,
  }),
  placeholderLevel(18, '19', 'mixed', 'Proportion simple', 'Simple proportion', 'יחס פשוט', {
    kind: 'mixed',
    max: 1000,
  }),
  placeholderLevel(19, '20', 'review', 'Bilan kita dalet', 'Kita dalet review', 'חזרה כיתה ד', {
    kind: 'review',
    max: 9999,
  }),
]
