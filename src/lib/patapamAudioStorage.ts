import { supabase } from './supabase'

export const PATAPAM_AUDIO_BUCKET = 'patapam-audio'
export const PATAPAM_VOICE_BUCKET = 'patapam-voice'

export function patapamAudioPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(PATAPAM_AUDIO_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

/** URL signée pour un clone vocal (bucket privé). */
export async function patapamVoiceSignedUrl(
  storagePath: string,
  expiresIn = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(PATAPAM_VOICE_BUCKET)
    .createSignedUrl(storagePath, expiresIn)
  if (error) return null
  return data.signedUrl
}
