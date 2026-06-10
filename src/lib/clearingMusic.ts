import { patapamAudioPublicUrl } from './patapamAudioStorage'

/** Fichier dans patapam-audio (bucket public). */
export const CLEARING_BGM_STORAGE_PATH = 'shared/fr/music/Clairiere_Patapam.m4a'

export function clearingBgmUrl(): string {
  return patapamAudioPublicUrl(CLEARING_BGM_STORAGE_PATH)
}
