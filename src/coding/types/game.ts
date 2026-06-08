export type Direction = 'up' | 'down' | 'left' | 'right'
export type CellType =
  | 'wall'
  | 'palm_tree'
  | 'path'
  | 'start'
  | 'end'
  | 'key_red'
  | 'key_yellow'
  | 'door_red'
  | 'door_yellow'
export type ActionId = Direction | 'wait' | 'swim' | 'jump' | 'dive' | 'super_jump'
export type GameStatus = 'idle' | 'running' | 'success' | 'failure'
export type HeroId = 'mollasson' | 'dauphinou'

export interface HeroPos {
  row: number
  col: number
  direction: Direction
}

export interface ActionDef {
  id: ActionId
  label: string
  icon: string
  iconBg: boolean
}

export type ObstacleId = 'red_flower' | 'orange_flower' | 'node'

export interface LevelObstacle {
  row: number
  col: number
  type: ObstacleId
}

/** Betachou occupe home et se décale sur side ; bloque home quand il y est. */
export interface BetachouConfig {
  home: { row: number; col: number }
  side: { row: number; col: number }
}

export interface Level {
  id: string
  title: string
  description: string
  hero: HeroId
  grid: CellType[][]
  heroStart: HeroPos
  availableActions: ActionId[]
  maxActions: number
  viewMode?: 'topdown' | 'sidescroll'
  prefillSequence?: (ActionId | null)[]
  surfaceRow?: number
  obstacles?: LevelObstacle[]
  betachou?: BetachouConfig
}

export interface GameState {
  currentLevelIndex: number
  sequence: ActionId[]
  heroPos: HeroPos
  status: GameStatus
  executionIndex: number
  failedStep: number
  collectedKeys: string[]
  displaySlots?: (ActionId | null)[]
  /** true = Betachou sur home et bloque la case */
  betachouBlocking?: boolean
}

export type GameAction =
  | { type: 'ADD_ACTION'; actionId: ActionId; index?: number }
  | { type: 'REMOVE_ACTION'; index: number }
  | { type: 'MOVE_ACTION'; fromIndex: number; toIndex: number }
  | { type: 'CLEAR_SEQUENCE' }
  | { type: 'RUN' }
  | { type: 'STEP' }
  | { type: 'RESET' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'GO_TO_LEVEL'; index: number }
