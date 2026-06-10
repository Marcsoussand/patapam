import { supabase } from '../lib/supabase'
import { codingLevelKey } from '../coding/data/mollassonLevels'

const MODULE = 'coding'

export type CodingProgressMap = Record<string, number>

export async function loadCodingProgress(profileId: string): Promise<CodingProgressMap> {
  const { data, error } = await supabase
    .from('progress')
    .select('level_id, stars')
    .eq('profile_id', profileId)
    .eq('module', MODULE)

  if (error || !data) return {}

  return Object.fromEntries(data.map((row) => [row.level_id, row.stars]))
}

export async function saveCodingProgress(
  profileId: string,
  hero: string,
  levelId: string,
  stars: number,
): Promise<void> {
  const levelKey = codingLevelKey(hero, levelId)
  const { error } = await supabase.from('progress').upsert(
    {
      profile_id: profileId,
      module: MODULE,
      level_id: levelKey,
      stars: Math.min(3, Math.max(0, stars)),
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,module,level_id' },
  )
  if (error) console.error('saveCodingProgress', error)
}

/** Dernier niveau complété (stars >= 1), ou 0 si aucune progression. */
export function highestCompletedLevelIndex(
  levels: { id: string }[],
  hero: string,
  progress: CodingProgressMap,
): number {
  for (let i = levels.length - 1; i >= 0; i--) {
    const key = codingLevelKey(hero, levels[i].id)
    if ((progress[key] ?? 0) >= 1) return i
  }
  return 0
}

/** Index max débloqué (strict) : niveau 0 toujours ouvert, N+1 si N complété (stars >= 1). */
export function maxUnlockedLevelIndex(
  levels: { id: string }[],
  hero: string,
  progress: CodingProgressMap,
): number {
  let max = 0
  for (let i = 0; i < levels.length - 1; i++) {
    const key = codingLevelKey(hero, levels[i].id)
    if ((progress[key] ?? 0) >= 1) {
      max = i + 1
    } else {
      break
    }
  }
  return max
}
