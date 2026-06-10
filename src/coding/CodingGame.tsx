import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { GameProvider, useGame } from './context/GameContext'
import { MOLLASSON_LEVELS } from './data/mollassonLevels'
import { DAUPHINOU_LEVELS, lastPlayableLevelIndex } from './data/dauphinouLevels'
import { codingLevelKey } from './data/codingLevelKey'
import type { CellType, HeroId, Level } from './types/game'
import Grid from './components/Grid'
import ActionPanel from './components/ActionPanel'
import Sequencer from './components/Sequencer'
import ExitButton from './components/ExitButton'
import {
  loadCodingProgress,
  saveCodingProgress,
  maxUnlockedLevelIndex,
  highestCompletedLevelIndex,
  type CodingProgressMap,
} from '../lib/codingProgress'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import { playCongrats } from '../lib/audioClips'
import './coding-game.css'

const KEY_CELL_COLOR: Partial<Record<CellType, string>> = {
  key_red: 'red',
  key_yellow: 'yellow',
}

const KEY_ICONS: Record<string, string> = { red: '🔑', yellow: '🗝️' }
const CODING_VICTORY_COINS = 3

const HERO_CONFIG: Record<
  HeroId,
  { levels: Level[]; heroName: string; themeClass: string }
> = {
  mollasson: {
    levels: MOLLASSON_LEVELS,
    heroName: 'Mollasson',
    themeClass: 'coding-game--forest',
  },
  dauphinou: {
    levels: DAUPHINOU_LEVELS,
    heroName: 'Dauphinou',
    themeClass: 'coding-game--sea',
  },
}

interface CodingGameProps {
  profileId: string
  onClose: () => void
  hero?: HeroId
}

function GameScreen({
  profileId,
  progress,
  onProgressUpdate,
  onClose,
  levels,
  heroName,
  themeClass,
}: {
  profileId: string
  progress: CodingProgressMap
  onProgressUpdate: (map: CodingProgressMap) => void
  onClose: () => void
  levels: Level[]
  heroName: string
  themeClass: string
}) {
  const { state, dispatch, currentLevel, maxUnlockedIndex } = useGame()
  const { status, executionIndex, currentLevelIndex, collectedKeys } = state
  const { grid, hero, title, description } = currentLevel
  const activeProfile = useProfileStore((s) => s.activeProfile)
  const addCoins = useProfileStore((s) => s.addCoins)
  const [rewardCoins, setRewardCoins] = useState(0)
  const coinsAwardedRef = useRef(false)
  const congratsPlayedRef = useRef(false)

  const lastPlayableIndex = useMemo(() => lastPlayableLevelIndex(levels), [levels])
  const isLastPlayableLevel = currentLevelIndex >= lastPlayableIndex

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
      congratsPlayedRef.current = false
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
    if (congratsPlayedRef.current) return
    congratsPlayedRef.current = true
    void playCongrats()
  }, [status])

  useEffect(() => {
    if (status !== 'success') return
    const key = codingLevelKey(hero, currentLevel.id)
    if ((progress[key] ?? 0) >= 3) return
    void saveCodingProgress(profileId, hero, currentLevel.id, 3).then(() => {
      onProgressUpdate({ ...progress, [key]: 3 })
    })
  }, [status, hero, currentLevel.id, profileId, progress, onProgressUpdate])

  return (
    <div className={`coding-game ${themeClass}`}>
      <ExitButton onClick={onClose} />

      <main className="coding-game-layout">
        <header className="coding-game-header">
          <div className="coding-level-progress-bar">
            {levels.map((lvl, idx) => {
              const isActive = idx === currentLevelIndex
              const isPast = idx < currentLevelIndex
              const isLocked = idx > maxUnlockedIndex || !!lvl.comingSoon
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
                  {idx < levels.length - 1 && (
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
            <div className="coding-success-title">Bravo ! {heroName} a réussi !</div>
            <div className="coding-success-stars">★★★</div>
            {rewardCoins > 0 && (
              <div className="coding-success-coins">
                <span>+{rewardCoins}</span>
                <span className="coding-success-coin-icon" aria-hidden>
                  🪙
                </span>
              </div>
            )}
            {!isLastPlayableLevel ? (
              <button
                type="button"
                className="coding-btn-next"
                onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
              >
                Niveau suivant →
              </button>
            ) : (
              <p className="coding-success-complete">
                Tu as terminé tous les niveaux disponibles de {heroName} !
              </p>
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

export default function CodingGame({ profileId, onClose, hero = 'mollasson' }: CodingGameProps) {
  const { levels, heroName, themeClass } = HERO_CONFIG[hero]
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

  const maxUnlocked = maxUnlockedLevelIndex(levels, hero, progress)
  const suggestedLevel = highestCompletedLevelIndex(levels, hero, progress)

  const handleProgressUpdate = useCallback((map: CodingProgressMap) => {
    setProgress(map)
  }, [])

  if (loading) {
    return (
      <div className={`coding-game coding-game--loading ${themeClass}`}>
        <ExitButton onClick={onClose} />
        <p>Chargement…</p>
      </div>
    )
  }

  return (
    <GameProvider levels={levels} maxUnlockedIndex={maxUnlocked} initialLevelIndex={suggestedLevel}>
      <GameScreen
        profileId={profileId}
        progress={progress}
        onProgressUpdate={handleProgressUpdate}
        onClose={onClose}
        levels={levels}
        heroName={heroName}
        themeClass={themeClass}
      />
    </GameProvider>
  )
}
