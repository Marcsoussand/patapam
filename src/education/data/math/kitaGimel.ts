import type { MathLevelDefinition } from '../../types/math'
import { compareLevel, placeholderLevel } from './buildLevels'

/** Kita gimel / CE2 — 20 niveaux */
export const KITA_GIMEL_MATH_LEVELS: MathLevelDefinition[] = [
  compareLevel(0, '1', 'max', 1, 200, 'Le plus grand (1–200)', 'Biggest (1–200)', 'הגדול (1–200)'),
  compareLevel(1, '2', 'min', 1, 200, 'Le plus petit (1–200)', 'Smallest (1–200)', 'הקטן (1–200)'),
  compareLevel(2, '3', 'max', 1, 500, 'Le plus grand (1–500)', 'Biggest (1–500)', 'הגדול (1–500)'),
  compareLevel(3, '4', 'min', 1, 500, 'Le plus petit (1–500)', 'Smallest (1–500)', 'הקטן (1–500)'),
  placeholderLevel(4, '5', 'ordering', 'Ranger des nombres (≤500)', 'Order numbers (≤500)', 'סדר מספרים', {
    kind: 'order',
    count: 4,
    max: 500,
  }),
  placeholderLevel(5, '6', 'addition', 'Additions jusqu\'à 200', 'Add up to 200', 'חיבור עד 200', {
    kind: 'add',
    maxSum: 200,
  }),
  placeholderLevel(6, '7', 'addition', 'Additions jusqu\'à 500', 'Add up to 500', 'חיבור עד 500', {
    kind: 'add',
    maxSum: 500,
  }),
  placeholderLevel(7, '8', 'addition', 'Additions jusqu\'à 1000', 'Add up to 1000', 'חיבור עד 1000', {
    kind: 'add',
    maxSum: 1000,
  }),
  placeholderLevel(8, '9', 'subtraction', 'Soustractions (≤200)', 'Subtract (≤200)', 'חיסור (≤200)', {
    kind: 'subtract',
    maxMinuend: 200,
  }),
  placeholderLevel(9, '10', 'subtraction', 'Soustractions (≤500)', 'Subtract (≤500)', 'חיסור (≤500)', {
    kind: 'subtract',
    maxMinuend: 500,
  }),
  placeholderLevel(10, '11', 'subtraction', 'Soustractions (≤1000)', 'Subtract (≤1000)', 'חיסור (≤1000)', {
    kind: 'subtract',
    maxMinuend: 1000,
  }),
  placeholderLevel(11, '12', 'mixed', 'Calcul mixte (≤500)', 'Mixed (≤500)', 'תרגול מעורב', {
    kind: 'mixed',
    max: 500,
  }),
  placeholderLevel(12, '13', 'multiplication', 'Tables de 2 à 5', 'Times 2 to 5', 'כפולות 2–5', {
    kind: 'multiply',
    tables: [2, 3, 4, 5],
  }),
  placeholderLevel(13, '14', 'multiplication', 'Tables de 6 à 9', 'Times 6 to 9', 'כפולות 6–9', {
    kind: 'multiply',
    tables: [6, 7, 8, 9],
  }),
  placeholderLevel(14, '15', 'multiplication', 'Table de 10', 'Times 10', 'כפולות 10', {
    kind: 'multiply',
    tables: [10],
  }),
  placeholderLevel(15, '16', 'addition', 'Division simple (÷2, ÷5)', 'Simple division', 'חילוק פשוט', {
    kind: 'mixed',
    max: 100,
  }),
  placeholderLevel(16, '17', 'ordering', 'Comparer des dizaines', 'Compare tens', 'השוואת עשרות', {
    kind: 'order',
    count: 3,
    max: 1000,
  }),
  placeholderLevel(17, '18', 'mixed', 'Problèmes à une étape', 'One-step problems', 'בעיות מילוליות', {
    kind: 'mixed',
    max: 1000,
  }),
  placeholderLevel(18, '19', 'multiplication', 'Tables complètes (2–10)', 'Full tables 2–10', 'כל הכפולות', {
    kind: 'multiply',
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  }),
  placeholderLevel(19, '20', 'review', 'Bilan kita gimel', 'Kita gimel review', 'חזרה כיתה ג', {
    kind: 'review',
    max: 1000,
  }),
]
