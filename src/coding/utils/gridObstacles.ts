import type { CellType, ObstacleId } from '../types/game'

const WALKABLE = new Set<CellType>([
  'path',
  'start',
  'end',
  'key_red',
  'key_yellow',
  'door_red',
  'door_yellow',
])

const OBSTACLE_TYPES: ObstacleId[] = ['red_flower', 'orange_flower', 'node']

const NEIGHBORS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const

function isWalkable(cell: CellType | undefined): boolean {
  return cell !== undefined && WALKABLE.has(cell)
}

/** Mur directement face à une case praticable (pas les bords extérieurs du plateau). */
function facesWalkable(row: number, col: number, grid: CellType[][]): boolean {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0

  for (const [dr, dc] of NEIGHBORS) {
    const r = row + dr
    const c = col + dc
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue
    if (isWalkable(grid[r][c])) return true
  }
  return false
}

/** Type aléatoire mais stable pour une case d'un niveau donné. */
function randomObstacleType(row: number, col: number, levelId: string): ObstacleId {
  const key = `${levelId}:${row},${col}`
  let hash = 2166136261
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return OBSTACLE_TYPES[Math.abs(hash) % OBSTACLE_TYPES.length]
}

/** Obstacles visuels sur les murs qui bordent le chemin (pas tout le pourtour du plateau). */
export function borderObstacles(grid: CellType[][], levelId: string): Map<string, ObstacleId> {
  const result = new Map<string, ObstacleId>()

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < (grid[0]?.length ?? 0); col++) {
      if (grid[row][col] !== 'wall') continue
      if (!facesWalkable(row, col, grid)) continue
      result.set(`${row},${col}`, randomObstacleType(row, col, levelId))
    }
  }

  return result
}
