import { useCallback, useEffect, useState } from 'react'
import type { CollectionCardDef } from '../../types/collection'
import type { PackType } from '../../lib/packLogic'
import CollectionCard from './CollectionCard'
import './collection.css'

type PackPhase = 'sealed' | 'tearing' | 'revealing' | 'done'

interface StickerPackProps {
  packType: PackType
  cards: CollectionCardDef[]
  onComplete: (cards: CollectionCardDef[]) => void
}

export default function StickerPack({ packType, cards, onComplete }: StickerPackProps) {
  const [phase, setPhase] = useState<PackPhase>('sealed')
  const [revealedCount, setRevealedCount] = useState(0)
  const [flyingIndex, setFlyingIndex] = useState<number | null>(null)

  const isGold = packType === 'gold'
  const envelopeClass = isGold
    ? 'sticker-pack__envelope sticker-pack__envelope--gold'
    : 'sticker-pack__envelope sticker-pack__envelope--simple'

  const startOpen = useCallback(() => {
    setPhase('tearing')
    setRevealedCount(0)
    setFlyingIndex(null)
    window.setTimeout(() => setPhase('revealing'), 750)
  }, [])

  const revealNext = useCallback(() => {
    if (phase !== 'revealing' || flyingIndex !== null) return
    if (revealedCount >= cards.length) return

    setFlyingIndex(revealedCount)
    window.setTimeout(() => {
      setRevealedCount((c) => c + 1)
      setFlyingIndex(null)
      if (revealedCount + 1 >= cards.length) {
        setPhase('done')
      }
    }, 550)
  }, [phase, flyingIndex, revealedCount, cards.length])

  const remaining = cards.slice(revealedCount)

  useEffect(() => {
    if (phase !== 'done') return
    const timer = window.setTimeout(() => onComplete(cards), 700)
    return () => window.clearTimeout(timer)
  }, [phase, cards, onComplete])

  return (
    <div className="sticker-pack">
      {phase === 'sealed' && (
        <button type="button" className={envelopeClass} onClick={startOpen}>
          <div className="sticker-pack__flap" aria-hidden />
          <div className="sticker-pack__body">
            <span className="sticker-pack__label">PATAPAM</span>
            <span className="sticker-pack__count">{cards.length} images</span>
          </div>
        </button>
      )}

      {phase === 'tearing' && (
        <div className={`${envelopeClass} sticker-pack__envelope--tearing`}>
          <div className="sticker-pack__flap" aria-hidden />
          <div className="sticker-pack__body">
            <span className="sticker-pack__label">PATAPAM</span>
          </div>
        </div>
      )}

      {(phase === 'revealing' || phase === 'done') && cards.length > 0 && (
        <>
          <div className="sticker-pack__stack">
            {remaining.map((card, i) => (
              <div
                key={card.id}
                className={`sticker-pack__stack-item${
                  flyingIndex === revealedCount && i === 0 ? ' sticker-pack__stack-item--fly' : ''
                }`}
                style={{ zIndex: remaining.length - i }}
                onClick={phase === 'revealing' && i === 0 ? revealNext : undefined}
                onKeyDown={
                  phase === 'revealing' && i === 0
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') revealNext()
                      }
                    : undefined
                }
                role={phase === 'revealing' && i === 0 ? 'button' : undefined}
                tabIndex={phase === 'revealing' && i === 0 ? 0 : undefined}
              >
                <CollectionCard card={card} collected />
              </div>
            ))}
          </div>

          {phase === 'revealing' && remaining.length > 0 && (
            <p className="sticker-pack__hint">Touche la carte du dessus pour la révéler</p>
          )}
        </>
      )}
    </div>
  )
}
