import { useEffect, useState, useCallback, useRef } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { MOLLASSON_LEVELS, codingLevelKey } from './data/mollassonLevels'
import type { CellType } from './types/game'
import Grid from './components/Grid'
import ActionPanel from './components/ActionPanel'
import Sequencer from './components/Sequencer'
import ExitButton from './components/ExitButton'
import {
  loadCodingProgress,
  saveCodingProgress,
  maxUnlockedLevelIndex,
  type CodingProgressMap,
} from '../lib/codingProgress'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import './coding-game.css'

const KEY_CELL_COLOR: Partial<Record<CellType, string>> = {
  key_red: 'red',
  key_yellow: 'yellow',
}

const KEY_ICONS: Record<string, string> = { red: '🔑', yellow: '🗝️' }
const CODING_VICTORY_COINS = 3

interface CodingGameProps {
  profileId: string
  onClose: () => void
}

function GameScreen({
  profileId,
  progress,
  onProgressUpdate,
  onClose,
}: {
  profileId: string
  progress: CodingProgressMap
  onProgressUpdate: (map: CodingProgressMap) => void
  onClose: () => void
}) {
  const { state, dispatch, currentLevel, isLastLevel, maxUnlockedIndex } = useGame()
  const { status, executionIndex, currentLevelIndex, collectedKeys } = state
  const { grid, hero, title, description } = currentLevel
  const activeProfile = useProfileStore((s) => s.activeProfile)
  const addCoins = useProfileStore((s) => s.addCoins)
  const [rewardCoins, setRewardCoins] = useState(0)
  const coinsAwardedRef = useRef(false)

  const keyTypes = [
    ...new Set(
      grid
        .flat()
        .map((cell) => KEY_CELL_COLOR[cell])
        .filter((c): c is string => c !== undefined),
    ),
  ]
  const hasKeyLevel = keyTypes.length > 0

  useEffect(() => {
    if (status !== 'running') return
    const timer = setTimeout(() => dispatch({ type: 'STEP' }), 600)
    return () => clearTimeout(timer)
  }, [status, executionIndex, dispatch])

  useEffect(() => {
    if (status !== 'success') {
      coinsAwardedRef.current = false
      setRewardCoins(0)
      return
    }
    if (coinsAwardedRef.current) return
    coinsAwardedRef.current = true
    setRewardCoins(CODING_VICTORY_COINS)
    addCoins(CODING_VICTORY_COINS)

    const currentCoins = activeProfile?.id === profileId ? (activeProfile.coins ?? 0) : null
    if (currentCoins !== null) {
      void supabase
        .from('profiles')
        .update({ coins: currentCoins + CODING_VICTORY_COINS })
        .eq('id', profileId)
        .then(({ error }) => {
          if (error) console.error('Erreur update coins profile:', error)
        })
    }
  }, [status, profileId, activeProfile, addCoins])

  useEffect(() => {
    if (status !== 'success') return
    const key = codingLevelKey(hero, currentLevel.id)
    if ((progress[key] ?? 0) >= 3) return
    void saveCodingProgress(profileId, hero, currentLevel.id, 3).then(() => {
      onProgressUpdate({ ...progress, [key]: 3 })
    })
  }, [status, hero, currentLevel.id, profileId, progress, onProgressUpdate])

  return (
    <div className="coding-game">
      <ExitButton onClick={onClose} />

      <main className="coding-game-layout">
        <header className="coding-game-header">
          <div className="coding-level-progress-bar">
            {MOLLASSON_LEVELS.map((lvl, idx) => {
              const isActive = idx === currentLevelIndex
              const isPast = idx < currentLevelIndex
              const isLocked = idx > maxUnlockedIndex
              return (
                <div key={lvl.id} className="coding-level-progress-item">
                  <button
                    type="button"
                    className={[
                      'coding-level-bubble',
                      isActive ? 'coding-level-bubble--active' : '',
                      isPast ? 'coding-level-bubble--past' : '',
                      isLocked ? 'coding-level-bubble--locked' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      if (!isLocked) dispatch({ type: 'GO_TO_LEVEL', index: idx })
                    }}
                    disabled={isLocked}
                    aria-label={`Niveau ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                  {idx < MOLLASSON_LEVELS.length - 1 && (
                    <span className={`coding-level-arrow ${isPast ? 'coding-level-arrow--past' : ''}`}>
                      ›
                    </span>
                  )}
                </div>
              )
            })}
          </div>
          <h2 className="coding-level-title">
            Niveau {currentLevelIndex + 1} : {title}
          </h2>
          <p className="coding-level-desc">{description}</p>
        </header>

        <div className="coding-game-body">
          <div className="coding-game-center">
            <Grid />
          </div>
          <div className="coding-game-sequence">
            <Sequencer />
          </div>
          <aside className="coding-game-actions">
            <ActionPanel />
            {hasKeyLevel && (
              <div className="coding-inventory">
                <span className="coding-inventory-label">🎒</span>
                {keyTypes.map((color) => (
                  <span
                    key={color}
                    className={
                      collectedKeys.includes(color)
                        ? 'coding-inventory-key coding-inventory-key--collected'
                        : 'coding-inventory-key coding-inventory-key--missing'
                    }
                  >
                    {KEY_ICONS[color] ?? '🗝️'}
                  </span>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>

      {status === 'success' && (
        <div className="coding-success-overlay">
          <div className="coding-success-modal">
            <div className="coding-success-emoji">🎉</div>
            <div className="coding-success-title">Bravo ! Mollasson a réussi !</div>
            <div className="coding-success-stars">★★★</div>
            {rewardCoins > 0 && (
              <div className="coding-success-coins">
                <span>+{rewardCoins}</span>
                <span className="coding-success-coin-icon" aria-hidden>
                  🪙
                </span>
              </div>
            )}
            {!isLastLevel ? (
              <button
                type="button"
                className="coding-btn-next"
                onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
              >
                Niveau suivant →
              </button>
            ) : (
              <p className="coding-success-complete">Tu as terminé tous les niveaux de Mollasson !</p>
            )}
            <button type="button" className="coding-btn-reset-sm" onClick={() => dispatch({ type: 'RESET' })}>
              Rejouer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CodingGame({ profileId, onClose }: CodingGameProps) {
  const [progress, setProgress] = useState<CodingProgressMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    loadCodingProgress(profileId).then((map) => {
      if (!cancelled) {
        setProgress(map)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [profileId])

  const maxUnlocked = maxUnlockedLevelIndex(MOLLASSON_LEVELS, 'mollasson', progress)

  const handleProgressUpdate = useCallback((map: CodingProgressMap) => {
    setProgress(map)
  }, [])

  if (loading) {
    return (
      <div className="coding-game coding-game--loading">
        <ExitButton onClick={onClose} />
        <p>Chargement…</p>
      </div>
    )
  }

  return (
    <GameProvider levels={MOLLASSON_LEVELS} maxUnlockedIndex={maxUnlocked}>
      <GameScreen
        profileId={profileId}
        progress={progress}
        onProgressUpdate={handleProgressUpdate}
        onClose={onClose}
      />
    </GameProvider>
  )
}
