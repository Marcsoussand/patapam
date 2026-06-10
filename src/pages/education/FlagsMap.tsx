import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../store/profileStore'
import { FLAG_LEVELS, flagLevelKey } from '../../education/data/flagLevels'
import {
  loadFlagProgress,
  maxUnlockedFlagLevel,
  type FlagProgressMap,
} from '../../lib/flagProgress'

export default function FlagsMap() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.activeProfile)
  const [progress, setProgress] = useState<FlagProgressMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false
    loadFlagProgress(profile.id).then((map) => {
      if (!cancelled) {
        setProgress(map)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [profile?.id])

  const maxUnlocked = maxUnlockedFlagLevel(FLAG_LEVELS.length, progress)

  const handleSelectLevel = useCallback(
    (levelNum: number) => {
      if (levelNum > maxUnlocked) return
      navigate(`/education/flags/${levelNum}`)
    },
    [maxUnlocked, navigate],
  )

  return (
    <div className="flex flex-col min-h-screen bg-patapam-purple">
      <header className="flex items-center justify-between px-4 py-3 bg-black/30 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/education')}
          className="rounded-xl px-3 py-1.5 text-white/90 hover:bg-white/10 font-semibold text-sm"
        >
          ← Éducation
        </button>
        <h1 className="text-white font-bold text-lg">🏳️ Drapeaux</h1>
        <div className="w-20" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        {loading ? (
          <p className="text-white/80">Chargement…</p>
        ) : (
          <>
            <p className="text-center text-white/80 text-sm max-w-md">
              Réussis un niveau avec au moins 1 ⭐ pour débloquer le suivant.
              <span className="block mt-1 text-white/60">
                Niveau 3 à 3 ⭐ : 3 🪙 + 1 📦 pack d&apos;images !
              </span>
            </p>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              {FLAG_LEVELS.map((level) => {
                const stars = progress[flagLevelKey(level.id)] ?? 0
                const locked = level.id > maxUnlocked
                return (
                  <button
                    key={level.id}
                    type="button"
                    disabled={locked}
                    onClick={() => handleSelectLevel(level.id)}
                    className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-all ${
                      locked
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-white/20 text-white hover:bg-white/30 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-lg">Niveau {level.id}</p>
                      <p className="text-sm text-white/80">{level.titleFr.replace(/^Niveau \d+ — /, '')}</p>
                      <p className="text-xs text-white/60 mt-1">
                        {level.starThresholds[0]}/{level.starThresholds[1]}/{level.starThresholds[2]} bonnes → ⭐
                      </p>
                    </div>
                    <span className="text-2xl shrink-0 ml-3" aria-label={`${stars} étoiles`}>
                      {locked ? '🔒' : stars > 0 ? '⭐'.repeat(stars) : '▶'}
                    </span>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
