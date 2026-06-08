export interface FlagCountry {
  id: string
  name_fr: string
  name_en: string
  name_he: string
  storage_path: string
  audio_path_fr: string | null
  audio_path_en: string | null
  audio_path_he: string | null
}

export interface FlagPanel {
  id: string
  name_fr: string
  name_en: string
  name_he: string
  choice_count: number
  countries: FlagCountry[]
}

export interface FlagQuestion {
  promptCountry: FlagCountry
  choices: FlagCountry[]
}
