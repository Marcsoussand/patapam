import type { DragEvent } from 'react'
import { cabinItemPublicUrl } from '../../lib/cabinStorage'
import type { CabinBagItem } from '../../types/cabin'

interface CabinInventoryBarProps {
  items: CabinBagItem[]
  disabled?: boolean
}

export default function CabinInventoryBar({ items, disabled }: CabinInventoryBarProps) {
  function handleDragStart(e: DragEvent<HTMLDivElement>, itemId: string) {
    if (disabled) {
      e.preventDefault()
      return
    }
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'cabin-bag', itemId }))
  }

  return (
    <div className="shrink-0 border-t border-white/20 bg-black/40 px-3 py-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" aria-hidden>
          🎒
        </span>
        <span className="text-white font-semibold text-sm">Sac d&apos;objets</span>
      </div>
      {items.length === 0 ? (
        <p className="text-white/60 text-sm px-1">Aucun objet disponible — glisse un objet gagné ici plus tard.</p>
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
