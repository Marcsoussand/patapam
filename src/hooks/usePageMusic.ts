import { useEffect, useMemo } from 'react'
import { playMusic, stopMusic } from '../lib/patapamAudio'

/** Lance une musique de fond en boucle au montage ; arrêt au démontage. */
export function usePageMusic(
  url: string | null | undefined,
  loop = true,
  volume = 0.45,
): void {
  const stableUrl = useMemo(() => url ?? null, [url])

  useEffect(() => {
    if (!stableUrl) return

    void playMusic(stableUrl, { loop, volume })

    return () => {
      stopMusic()
    }
  }, [stableUrl, loop, volume])
}
