import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../../store/profileStore'
import { gradeInfo, resolveMathTrack } from '../../education/data/mathGrades'
import { mathLevelKey, mathLevelsForTrack } from '../../education/data/mathLevels'
import SnakeLevelPath from '../../components/education/SnakeLevelPath'
import {
  loadMathProgress,
  maxUnlockedLevelIndex,
  type MathProgressMap,
} from '../../lib/educationProgress'

export default function MathMap() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.activeProfile)
  const track = resolveMathTrack(profile?.birth_year)
  const grade = gradeInfo(track)
  const levels = mathLevelsForTrack(track)

  const [progress, setProgress] = useState<MathProgressMap>({})
  const [loading, setLoading] = useState(true)

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

  const handleSelectLevel = useCallback(
    (levelNum: number) => {
      const idx = levelNum - 1
      if (idx > maxUnlocked) return
      navigate(`/education/math/${levelNum}`)
    },
    [maxUnlocked, navigate],
  )

  if (!profile) return null

  if (levels.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-patapam-purple p-6 text-white">
        <p>Ce niveau scolaire arrive bientôt.</p>
        <button
          type="button"
          onClick={() => navigate('/education')}
          className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
        >
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-patapam-purple">
      <header className="flex items-center justify-between px-4 py-3 bg-black/30 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/education')}
          className="rounded-xl px-3 py-1.5 text-white/90 hover:bg-white/10 font-semibold text-sm"
        >
          ← Éducation
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold text-lg">🔢 Maths</h1>
          <p className="text-white/70 text-xs">{grade.labelFr}</p>
        </div>
        <div className="w-20" />
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-white/80 mt-8">Chargement…</p>
        ) : (
          <>
            <p className="text-center text-white/80 text-sm mb-4 max-w-md mx-auto">
              Réussis un niveau avec au moins 1 ⭐ pour débloquer le suivant.
              {profile.birth_year == null && (
                <span className="block mt-1 text-white/60">
                  Piste CP (kita aleph) — les plus jeunes jouent aussi cette piste.
                </span>
              )}
            </p>
            <SnakeLevelPath
              track={track}
              levelCount={levels.length}
              maxUnlockedIndex={maxUnlocked}
              progress={progress}
              onSelectLevel={handleSelectLevel}
            />
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-white/60">
              {levels.slice(0, 5).map((lvl) => {
                const stars = progress[mathLevelKey(track, lvl.id)] ?? 0
                return (
                  <span key={lvl.id} className="rounded-full bg-black/20 px-2 py-1">
                    {lvl.id}. {lvl.titleFr}
                    {stars > 0 ? ` ${'⭐'.repeat(stars)}` : ''}
                  </span>
                )
              })}
              <span className="rounded-full bg-black/20 px-2 py-1">…</span>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
