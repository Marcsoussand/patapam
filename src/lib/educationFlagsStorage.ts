import { supabase } from './supabase'

export const EDUCATION_FLAGS_BUCKET = 'education-flags'

/**
 * Chemin objet dans le bucket education-flags.
 * - .png → .svg (anciennes lignes DB)
 * - flags/xx.svg → xx.svg (uploads à la racine du bucket)
 */
export function normalizeFlagStoragePath(storagePath: string): string {
  return storagePath.replace(/\.png$/i, '.svg').replace(/^flags\//, '')
}

export function educationFlagPublicUrl(storagePath: string): string {
  const path = normalizeFlagStoragePath(storagePath)
  const { data } = supabase.storage.from(EDUCATION_FLAGS_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export function educationFlagAudioUrl(audioPath: string | null | undefined): string | null {
  if (!audioPath) return null
  return educationFlagPublicUrl(audioPath)
}
