import type { Level } from '../types/game'

const SIDESCROLL_FLOOR: Level['grid'][number] = [
  'wall',
  'wall',
  'wall',
  'wall',
  'wall',
  'wall',
  'wall',
  'wall',
  'wall',
  'wall',
]

const LEVEL_1: Level = {
  id: 'dauphinou-1',
  title: 'Nage avec Dauphinou',
  description: 'Il manque une action pour traverser la mer. Tu sais laquelle ?',
  hero: 'dauphinou',
  viewMode: 'sidescroll',
  surfaceRow: 2,
  grid: [
    ['path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path'],
    ['path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path'],
    ['start', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'end'],
    ['path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path'],
    SIDESCROLL_FLOOR,
  ],
  heroStart: { row: 2, col: 0, direction: 'right' },
  availableActions: ['swim'],
  maxActions: 9,
  prefillSequence: ['swim', 'swim', 'swim', 'swim', null, 'swim', 'swim', 'swim', 'swim'],
}

const LEVEL_2: Level = {
  id: 'dauphinou-2',
  title: 'Le premier obstacle',
  description: 'Un rocher bloque la surface. Saute par-dessus et replonge !',
  hero: 'dauphinou',
  viewMode: 'sidescroll',
  surfaceRow: 2,
  grid: [
    ['path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path'],
    ['path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path'],
    ['start', 'path', 'path', 'path', 'path', 'wall', 'path', 'path', 'path', 'end'],
    ['path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path'],
    SIDESCROLL_FLOOR,
  ],
  heroStart: { row: 2, col: 0, direction: 'right' },
  availableActions: ['swim', 'jump', 'dive'],
  maxActions: 9,
  prefillSequence: ['swim', 'swim', 'swim', 'swim', null, null, 'swim', 'swim', 'swim'],
}

function comingSoonLevel(n: number): Level {
  return {
    id: `dauphinou-${n}`,
    title: 'Bientôt disponible',
    description: 'Ce niveau arrive prochainement !',
    hero: 'dauphinou',
    viewMode: 'sidescroll',
    surfaceRow: 2,
    comingSoon: true,
    grid: LEVEL_1.grid,
    heroStart: LEVEL_1.heroStart,
    availableActions: ['swim'],
    maxActions: 9,
    prefillSequence: LEVEL_1.prefillSequence,
  }
}

export const DAUPHINOU_LEVELS: Level[] = [
  LEVEL_1,
  LEVEL_2,
  ...Array.from({ length: 18 }, (_, i) => comingSoonLevel(i + 3)),
]

export function lastPlayableLevelIndex(levels: Level[]): number {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (!levels[i].comingSoon) return i
  }
  return 0
}
