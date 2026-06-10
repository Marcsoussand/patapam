import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProfileStore } from '../../store/profileStore'
import { getFlagLevel, flagLevelKey } from '../../education/data/flagLevels'
import { FLAG_LEVELS } from '../../education/data/flagLevels'
import FlagsQuizGame from '../../components/education/FlagsQuizGame'
import { loadFlagPanel, STARTER_FLAG_PANEL_ID } from '../../lib/flagCatalog'
import {
  loadFlagProgress,
  maxUnlockedFlagLevel,
  saveFlagProgress,
  type FlagProgressMap,
} from '../../lib/flagProgress'
import { awardProfileCoins, mathVictoryCoins } from '../../lib/awardProfileCoins'
import { awardPack, withPackInventory } from '../../lib/collectionPacks'
import {
  earnsFlagPackAtThreeStars,
  flagLevelPackReward,
} from '../../education/data/flagLevelRewards'
import type { FlagPanel } from '../../types/flags'

export default function FlagsLevel() {
  const navigate = useNavigate()
  const { levelNum: levelNumParam } = useParams<{ levelNum: string }>()
  const profile = useProfileStore((s) => s.activeProfile)
  const patchActiveProfile = useProfileStore((s) => s.patchActiveProfile)
  const addCoins = useProfileStore((s) => s.addCoins)

  const levelNum = Number(levelNumParam)
  const level = Number.isFinite(levelNum) ? getFlagLevel(levelNum) : undefined

  const [panel, setPanel] = useState<FlagPanel | null>(null)
  const [progress, setProgress] = useState<FlagProgressMap>({})
  const [loading, setLoading] = useState(true)
  const [gameAttempt, setGameAttempt] = useState(0)

  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false

    Promise.all([loadFlagPanel(STARTER_FLAG_PANEL_ID), loadFlagProgress(profile.id)]).then(
      ([panelData, map]) => {
        if (cancelled) return
        setPanel(panelData)
        setProgress(map)
        setLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [profile?.id])

  const maxUnlocked = maxUnlockedFlagLevel(FLAG_LEVELS.length, progress)
  const locked = !level || level.id > maxUnlocked
  const previousStars = level ? (progress[flagLevelKey(level.id)] ?? 0) : 0
  const packReward = level ? flagLevelPackReward(level.id) : undefined
  const packEligible = level ? earnsFlagPackAtThreeStars(level.id, previousStars) : false

  async function handleComplete(_correct: number, stars: 0 | 1 | 2 | 3): Promise<number> {
    if (!profile || !level) return 0

    const coinsToAdd = mathVictoryCoins(previousStars, stars)
    const earnPack = earnsFlagPackAtThreeStars(level.id, previousStars) && stars === 3

    if (stars >= 1) {
      const best = await saveFlagProgress(profile.id, level.id, stars, previousStars)
      setProgress((prev) => ({ ...prev, [flagLevelKey(level.id)]: best }))
    }

    let nextCoins = profile.coins ?? 0
    let nextGarden = profile.garden_state ?? {}

    if (coinsToAdd > 0) {
      addCoins(coinsToAdd)
      const ok = await awardProfileCoins(profile.id, nextCoins, coinsToAdd)
      if (ok) nextCoins += coinsToAdd
    }

    if (earnPack && packReward) {
      const inventory = await awardPack(profile.id, nextGarden, packReward.type)
      nextGarden = withPackInventory(nextGarden, inventory)
    }

    if (coinsToAdd > 0 || earnPack) {
      patchActiveProfile({ coins: nextCoins, garden_state: nextGarden })
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

  if (!panel || panel.countries.length < 2) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-patapam-purple p-6 text-white text-center">
        <p>Panel drapeaux indisponible — vérifie la migration et les uploads Storage.</p>
        <button
          type="button"
          onClick={() => navigate('/education/flags')}
          className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
        >
          Retour
        </button>
      </div>
    )
  }

  if (locked || !level) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-patapam-purple p-6 text-white">
        <p>{!level ? 'Niveau introuvable.' : 'Ce niveau est verrouillé.'}</p>
        <button
          type="button"
          onClick={() => navigate('/education/flags')}
          className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
        >
          Retour aux niveaux
        </button>
      </div>
    )
  }

  if (panel.countries.length < level.questionCount) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-patapam-purple p-6 text-white text-center">
        <p>Pas assez de pays dans le panel pour ce niveau ({panel.countries.length} / {level.questionCount}).</p>
        <button
          type="button"
          onClick={() => navigate('/education/flags')}
          className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
        >
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-patapam-purple">
      <header className="flex items-center justify-between px-4 py-3 bg-black/30 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/education/flags')}
          className="rounded-xl px-3 py-1.5 text-white/90 hover:bg-white/10 font-semibold text-sm"
        >
          ← Niveaux
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

      <main className="flex-1 flex items-center justify-center py-6">
        <FlagsQuizGame
          key={gameAttempt}
          countries={panel.countries}
          questionCount={level.questionCount}
          choiceCount={level.choiceCount}
          starThresholds={level.starThresholds}
          title={level.titleFr}
          packEligible={packEligible}
          packLabel={packReward?.label ?? 'pack'}
          onComplete={handleComplete}
          onReplay={() => setGameAttempt((a) => a + 1)}
          onContinue={() => navigate('/education/flags')}
        />
      </main>
    </div>
  )
}
