import type { MathLevelDefinition } from '../../types/math'
import { compareLevel, placeholderLevel } from './buildLevels'

/** Kita aleph / CP — 20 niveaux */
export const KITA_ALEPH_MATH_LEVELS: MathLevelDefinition[] = [
  compareLevel(0, '1', 'max', 1, 9, 'Le plus grand (1–9)', 'Biggest (1–9)', 'הגדול (1–9)'),
  compareLevel(1, '2', 'min', 1, 9, 'Le plus petit (1–9)', 'Smallest (1–9)', 'הקטן (1–9)'),
  compareLevel(2, '3', 'max', 1, 15, 'Le plus grand (1–15)', 'Biggest (1–15)', 'הגדול (1–15)'),
  compareLevel(3, '4', 'min', 1, 15, 'Le plus petit (1–15)', 'Smallest (1–15)', 'הקטן (1–15)'),
  placeholderLevel(4, '5', 'ordering', 'Ranger deux nombres', 'Order two numbers', 'סדר שני מספרים', {
    kind: 'order',
    count: 2,
    max: 15,
  }),
  placeholderLevel(5, '6', 'addition', 'Additions jusqu\'à 10', 'Add up to 10', 'חיבור עד 10', {
    kind: 'add',
    maxSum: 10,
  }),
  placeholderLevel(6, '7', 'addition', 'Additions jusqu\'à 10 (2)', 'Add up to 10 (2)', 'חיבור עד 10 (2)', {
    kind: 'add',
    maxSum: 10,
  }),
  placeholderLevel(7, '8', 'addition', 'Additions jusqu\'à 20', 'Add up to 20', 'חיבור עד 20', {
    kind: 'add',
    maxSum: 20,
  }),
  placeholderLevel(8, '9', 'addition', 'Compléter une addition', 'Missing addend', 'השלמת חיבור', {
    kind: 'add',
    maxSum: 10,
  }),
  placeholderLevel(9, '10', 'subtraction', 'Soustractions jusqu\'à 10', 'Subtract up to 10', 'חיסור עד 10', {
    kind: 'subtract',
    maxMinuend: 10,
  }),
  placeholderLevel(10, '11', 'subtraction', 'Soustractions jusqu\'à 15', 'Subtract up to 15', 'חיסור עד 15', {
    kind: 'subtract',
    maxMinuend: 15,
  }),
  placeholderLevel(11, '12', 'subtraction', 'Soustractions jusqu\'à 20', 'Subtract up to 20', 'חיסור עד 20', {
    kind: 'subtract',
    maxMinuend: 20,
  }),
  placeholderLevel(12, '13', 'mixed', 'Additions et soustractions', 'Add and subtract', 'חיבור וחיסור', {
    kind: 'mixed',
    max: 10,
  }),
  placeholderLevel(13, '14', 'complement', 'Compléments à 10', 'Make 10', 'השלמה ל-10', {
    kind: 'complement',
    target: 10,
  }),
  placeholderLevel(14, '15', 'addition', 'Les doubles', 'Doubles', 'כפולות', {
    kind: 'add',
    maxSum: 20,
  }),
  placeholderLevel(15, '16', 'ordering', 'Ranger trois nombres', 'Order three numbers', 'סדר שלושה מספרים', {
    kind: 'order',
    count: 3,
    max: 20,
  }),
  placeholderLevel(16, '17', 'addition', 'Additions avec retenue', 'Addition with carry', 'חיבור עם העברה', {
    kind: 'add',
    maxSum: 20,
  }),
  placeholderLevel(17, '18', 'multiplication', 'Tables de 2 et 5', 'Times 2 and 5', 'כפולות 2 ו-5', {
    kind: 'multiply',
    tables: [2, 5],
  }),
  placeholderLevel(18, '19', 'mixed', 'Calcul mixte', 'Mixed practice', 'תרגול מעורב', {
    kind: 'mixed',
    max: 20,
  }),
  placeholderLevel(19, '20', 'review', 'Bilan kita aleph', 'Kita aleph review', 'חזרה כיתה א', {
    kind: 'review',
    max: 20,
  }),
]
