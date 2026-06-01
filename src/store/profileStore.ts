import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChildProfile {
  id: string
  name: string
  birth_year: number
  character_id: string
  coins: number
  play_days_total: number
  cabin_layout: Record<string, unknown>
  garden_state: Record<string, unknown>
}

interface ProfileState {
  activeProfile: ChildProfile | null
  setActiveProfile: (profile: ChildProfile | null) => void
  addCoins: (amount: number) => void
  incrementPlayDays: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      activeProfile: null,

      setActiveProfile: (profile) => set({ activeProfile: profile }),

      addCoins: (amount) =>
        set((state) => {
          if (!state.activeProfile) return state
          return {
            activeProfile: {
              ...state.activeProfile,
              coins: state.activeProfile.coins + amount,
            },
          }
        }),

      incrementPlayDays: () =>
        set((state) => {
          if (!state.activeProfile) return state
          return {
            activeProfile: {
              ...state.activeProfile,
              play_days_total: state.activeProfile.play_days_total + 1,
            },
          }
        }),
    }),
    { name: 'patapam-profile' }
  )
)
