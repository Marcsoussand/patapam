import { useEffect } from 'react'
import redFlower from '../../img/coding/obstacles/mollasson/red_flower.png'
import orangeFlower from '../../img/coding/obstacles/mollasson/orange_flower.png'
import { starLabel } from '../../education/utils/mathStars'
import { playCongrats } from '../../lib/audioClips'

interface MathLevelSuccessProps {
  title: string
  correct: number
  total: number
  stars: 1 | 2 | 3
  coinsAwarded: number
  onReplay: () => void
  onContinue: () => void
}

export default function MathLevelSuccess({
  title,
  correct,
  total,
  stars,
  coinsAwarded,
  onReplay,
  onContinue,
}: MathLevelSuccessProps) {
  useEffect(() => {
    void playCongrats()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="relative max-w-sm w-full rounded-3xl bg-white px-6 py-8 text-center shadow-2xl">
        <img
          src={redFlower}
          alt=""
          className="pointer-events-none absolute -left-4 -top-6 h-16 w-16 rotate-[-18deg] object-contain drop-shadow-md"
          aria-hidden
        />
        <img
          src={orangeFlower}
          alt=""
          className="pointer-events-none absolute -right-4 -top-5 h-14 w-14 rotate-[22deg] object-contain drop-shadow-md"
          aria-hidden
        />
        <img
          src={redFlower}
          alt=""
          className="pointer-events-none absolute -bottom-5 left-6 h-12 w-12 rotate-[12deg] object-contain drop-shadow-md"
          aria-hidden
        />
        <img
          src={orangeFlower}
          alt=""
          className="pointer-events-none absolute -bottom-4 -right-2 h-16 w-16 rotate-[-15deg] object-contain drop-shadow-md"
          aria-hidden
        />

        <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-emerald-600 font-bold text-lg mb-2">Niveau réussi !</p>
        <p className="text-gray-600 text-sm mb-3">
          {correct} / {total} bonnes réponses
        </p>
        <p className="text-3xl mb-3" aria-label={`${stars} étoiles`}>
          {starLabel(stars)}
        </p>
        {coinsAwarded > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-400 bg-amber-50 px-4 py-1.5 text-lg font-bold text-amber-700 mb-5">
            <span>+{coinsAwarded}</span>
            <span className="text-xl leading-none" aria-hidden>
              🪙
            </span>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onReplay}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-bold text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl leading-none" aria-hidden>
              🔁
            </span>
            Rejouer
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-bold text-white hover:bg-purple-700 transition-colors"
          >
            <span className="text-xl leading-none" aria-hidden>
              ▶
            </span>
            Continuer
          </button>
        </div>
      </div>
    </div>
  )
}
