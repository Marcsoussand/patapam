import { supabase } from './supabase'

export const CABIN_ITEMS_BUCKET = 'cabin-items'

/** URL publique d'un fichier dans le bucket cabin-items. */
export function cabinItemPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(CABIN_ITEMS_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}
