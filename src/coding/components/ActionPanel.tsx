import { useGame } from '../context/GameContext'
import { ACTIONS } from '../data/actions'
import ActionIcon from './ActionIcon'
import type { ActionId } from '../types/game'

export default function ActionPanel() {
  const { state, dispatch, currentLevel } = useGame()
  const isRunning = state.status === 'running'

  function handleDragStart(e: React.DragEvent, actionId: ActionId) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'panel', actionId }))
  }

  function handleClick(actionId: ActionId) {
    if (isRunning) return
    if (state.displaySlots && currentLevel.prefillSequence) {
      const targetIdx = state.displaySlots.findIndex(
        (_, i) => state.displaySlots![i] === null && currentLevel.prefillSequence![i] === null,
      )
      if (targetIdx < 0) return
      dispatch({ type: 'ADD_ACTION', actionId, index: targetIdx })
      return
    }
    dispatch({ type: 'ADD_ACTION', actionId })
  }

  return (
    <div className="coding-action-panel">
      <h3>Actions disponibles</h3>
      <div className="coding-action-list">
        {currentLevel.availableActions.map((actionId) => {
          const action = ACTIONS[actionId]
          return (
            <div
              key={actionId}
              className={`coding-action-card ${isRunning ? 'coding-action-card--disabled' : ''}`}
              draggable={!isRunning}
              onDragStart={(e) => handleDragStart(e, actionId)}
              onClick={() => handleClick(actionId)}
              title={`${action.label} — clic ou glisser`}
            >
              <span className="coding-action-icon">
                <ActionIcon actionId={actionId} />
              </span>
              <span className="coding-action-label">{action.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
