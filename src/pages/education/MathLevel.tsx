import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProfileStore } from '../../store/profileStore'
import { resolveMathTrack } from '../../education/data/mathGrades'
import { getMathLevel, mathLevelKey, mathLevelsForTrack } from '../../education/data/mathLevels'
import CompareNumbersGame from '../../components/education/CompareNumbersGame'
import {
  loadMathProgress,
  maxUnlockedLevelIndex,
  saveMathProgress,
  type MathProgressMap,
} from '../../lib/educationProgress'
import { awardProfileCoins, mathVictoryCoins } from '../../lib/awardProfileCoins'

export default function MathLevel() {
  const navigate = useNavigate()
  const { levelNum: levelNumParam } = useParams<{ levelNum: string }>()
  const profile = useProfileStore((s) => s.activeProfile)
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const addCoins = useProfileStore((s) => s.addCoins)
  const track = resolveMathTrack(profile?.birth_year)
  const levelNum = Number(levelNumParam)
  const level = Number.isFinite(levelNum) ? getMathLevel(track, levelNum) : undefined
  const levels = mathLevelsForTrack(track)

  const [progress, setProgress] = useState<MathProgressMap>({})
  const [loading, setLoading] = useState(true)
  const [savedStars, setSavedStars] = useState<number | null>(null)
  const [gameAttempt, setGameAttempt] = useState(0)

  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false
    loadMathProgress(profile.id).then((map) => {
      if (!cancelled) {
        setProgress(map)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [profile?.id])

  const maxUnlocked = maxUnlockedLevelIndex(levels, track, progress)
  const levelIndex = levelNum - 1
  const locked = levelIndex < 0 || levelIndex > maxUnlocked
  const previousStars = level ? (progress[mathLevelKey(track, level.id)] ?? 0) : 0

  async function handleComplete(_correct: number, stars: 0 | 1 | 2 | 3): Promise<number> {
    if (!profile || !level) return 0

    const coinsToAdd = mathVictoryCoins(previousStars, stars)
    let best = previousStars

    if (stars >= 1) {
      best = await saveMathProgress(profile.id, track, level.id, stars, previousStars)
      setSavedStars(best)
      setProgress((prev) => ({ ...prev, [mathLevelKey(track, level.id)]: best }))
    }

    if (coinsToAdd > 0) {
      addCoins(coinsToAdd)
      const ok = await awardProfileCoins(profile.id, profile.coins ?? 0, coinsToAdd)
      if (ok) {
        setActiveProfile({ ...profile, coins: (profile.coins ?? 0) + coinsToAdd })
      }
    }

    return coinsToAdd
  }

  if (!profile) return null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-patapam-purple text-white">
        Chargement…
      </div>
    )
  }

  if (!level || locked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-patapam-purple p-6 text-white">
        <p>{!level ? 'Niveau introuvable.' : 'Ce niveau est verrouillé.'}</p>
        <button
          type="button"
          onClick={() => navigate('/education/math')}
          className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
        >
          Retour à la frise
        </button>
      </div>
    )
  }

  if (level.config.kind !== 'compare') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-patapam-purple p-6 text-white text-center">
        <p className="text-xl font-bold">{level.titleFr}</p>
        <p className="text-white/80">Ce niveau arrive bientôt.</p>
        <button
          type="button"
          onClick={() => navigate('/education/math')}
          className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
        >
          Retour à la frise
        </button>
      </div>
    )
  }

  const { min, max, mode } = level.config

  return (
    <div className="flex flex-col min-h-screen bg-patapam-purple">
      <header className="flex items-center justify-between px-4 py-3 bg-black/30 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/education/math')}
          className="rounded-xl px-3 py-1.5 text-white/90 hover:bg-white/10 font-semibold text-sm"
        >
          ← Frise
        </button>
        <span className="text-white font-bold">
          Niveau {levelNum}
          {previousStars > 0 && (
            <span className="ml-2 text-amber-300" aria-hidden>
              {'⭐'.repeat(previousStars)}
            </span>
          )}
        </span>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex items-center justify-center py-8">
        <CompareNumbersGame
          key={gameAttempt}
          min={min}
          max={max}
          mode={mode}
          questionCount={level.questions}
          title={level.titleFr}
          onComplete={handleComplete}
          onReplay={() => setGameAttempt((a) => a + 1)}
          onContinue={() => navigate('/education/math')}
        />
      </main>

      {savedStars !== null && savedStars >= 1 && (
        <p className="sr-only">Progression enregistrée : {savedStars} étoiles</p>
      )}
    </div>
  )
}
