import { useState, type DragEvent } from 'react'
import { cabinItemPublicUrl } from '../../lib/cabinStorage'
import type { CabinBagItem } from '../../types/cabin'

interface CabinInventoryBarProps {
  items: CabinBagItem[]
  disabled?: boolean
  onReturnPlaced?: (placedId: string) => void
}

function parseDragPayload(raw: string): { source?: string; placedId?: string; itemId?: string } | null {
  try {
    return JSON.parse(raw) as { source?: string; placedId?: string; itemId?: string }
  } catch {
    return null
  }
}

export default function CabinInventoryBar({ items, disabled, onReturnPlaced }: CabinInventoryBarProps) {
  const [isDropOver, setIsDropOver] = useState(false)

  function handleDragStart(e: DragEvent<HTMLDivElement>, itemId: string) {
    if (disabled) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'copyMove'
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'cabin-bag', itemId }))
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    if (disabled || !onReturnPlaced) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDropOver(true)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDropOver(false)
    if (disabled || !onReturnPlaced) return

    const payload = parseDragPayload(e.dataTransfer.getData('text/plain'))
    if (payload?.source === 'cabin-placed' && payload.placedId) {
      onReturnPlaced(payload.placedId)
    }
  }

  return (
    <div
      className={`shrink-0 border-t px-3 py-2 transition-colors ${
        isDropOver ? 'border-amber-300 bg-amber-900/50' : 'border-white/20 bg-black/40'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDropOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden>
          🎒
        </span>
        <span className="text-white font-semibold text-sm">Sac d&apos;objets</span>
      </div>
      {items.length === 0 ? (
        <p className="text-white/60 text-sm px-1">
          {isDropOver
            ? 'Relâche pour ranger l’objet dans le sac.'
            : 'Sac vide — glisse un objet posé ici pour le ranger.'}
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((bag) => (
            <div
              key={bag.itemId}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, bag.itemId)}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border-2 border-amber-400/80 bg-white/90 px-2 py-1.5 min-w-[4.5rem] ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
              }`}
              title={`${bag.catalog.name_fr} — glisser vers la cabane`}
            >
              <img
                src={cabinItemPublicUrl(bag.catalog.storage_path)}
                alt=""
                className="h-10 w-10 object-contain"
                draggable={false}
              />
              <span className="text-[0.65rem] font-semibold text-gray-800 text-center leading-tight">
                {bag.catalog.name_fr}
              </span>
              {bag.available > 1 && (
                <span className="text-[0.6rem] text-gray-500">×{bag.available}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
