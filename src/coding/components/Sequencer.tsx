import { useState, type DragEvent } from 'react'
import { useGame } from '../context/GameContext'
import ActionIcon from './ActionIcon'
import type { ActionId } from '../types/game'

interface DragData {
  source: 'panel' | 'sequencer'
  actionId?: ActionId
  index?: number
}

function resolveDropSlot(
  e: DragEvent<HTMLElement>,
  displaySlots: (ActionId | null)[],
  prefillSeq: (ActionId | null)[],
  horizontal: boolean,
): number | null {
  const container = e.currentTarget

  for (const row of container.querySelectorAll<HTMLElement>('[data-seq-row]')) {
    const { top, bottom, left, right } = row.getBoundingClientRect()
    const inside = horizontal
      ? e.clientX >= left && e.clientX < right
      : e.clientY >= top && e.clientY < bottom
    if (inside) {
      const idx = Number(row.dataset.seqRow)
      if (Number.isNaN(idx)) return null
      if (displaySlots[idx] === null && prefillSeq[idx] === null) return idx
      return null
    }
  }

  return null
}

export default function Sequencer() {
  const { state, dispatch, currentLevel } = useGame()
  const { sequence, status, executionIndex, displaySlots } = state
  const isRunning = status === 'running'
  const [dropOverIdx, setDropOverIdx] = useState<number | null>(null)

  const isHorizontal = currentLevel.viewMode === 'sidescroll'
  const isVertical = !isHorizontal

  if (!displaySlots) {
    return null
  }

  const slots = displaySlots
  const prefillSeq: (ActionId | null)[] =
    currentLevel.prefillSequence ?? Array<ActionId | null>(currentLevel.maxActions).fill(null)

  const activeSlotIdx =
    status === 'running'
      ? (() => {
          let c = 0
          for (let i = 0; i < slots.length; i++) {
            if (slots[i] !== null) {
              if (c === executionIndex) return i
              c++
            }
          }
          return -1
        })()
      : -1

  const allFilled = !slots.some((s, i) => s === null && prefillSeq[i] === null)

  function handleDrop(e: DragEvent<HTMLElement>) {
    e.preventDefault()
    const idx = resolveDropSlot(e, slots, prefillSeq, isHorizontal)
    setDropOverIdx(null)
    if (idx === null) return

    const data: DragData = JSON.parse(e.dataTransfer.getData('text/plain'))
    if (data.source === 'panel' && data.actionId) {
      dispatch({ type: 'ADD_ACTION', actionId: data.actionId, index: idx })
    }
  }

  function handleDragOver(e: DragEvent<HTMLElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDropOverIdx(resolveDropSlot(e, slots, prefillSeq, isHorizontal))
  }

  function handleDragLeave(e: DragEvent<HTMLElement>) {
    const related = e.relatedTarget as Node | null
    if (!related || !e.currentTarget.contains(related)) {
      setDropOverIdx(null)
    }
  }

  const canClear = slots.some((s, i) => s !== null && prefillSeq[i] === null)

  return (
    <div
      className={[
        'coding-sequencer',
        isVertical ? 'coding-sequencer--vertical' : '',
        isHorizontal ? 'coding-sequencer--horizontal' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="coding-sequencer-header">
        <span className="coding-sequencer-title">Ta séquence</span>
        <span className="coding-sequencer-count">
          {sequence.length} / {currentLevel.maxActions}
        </span>
        {!isRunning && canClear && (
          <button
            type="button"
            className="coding-seq-clear"
            onClick={() => dispatch({ type: 'CLEAR_SEQUENCE' })}
            title="Effacer tes actions"
          >
            🗑
          </button>
        )}
      </div>

      <div
        className={[
          'coding-seq-slots',
          isVertical ? 'coding-seq-slots--vertical' : '',
          isHorizontal ? 'coding-seq-slots--horizontal' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {slots.map((slotAction, idx) => {
          const isLocked = prefillSeq[idx] !== null
          const isEmpty = slotAction === null
          const isActive = idx === activeSlotIdx
          const isDone =
            !isActive &&
            (() => {
              let c = 0
              for (let i = 0; i < idx; i++) {
                if (slots[i] !== null) c++
              }
              return c < executionIndex && ['running', 'success', 'failure'].includes(status)
            })()
          const isFailed = status === 'failure' && idx === activeSlotIdx
          const isDropTarget = isEmpty && dropOverIdx === idx

          if (isEmpty) {
            return (
              <div
                key={idx}
                className={`coding-seq-row ${isDropTarget ? 'coding-seq-row--drop' : ''}`}
                data-seq-row={idx}
              >
                <div className="coding-seq-slot coding-seq-slot--empty">
                  <span className="coding-seq-slot-index">{idx + 1}</span>
                  <span className="coding-seq-question">?</span>
                </div>
              </div>
            )
          }

          return (
            <div key={idx} className="coding-seq-row" data-seq-row={idx}>
              <div
                className={[
                  'coding-seq-slot',
                  isLocked ? 'coding-seq-slot--locked' : '',
                  isActive ? 'coding-seq-slot--active' : '',
                  isDone ? 'coding-seq-slot--done' : '',
                  isFailed ? 'coding-seq-slot--failed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="coding-seq-slot-index">{idx + 1}</span>
                <ActionIcon actionId={slotAction} />
                {!isLocked && !isRunning && (
                  <button
                    type="button"
                    className="coding-seq-remove"
                    onClick={() => dispatch({ type: 'REMOVE_ACTION', index: idx })}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="coding-seq-controls">
        {status === 'idle' && (
          <button
            type="button"
            className="coding-btn-run"
            onClick={() => dispatch({ type: 'RUN' })}
            disabled={!allFilled}
          >
            ▶ Lancer
          </button>
        )}
        {status === 'running' && (
          <button type="button" className="coding-btn-stop" onClick={() => dispatch({ type: 'RESET' })}>
            ■ Stop
          </button>
        )}
        {(status === 'success' || status === 'failure') && (
          <button type="button" className="coding-btn-replay" onClick={() => dispatch({ type: 'RESET' })}>
            ↺ Rejouer
          </button>
        )}
        {status === 'failure' && <p className="coding-failure-msg">Oups ! Essaie encore.</p>}
      </div>
    </div>
  )
}
