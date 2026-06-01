import { create } from 'zustand'

/** Cache local de progression par profil × module × niveau */
interface ModuleProgress {
  stars: 0 | 1 | 2 | 3
  completedAt?: string // ISO date
}

type ProgressKey = string // `${profileId}:${moduleId}:${levelId}`

interface ProgressState {
  progress: Record<ProgressKey, ModuleProgress>
  setProgress: (key: ProgressKey, data: ModuleProgress) => void
  getProgress: (key: ProgressKey) => ModuleProgress | undefined
  clearProgress: () => void
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},

  setProgress: (key, data) =>
    set((state) => ({
      progress: { ...state.progress, [key]: data },
    })),

  getProgress: (key) => get().progress[key],

  clearProgress: () => set({ progress: {} }),
}))
