import { useMusicStore } from '../store/musicStore'

export default function MusicToggle() {
  const { musicEnabled, toggleMusic } = useMusicStore()

  return (
    <button
      type="button"
      onClick={toggleMusic}
      title={musicEnabled ? 'Couper la musique' : 'Activer la musique'}
      aria-label={musicEnabled ? 'Couper la musique' : 'Activer la musique'}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-base ${
        musicEnabled
          ? 'bg-white/20 hover:bg-white/30 opacity-100'
          : 'bg-white/10 hover:bg-white/20 opacity-60'
      }`}
    >
      {musicEnabled ? '🔊' : '🔇'}
    </button>
  )
}
