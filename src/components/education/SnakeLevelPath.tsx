import type { CSSProperties } from 'react'
import { mathLevelKey } from '../../education/data/mathLevels'
import type { MathGradeTrack } from '../../education/types/math'
import type { MathProgressMap } from '../../lib/educationProgress'
import '../../education/education.css'

/** Positions % pour une frise en serpent (5 colonnes × 4 rangées). */
const SNAKE_NODES: { x: number; y: number }[] = (() => {
  const cols = 5
  const rows = 4
  const nodes: { x: number; y: number }[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const c = row % 2 === 0 ? col : cols - 1 - col
      nodes.push({
        x: 10 + c * 20,
        y: 8 + row * 22,
      })
    }
  }
  return nodes
})()

interface SnakeLevelPathProps {
  track: MathGradeTrack
  levelCount: number
  maxUnlockedIndex: number
  progress: MathProgressMap
  onSelectLevel: (levelNum: number) => void
}

export default function SnakeLevelPath({
  track,
  levelCount,
  maxUnlockedIndex,
  progress,
  onSelectLevel,
}: SnakeLevelPathProps) {
  const count = Math.min(levelCount, SNAKE_NODES.length)

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-[5/4] min-h-[18rem]">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline
          points={SNAKE_NODES.slice(0, count)
            .map((p) => `${p.x},${p.y}`)
            .join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {SNAKE_NODES.slice(0, count).map((pos, idx) => {
        const levelNum = idx + 1
        const levelId = String(levelNum)
        const stars = progress[mathLevelKey(track, levelId)] ?? 0
        const locked = idx > maxUnlockedIndex
        const isHighestAccessible = idx === maxUnlockedIndex && !locked
        const style: CSSProperties = {
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
        }

        return (
          <button
            key={levelNum}
            type="button"
            disabled={locked}
            onClick={() => onSelectLevel(levelNum)}
            style={style}
            className={`absolute flex flex-col items-center gap-0.5 transition-transform ${
              locked ? 'cursor-not-allowed opacity-45' : 'hover:scale-110 cursor-pointer'
            }`}
            aria-label={`Niveau ${levelNum}${locked ? ', verrouillé' : ''}`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full border-[3px] text-base font-black shadow-lg ${
                locked
                  ? 'border-white/30 bg-gray-600/80 text-white/50'
                  : isHighestAccessible
                    ? 'math-snake-node--highlight border-white bg-purple-600 text-white'
                    : stars >= 1
                      ? 'border-amber-300 bg-amber-500 text-white'
                      : 'border-white bg-purple-600 text-white'
              }`}
            >
              {locked ? '🔒' : levelNum}
            </span>
            {stars > 0 && (
              <span className="text-[0.65rem] leading-none" aria-hidden>
                {'⭐'.repeat(stars)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
