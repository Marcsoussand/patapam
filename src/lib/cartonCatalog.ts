import {
  getCategory,
  type AgeGroup,
  type CardWord,
  type CategoryKey,
} from '../data/cartons'
import type { Language } from '../store/languageStore'
import { patapamAudioPublicUrl } from './patapamAudioStorage'
import { sharedYoungWordUrl, sharedYoungWhereisUrl } from './cartonAudio'
import { supabase } from './supabase'

type CartonWordRow = {
  id: string
  category: string
  slot_type: string
  label_fr: string
  label_en: string
  label_he: string
  slug: string
  sort_order: number
}

type CartonAudioRow = {
  word_id: string
  audio_kind: 'word' | 'whereis'
  storage_path: string
}

/** Prénoms famille — en dur pour l’instant (voir resolveFamilleProfileWords). */
const HARDCODED_FAMILLE_PROFILES: CartonWordRow[] = [
  {
    id: 'famille_aaron',
    category: 'famille',
    slot_type: 'profile',
    label_fr: 'aaron',
    label_en: 'aaron',
    label_he: 'אהרון',
    slug: 'aaron',
    sort_order: 3,
  },
  {
    id: 'famille_naor',
    category: 'famille',
    slot_type: 'profile',
    label_fr: 'naor',
    label_en: 'naor',
    label_he: 'נאור',
    slug: 'naor',
    sort_order: 4,
  },
  {
    id: 'famille_elon',
    category: 'famille',
    slot_type: 'profile',
    label_fr: 'elon',
    label_en: 'elon',
    label_he: 'אלון',
    slug: 'elon',
    sort_order: 5,
  },
]

/*
// TODO — prénoms dynamiques depuis profiles + audio patapam-voice :
//
// export async function resolveFamilleProfileWords(parentId: string): Promise<CardWord[]> {
//   const { data: profiles } = await supabase
//     .from('profiles')
//     .select('id, name, slug')
//     .eq('parent_id', parentId)
//   ...
//   const { data: audios } = await supabase
//     .from('carton_word_audio')
//     .select('word_id, storage_path, profile_id')
//     .eq('parent_id', parentId)
//     .in('word_id', profileWordIds)
//   ...
// }
*/

function localeForLanguage(lang: Language): 'fr' | 'en' | 'he' {
  if (lang === 'en') return 'en'
  if (lang === 'he') return 'he'
  return 'fr'
}

/** Libellés statiques + URLs Supabase (si la requête DB échoue). */
function staticFallbackWords(
  category: CategoryKey,
  locale: 'fr' | 'en' | 'he',
): CardWord[] {
  const cat = getCategory(category)
  if (!cat) return []
  return cat.words.map((w) => ({
    ...w,
    learnAudioUrl:
      category === 'famille' ? null : sharedYoungWordUrl(category, w.slug, locale),
    whereisUrl:
      category === 'famille' ? null : sharedYoungWhereisUrl(category, w.slug, locale),
  }))
}

function mapRowToCardWord(
  row: CartonWordRow,
  category: CategoryKey,
  locale: 'fr' | 'en' | 'he',
  audioByWord: Map<string, { word?: string; whereis?: string }>,
): CardWord {
  const paths = audioByWord.get(row.id)
  const learnFromDb = paths?.word ? patapamAudioPublicUrl(paths.word) : null
  const whereisFromDb = paths?.whereis ? patapamAudioPublicUrl(paths.whereis) : null

  const fallbackWord =
    category === 'famille'
      ? null
      : sharedYoungWordUrl(category, row.slug, locale)

  return {
    id: row.id,
    slug: row.slug,
    fr: row.label_fr,
    en: row.label_en,
    he: row.label_he,
    learnAudioUrl: learnFromDb ?? fallbackWord,
    whereisUrl:
      whereisFromDb ??
      (category === 'famille' ? null : sharedYoungWhereisUrl(category, row.slug, locale)),
  }
}

export async function loadCartonCategoryWords(
  category: CategoryKey,
  ageGroup: AgeGroup,
  language: Language,
): Promise<CardWord[]> {
  const locale = localeForLanguage(language)

  const { data: rows, error } = await supabase
    .from('carton_words')
    .select('id, category, slot_type, label_fr, label_en, label_he, slug, sort_order')
    .eq('category', category)
    .eq('age_group', ageGroup)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('loadCartonCategoryWords', error)
    return staticFallbackWords(category, locale)
  }

  let words = (rows ?? []) as CartonWordRow[]

  if (category === 'famille') {
    const ids = new Set(words.map((w) => w.id))
    for (const profile of HARDCODED_FAMILLE_PROFILES) {
      if (!ids.has(profile.id)) words.push(profile)
    }
    words = [...words].sort((a, b) => a.sort_order - b.sort_order)
  }

  if (words.length === 0) return staticFallbackWords(category, locale)

  const wordIds = words.map((w) => w.id)
  const { data: audioRows, error: audioError } = await supabase
    .from('carton_word_audio')
    .select('word_id, audio_kind, storage_path')
    .in('word_id', wordIds)
    .eq('locale', locale)
    .eq('is_active', true)
    .is('parent_id', null)
    .is('profile_id', null)

  if (audioError) console.error('loadCartonCategoryWords audio', audioError)

  const audioByWord = new Map<string, { word?: string; whereis?: string }>()
  for (const row of (audioRows ?? []) as CartonAudioRow[]) {
    const entry = audioByWord.get(row.word_id) ?? {}
    if (row.audio_kind === 'word') entry.word = row.storage_path
    if (row.audio_kind === 'whereis') entry.whereis = row.storage_path
    audioByWord.set(row.word_id, entry)
  }

  return words.map((row) => mapRowToCardWord(row, category, locale, audioByWord))
}
