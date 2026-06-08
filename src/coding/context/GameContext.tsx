import { createContext, useContext, useReducer, useRef, useMemo, type ReactNode, type Dispatch } from 'react'
import {
  executeStep,
  isEndCell,
  computeNextPos,
  isBetachouHome,
} from '../engine/gameEngine'
import type { GameState, GameAction, Level, ActionId } from '../types/game'

interface GameContextValue {
  state: GameState
  dispatch: Dispatch<GameAction>
  currentLevel: Level
  isLastLevel: boolean
  maxUnlockedIndex: number
}

const GameContext = createContext<GameContextValue | null>(null)

function initialBetachouBlocking(level: Level): boolean | undefined {
  return level.betachou ? true : undefined
}

function initState(levelIndex: number, levels: Level[]): GameState {
  const level = levels[levelIndex]
  const displaySlots = level.prefillSequence
    ? [...level.prefillSequence]
    : Array<ActionId | null>(level.maxActions).fill(null)
  const sequence = displaySlots.filter((a): a is ActionId => a !== null)
  return {
    currentLevelIndex: levelIndex,
    sequence,
    heroPos: { ...level.heroStart },
    status: 'idle',
    executionIndex: 0,
    failedStep: -1,
    collectedKeys: [],
    displaySlots,
    betachouBlocking: initialBetachouBlocking(level),
  }
}

function applyBetachouAfterStep(
  actionId: ActionId,
  heroPos: { row: number; col: number },
  betachouBlocking: boolean | undefined,
  level: Level,
): boolean | undefined {
  if (!level.betachou) return betachouBlocking

  const { home } = level.betachou
  const heroOnHome = isBetachouHome(heroPos.row, heroPos.col, home)

  if (actionId === 'wait') {
    return false
  }

  return !heroOnHome
}

function reducer(state: GameState, action: GameAction, levels: Level[]): GameState {
  const level = levels[state.currentLevelIndex]

  switch (action.type) {
    case 'ADD_ACTION': {
      if (state.displaySlots) {
        const prefill = level.prefillSequence
        const targetIdx =
          action.index !== undefined
            ? action.index
            : state.displaySlots.findIndex(
                (_, i) =>
                  state.displaySlots![i] === null &&
                  (prefill ? prefill[i] === null : true),
              )
        if (targetIdx < 0 || targetIdx >= state.displaySlots.length) return state
        if (state.displaySlots[targetIdx] !== null) return state
        if (prefill && prefill[targetIdx] !== null) return state
        const newSlots = [...state.displaySlots]
        newSlots[targetIdx] = action.actionId
        return {
          ...state,
          displaySlots: newSlots,
          sequence: newSlots.filter((a): a is ActionId => a !== null),
        }
      }
      if (state.sequence.length >= level.maxActions) return state
      const newSeq = [...state.sequence]
      if (action.index !== undefined) {
        newSeq.splice(action.index, 0, action.actionId)
      } else {
        newSeq.push(action.actionId)
      }
      return { ...state, sequence: newSeq }
    }

    case 'REMOVE_ACTION': {
      if (state.displaySlots) {
        const idx = action.index
        if (idx < 0 || idx >= state.displaySlots.length) return state
        if (level.prefillSequence && level.prefillSequence[idx] !== null) return state
        const newSlots = [...state.displaySlots]
        newSlots[idx] = null
        return {
          ...state,
          displaySlots: newSlots,
          sequence: newSlots.filter((a): a is ActionId => a !== null),
        }
      }
      return { ...state, sequence: state.sequence.filter((_, i) => i !== action.index) }
    }

    case 'MOVE_ACTION':
      return state

    case 'CLEAR_SEQUENCE': {
      if (state.displaySlots) {
        const prefill = level.prefillSequence
        const newSlots = state.displaySlots.map((slot, i) =>
          prefill && prefill[i] !== null ? slot : null,
        )
        return {
          ...state,
          displaySlots: newSlots,
          sequence: newSlots.filter((a): a is ActionId => a !== null),
        }
      }
      return { ...state, sequence: [] }
    }

    case 'RUN': {
      if (state.sequence.length === 0) return state
      const slotsFull = state.displaySlots
        ? !state.displaySlots.some((s, i) => {
            const prefill = level.prefillSequence
            if (prefill) return s === null && prefill[i] === null
            return s === null
          })
        : true
      if (!slotsFull) return state
      return {
        ...state,
        status: 'running',
        executionIndex: 0,
        heroPos: { ...level.heroStart },
        failedStep: -1,
        collectedKeys: [],
        betachouBlocking: initialBetachouBlocking(level),
      }
    }

    case 'STEP': {
      const { executionIndex, sequence, heroPos } = state
      if (executionIndex >= sequence.length) return { ...state, status: 'failure' }

      const actionId = sequence[executionIndex]
      let betachouBlocking = state.betachouBlocking

      if (level.betachou && actionId !== 'wait') {
        const next = computeNextPos(heroPos, actionId, level.surfaceRow)
        if (
          betachouBlocking &&
          isBetachouHome(next.row, next.col, level.betachou.home)
        ) {
          return { ...state, status: 'failure', failedStep: executionIndex }
        }
      }

      const result = executeStep(heroPos, actionId, level.grid, state.collectedKeys, level.surfaceRow)

      if (!result.valid) {
        return { ...state, status: 'failure', failedStep: executionIndex }
      }

      const newPos = result.heroPos
      betachouBlocking = applyBetachouAfterStep(actionId, newPos, betachouBlocking, level)

      const newCollectedKeys = result.collectedKey
        ? [...state.collectedKeys, result.collectedKey]
        : state.collectedKeys
      const nextIndex = executionIndex + 1

      if (isEndCell(newPos.row, newPos.col, level.grid)) {
        return {
          ...state,
          heroPos: newPos,
          collectedKeys: newCollectedKeys,
          executionIndex: nextIndex,
          status: 'success',
          betachouBlocking,
        }
      }
      if (nextIndex >= sequence.length) {
        return {
          ...state,
          heroPos: newPos,
          collectedKeys: newCollectedKeys,
          executionIndex: nextIndex,
          status: 'failure',
          betachouBlocking,
        }
      }
      return {
        ...state,
        heroPos: newPos,
        collectedKeys: newCollectedKeys,
        executionIndex: nextIndex,
        status: 'running',
        betachouBlocking,
      }
    }

    case 'RESET': {
      const displaySlots = level.prefillSequence
        ? [...level.prefillSequence]
        : Array<ActionId | null>(level.maxActions).fill(null)
      const sequence = displaySlots.filter((a): a is ActionId => a !== null)
      return {
        ...state,
        heroPos: { ...level.heroStart },
        status: 'idle',
        executionIndex: 0,
        failedStep: -1,
        collectedKeys: [],
        sequence,
        displaySlots,
        betachouBlocking: initialBetachouBlocking(level),
      }
    }

    case 'NEXT_LEVEL': {
      const nextIndex = state.currentLevelIndex + 1
      if (nextIndex >= levels.length) return state
      return initState(nextIndex, levels)
    }

    case 'GO_TO_LEVEL': {
      const { index } = action
      if (index < 0 || index >= levels.length) return state
      return initState(index, levels)
    }

    default:
      return state
  }
}

interface GameProviderProps {
  levels: Level[]
  initialLevelIndex?: number
  maxUnlockedIndex: number
  children: ReactNode
}

export function GameProvider({
  levels,
  initialLevelIndex = 0,
  maxUnlockedIndex,
  children,
}: GameProviderProps) {
  const levelsRef = useRef(levels)
  levelsRef.current = levels

  const [state, dispatch] = useReducer(
    (s: GameState, a: GameAction) => reducer(s, a, levelsRef.current),
    initialLevelIndex,
    (i: number) => initState(i, levels),
  )

  const currentLevel = levels[state.currentLevelIndex]
  const isLastLevel = state.currentLevelIndex === levels.length - 1

  const value = useMemo(
    () => ({
      state,
      dispatch,
      currentLevel,
      isLastLevel,
      maxUnlockedIndex,
    }),
    [state, currentLevel, isLastLevel, maxUnlockedIndex],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
