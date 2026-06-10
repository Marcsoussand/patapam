import flagFr from 'flag-icons/flags/4x3/fr.svg'
import flagIl from 'flag-icons/flags/4x3/il.svg'
import flagUs from 'flag-icons/flags/4x3/us.svg'

const PREVIEW_FLAGS = [
  { src: flagFr, rotate: -12 },
  { src: flagIl, rotate: 0, tall: true },
  { src: flagUs, rotate: 12 },
] as const

interface FlagsHotspotIconProps {
  className?: string
}

export default function FlagsHotspotIcon({ className }: FlagsHotspotIconProps) {
  return (
    <span
      className={`inline-flex items-end justify-center gap-1 ${className ?? ''}`}
      aria-hidden
    >
      {PREVIEW_FLAGS.map((flag, index) => (
        <img
          key={index}
          src={flag.src}
          alt=""
          className={`w-auto rounded-sm border border-white/50 object-cover shadow-lg ${
            'tall' in flag && flag.tall ? 'h-9' : 'h-8'
          }`}
          style={{ transform: `rotate(${flag.rotate}deg)` }}
        />
      ))}
    </span>
  )
}
