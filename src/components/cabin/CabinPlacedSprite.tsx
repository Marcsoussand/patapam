import { cabinItemPublicUrl } from '../../lib/cabinStorage'
import type { CabinItemCatalogEntry, CabinPlacedItem } from '../../types/cabin'

interface CabinPlacedSpriteProps {
  placed: CabinPlacedItem
  catalog: CabinItemCatalogEntry
}

export default function CabinPlacedSprite({ placed, catalog }: CabinPlacedSpriteProps) {
  return (
    <img
      src={cabinItemPublicUrl(catalog.storage_path)}
      alt=""
      className="absolute pointer-events-none object-contain drop-shadow-md"
      style={{
        left: `${placed.x * 100}%`,
        top: `${placed.y * 100}%`,
        width: `${catalog.width_pct}%`,
        height: `${catalog.height_pct}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      }}
      draggable={false}
    />
  )
}
