export type AppLocale = 'fr' | 'en' | 'he'

export type AudioClipCategory =
  | 'congrats'
  | 'encouragement'
  | 'math_prompt'
  | 'math_number_unit'
  | 'math_number_ten'
  | 'math_number_hundred'
  | 'math_number_link'
  | 'math_number_special'
  | 'flags_prompt'
  | 'flags_article'
  | 'flags_country'
  | 'vocab_word'

export interface AudioClip {
  id: string
  clip_key: string
  category: AudioClipCategory
  locale: AppLocale
  label: string
  storage_path: string
  voice_profile_id: string | null
  sort_order: number
  is_active: boolean
}
