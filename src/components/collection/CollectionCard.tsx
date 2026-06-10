import type { CollectionCardDef } from '../../types/collection'
import { RARITY_LABELS } from '../../types/collection'
import './collection.css'

interface CollectionCardProps {
  card?: CollectionCardDef
  collected?: boolean
  reserved?: boolean
  className?: string
  onClick?: () => void
}

export default function CollectionCard({
  card,
  collected = false,
  reserved = false,
  className = '',
  onClick,
}: CollectionCardProps) {
  if (reserved) {
    return (
      <div className={`collection-card collection-card--reserved ${className}`}>
        <div className="collection-card__image-wrap">
          <span className="collection-card__reserved-label">Bientôt</span>
        </div>
      </div>
    )
  }

  if (!card) {
    return (
      <div className={`collection-card collection-card--empty ${className}`}>
        <div className="collection-card__image-wrap">?</div>
      </div>
    )
  }

  const rarityClass = `collection-card--${card.rarity}`
  const lockedClass = collected ? '' : 'collection-card--locked'
  const showBadge = card.rarity !== 'common'
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`collection-card ${rarityClass} ${lockedClass} ${className}`.trim()}
    >
      <div className="collection-card__image-wrap">
        <img
          src={card.image}
          alt={card.titleFr || card.slug}
          className="collection-card__image"
        />
        {card.rarity === 'super_rare' && (
          <div className="collection-card__sparkles" aria-hidden>
            <span className="collection-card__sparkle collection-card__sparkle--1">✦</span>
            <span className="collection-card__sparkle collection-card__sparkle--2">✦</span>
            <span className="collection-card__sparkle collection-card__sparkle--3">✦</span>
            <span className="collection-card__sparkle collection-card__sparkle--4">✦</span>
          </div>
        )}
        {showBadge && (
          <span className="collection-card__rarity">{RARITY_LABELS[card.rarity]}</span>
        )}
      </div>
      {card.titleFr ? <div className="collection-card__title">{card.titleFr}</div> : null}
    </Tag>
  )
}
