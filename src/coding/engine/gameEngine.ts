import type { HeroPos, ActionId, CellType, Direction } from '../types/game'

const ACTION_DIRECTION: Record<ActionId, Direction> = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  wait: 'down',
  swim: 'right',
  jump: 'up',
  dive: 'down',
  super_jump: 'up',
}

const KEY_COLOR: Partial<Record<CellType, string>> = {
  key_red: 'red',
  key_yellow: 'yellow',
}

const DOOR_COLOR: Partial<Record<CellType, string>> = {
  door_red: 'red',
  door_yellow: 'yellow',
}

export function computeNextPos(
  heroPos: HeroPos,
  actionId: ActionId,
  surfaceRow?: number,
): { row: number; col: number } {
  const { row, col } = heroPos
  switch (actionId) {
    case 'up':
      return { row: row - 1, col }
    case 'down':
      return { row: row + 1, col }
    case 'left':
      return { row, col: col - 1 }
    case 'right':
      return { row, col: col + 1 }
    case 'wait':
      return { row, col }
    case 'swim': {
      if (surfaceRow !== undefined && row < surfaceRow) {
        return { row: row + 1, col: col + 1 }
      }
      return { row, col: col + 1 }
    }
    case 'jump':
      return { row: row - 1, col: col + 1 }
    case 'dive':
      return { row: row + 1, col: col + 1 }
    case 'super_jump':
      return { row: row - 2, col: col + 1 }
  }
}

export function executeStep(
  heroPos: HeroPos,
  actionId: ActionId,
  grid: CellType[][],
  collectedKeys: string[],
  surfaceRow?: number,
): { heroPos: HeroPos; valid: boolean; collectedKey: string | null } {
  if (actionId === 'wait') {
    return { heroPos: { ...heroPos }, valid: true, collectedKey: null }
  }

  const { row: nextRow, col: nextCol } = computeNextPos(heroPos, actionId, surfaceRow)

  if (
    nextRow < 0 ||
    nextRow >= grid.length ||
    nextCol < 0 ||
    nextCol >= grid[0].length
  ) {
    return { heroPos, valid: false, collectedKey: null }
  }

  const cell = grid[nextRow][nextCol]
  if (cell === 'wall' || cell === 'palm_tree') {
    return { heroPos, valid: false, collectedKey: null }
  }

  const doorColor = DOOR_COLOR[cell]
  if (doorColor !== undefined && !collectedKeys.includes(doorColor)) {
    return { heroPos, valid: false, collectedKey: null }
  }

  const keyColor = KEY_COLOR[cell]
  const collectedKey =
    keyColor !== undefined && !collectedKeys.includes(keyColor) ? keyColor : null

  return {
    heroPos: { row: nextRow, col: nextCol, direction: ACTION_DIRECTION[actionId] },
    valid: true,
    collectedKey,
  }
}

export function isEndCell(row: number, col: number, grid: CellType[][]): boolean {
  return grid[row]?.[col] === 'end'
}

export function isBetachouHome(
  row: number,
  col: number,
  home: { row: number; col: number },
): boolean {
  return row === home.row && col === home.col
}
