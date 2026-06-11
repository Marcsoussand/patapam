import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MusicState {
  musicEnabled: boolean
  setMusicEnabled: (enabled: boolean) => void
  toggleMusic: () => void
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      musicEnabled: true,
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
    }),
    { name: 'patapam-music' },
  ),
)
