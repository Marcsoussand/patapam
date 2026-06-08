import type { MathLevelDefinition } from '../../types/math'
import { compareLevel, placeholderLevel } from './buildLevels'

/** Kita bet / CE1 — 20 niveaux */
export const KITA_BET_MATH_LEVELS: MathLevelDefinition[] = [
  compareLevel(0, '1', 'max', 1, 50, 'Le plus grand (1–50)', 'Biggest (1–50)', 'הגדול (1–50)'),
  compareLevel(1, '2', 'min', 1, 50, 'Le plus petit (1–50)', 'Smallest (1–50)', 'הקטן (1–50)'),
  compareLevel(2, '3', 'max', 1, 100, 'Le plus grand (1–100)', 'Biggest (1–100)', 'הגדול (1–100)'),
  compareLevel(3, '4', 'min', 1, 100, 'Le plus petit (1–100)', 'Smallest (1–100)', 'הקטן (1–100)'),
  placeholderLevel(4, '5', 'ordering', 'Ranger trois nombres (≤100)', 'Order three (≤100)', 'סדר שלושה (≤100)', {
    kind: 'order',
    count: 3,
    max: 100,
  }),
  placeholderLevel(5, '6', 'addition', 'Additions jusqu\'à 20', 'Add up to 20', 'חיבור עד 20', {
    kind: 'add',
    maxSum: 20,
  }),
  placeholderLevel(6, '7', 'addition', 'Additions jusqu\'à 50', 'Add up to 50', 'חיבור עד 50', {
    kind: 'add',
    maxSum: 50,
  }),
  placeholderLevel(7, '8', 'addition', 'Additions jusqu\'à 100', 'Add up to 100', 'חיבור עד 100', {
    kind: 'add',
    maxSum: 100,
  }),
  placeholderLevel(8, '9', 'addition', 'Compléter une addition', 'Missing addend', 'השלמת חיבור', {
    kind: 'add',
    maxSum: 100,
  }),
  placeholderLevel(9, '10', 'subtraction', 'Soustractions jusqu\'à 20', 'Subtract up to 20', 'חיסור עד 20', {
    kind: 'subtract',
    maxMinuend: 20,
  }),
  placeholderLevel(10, '11', 'subtraction', 'Soustractions jusqu\'à 50', 'Subtract up to 50', 'חיסור עד 50', {
    kind: 'subtract',
    maxMinuend: 50,
  }),
  placeholderLevel(11, '12', 'subtraction', 'Soustractions jusqu\'à 100', 'Subtract up to 100', 'חיסור עד 100', {
    kind: 'subtract',
    maxMinuend: 100,
  }),
  placeholderLevel(12, '13', 'mixed', 'Additions et soustractions (≤50)', 'Add & subtract (≤50)', 'חיבור וחיסור (≤50)', {
    kind: 'mixed',
    max: 50,
  }),
  placeholderLevel(13, '14', 'complement', 'Compléments à 20', 'Make 20', 'השלמה ל-20', {
    kind: 'complement',
    target: 20,
  }),
  placeholderLevel(14, '15', 'addition', 'Les doubles (≤20)', 'Doubles (≤20)', 'כפולות (≤20)', {
    kind: 'add',
    maxSum: 40,
  }),
  placeholderLevel(15, '16', 'ordering', 'Ranger quatre nombres', 'Order four numbers', 'סדר ארבעה מספרים', {
    kind: 'order',
    count: 4,
    max: 100,
  }),
  placeholderLevel(16, '17', 'addition', 'Additions avec retenue (≤100)', 'Carry (≤100)', 'חיבור עם העברה', {
    kind: 'add',
    maxSum: 100,
  }),
  placeholderLevel(17, '18', 'multiplication', 'Tables de 2, 5 et 10', 'Times 2, 5 & 10', 'כפולות 2, 5 ו-10', {
    kind: 'multiply',
    tables: [2, 5, 10],
  }),
  placeholderLevel(18, '19', 'mixed', 'Calcul mixte (≤100)', 'Mixed (≤100)', 'תרגול מעורב', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(19, '20', 'review', 'Bilan kita bet', 'Kita bet review', 'חזרה כיתה ב', {
    kind: 'review',
    max: 100,
  }),
]
