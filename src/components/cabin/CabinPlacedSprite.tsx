import type { DragEvent } from 'react'
import { cabinItemPublicUrl } from '../../lib/cabinStorage'
import type { CabinItemCatalogEntry, CabinPlacedItem } from '../../types/cabin'

interface CabinPlacedSpriteProps {
  placed: CabinPlacedItem
  catalog: CabinItemCatalogEntry
  selected?: boolean
  disabled?: boolean
  onSelect: () => void
}

export default function CabinPlacedSprite({
  placed,
  catalog,
  selected,
  disabled,
  onSelect,
}: CabinPlacedSpriteProps) {
  function handleDragStart(e: DragEvent<HTMLImageElement>) {
    if (disabled) {
      e.preventDefault()
      return
    }
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ source: 'cabin-placed', placedId: placed.id, itemId: placed.itemId }),
    )
  }

  return (
    <img
      src={cabinItemPublicUrl(catalog.storage_path)}
      alt=""
      draggable={!disabled}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onDragStart={handleDragStart}
      className={`absolute object-contain drop-shadow-md transition-shadow ${
        disabled ? 'pointer-events-none opacity-50' : 'cursor-grab active:cursor-grabbing'
      } ${selected ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-transparent rounded-lg' : 'hover:ring-2 hover:ring-white/40 rounded-lg'}`}
      style={{
        left: `${placed.x * 100}%`,
        top: `${placed.y * 100}%`,
        width: `${catalog.width_pct}%`,
        height: `${catalog.height_pct}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: selected ? 30 : 10,
      }}
    />
  )
}
