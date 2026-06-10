import { patapamAudioPublicUrl } from './patapamAudioStorage'

export type ZoneBgmKey = 'clearing' | 'education' | 'games' | 'beach' | 'cabin'

/** Chemins exacts dans le bucket public patapam-audio (sensible à la casse). */
const ZONE_BGM_PATHS: Record<ZoneBgmKey, string> = {
  clearing: 'shared/fr/music/Clairiere_Patapam.m4a',
  education: 'shared/fr/music/Forest_Lemonade.m4a',
  games: 'shared/fr/music/Forest_Lemonade2.m4a',
  beach: 'shared/fr/music/Ukulele_Brass.m4a',
  cabin: 'shared/fr/music/Ukulele_Brass2.m4a',
}

export function zoneBgmUrl(zone: ZoneBgmKey): string {
  return patapamAudioPublicUrl(ZONE_BGM_PATHS[zone])
}
