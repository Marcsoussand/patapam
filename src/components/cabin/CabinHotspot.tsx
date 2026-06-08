import type { CSSProperties, DragEvent, ReactNode } from 'react'

interface CabinHotspotProps {
  style: CSSProperties
  onClick: () => void
  label: string
  children?: ReactNode
}

export default function CabinHotspot({ style, onClick, label }: CabinHotspotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className="group absolute flex items-center justify-center border-2 border-transparent hover:border-white/50 hover:bg-white/15 transition-all duration-200 rounded-lg z-20"
      aria-label={label}
    >
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm drop-shadow-lg bg-black/40 px-2 py-1 rounded-lg">
        {label}
      </span>
    </button>
  )
}

export function cabinSceneCoords(
  e: DragEvent<HTMLElement>,
  container: HTMLElement,
): { x: number; y: number } | null {
  const rect = container.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return null
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  if (x < 0 || x > 1 || y < 0 || y > 1) return null
  return { x, y }
}
