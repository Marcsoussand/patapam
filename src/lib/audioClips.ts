import i18n from '../i18n'
import type { AppLocale, AudioClip, AudioClipCategory } from '../types/audio'
import { patapamAudioPublicUrl } from './patapamAudioStorage'
import { playSfx, stopPatapamAudio } from './patapamAudio'
import { supabase } from './supabase'

const clipCache = new Map<string, AudioClip[]>()

export { stopPatapamAudio }

export function currentAppLocale(): AppLocale {
  const lng = i18n.language?.slice(0, 2)
  if (lng === 'en' || lng === 'he') return lng
  return 'fr'
}

function cacheKey(category: AudioClipCategory, locale: AppLocale): string {
  return `${category}:${locale}`
}

export async function playPatapamAudioUrl(url: string): Promise<HTMLAudioElement | null> {
  return playSfx(url)
}

export async function loadAudioClips(
  category: AudioClipCategory,
  locale: AppLocale = currentAppLocale(),
): Promise<AudioClip[]> {
  const key = cacheKey(category, locale)
  const cached = clipCache.get(key)
  if (cached) return cached

  const { data, error } = await supabase
    .from('audio_clips')
    .select('id, clip_key, category, locale, label, storage_path, voice_profile_id, sort_order, is_active')
    .eq('category', category)
    .eq('locale', locale)
    .eq('is_active', true)
    .is('voice_profile_id', null)
    .order('sort_order')

  if (error || !data) return []

  const clips = data as AudioClip[]
  clipCache.set(key, clips)
  return clips
}

export function clearAudioClipCache(): void {
  clipCache.clear()
}

export async function getAudioClip(
  clipKey: string,
  category: AudioClipCategory,
  locale: AppLocale = currentAppLocale(),
): Promise<AudioClip | null> {
  const clips = await loadAudioClips(category, locale)
  return clips.find((c) => c.clip_key === clipKey) ?? null
}

export async function playAudioClip(
  clipKey: string,
  category: AudioClipCategory,
  locale: AppLocale = currentAppLocale(),
): Promise<HTMLAudioElement | null> {
  const clip = await getAudioClip(clipKey, category, locale)
  if (!clip) return null
  return playPatapamAudioUrl(patapamAudioPublicUrl(clip.storage_path))
}

export async function playRandomAudioClip(
  category: AudioClipCategory,
  locale: AppLocale = currentAppLocale(),
): Promise<HTMLAudioElement | null> {
  const clips = await loadAudioClips(category, locale)
  if (clips.length === 0) return null
  const pick = clips[Math.floor(Math.random() * clips.length)]
  return playPatapamAudioUrl(patapamAudioPublicUrl(pick.storage_path))
}

export async function playCongrats(locale: AppLocale = currentAppLocale()): Promise<HTMLAudioElement | null> {
  let clips = await loadAudioClips('congrats', locale)
  if (clips.length === 0 && locale !== 'fr') {
    clips = await loadAudioClips('congrats', 'fr')
  }
  if (clips.length === 0) return null
  const pick = clips[Math.floor(Math.random() * clips.length)]
  return playPatapamAudioUrl(patapamAudioPublicUrl(pick.storage_path))
}

export async function playEncouragement(
  locale: AppLocale = currentAppLocale(),
): Promise<HTMLAudioElement | null> {
  return playRandomAudioClip('encouragement', locale)
}

export async function playMathPrompt(
  mode: 'max' | 'min',
  locale: AppLocale = currentAppLocale(),
): Promise<HTMLAudioElement | null> {
  return playAudioClip(mode === 'max' ? 'plus_grand' : 'plus_petit', 'math_prompt', locale)
}

export async function playFlagsPrompt(
  locale: AppLocale = currentAppLocale(),
): Promise<HTMLAudioElement | null> {
  return playAudioClip('quel_drapeau', 'flags_prompt', locale)
}
