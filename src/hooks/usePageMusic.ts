import { useEffect, useMemo } from 'react'
import { playMusic, stopMusic } from '../lib/patapamAudio'
import { useMusicStore } from '../store/musicStore'

/** Lance une musique de fond en boucle au montage ; arrêt au démontage. */
export function usePageMusic(
  url: string | null | undefined,
  loop = true,
  volume = 0.45,
): void {
  const musicEnabled = useMusicStore((s) => s.musicEnabled)
  const stableUrl = useMemo(() => url ?? null, [url])

  useEffect(() => {
    if (!stableUrl) return

    if (musicEnabled) {
      void playMusic(stableUrl, { loop, volume })
    } else {
      stopMusic()
    }

    return () => {
      stopMusic()
    }
  }, [stableUrl, loop, volume, musicEnabled])
}
