import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'fr' | 'en' | 'he'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'patapam-language' }
  )
)
