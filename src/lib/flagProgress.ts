import { supabase } from './supabase'
import { flagLevelKey } from '../education/data/flagLevels'

const MODULE = 'flags'

export type FlagProgressMap = Record<string, number>

export async function loadFlagProgress(profileId: string): Promise<FlagProgressMap> {
  const { data, error } = await supabase
    .from('progress')
    .select('level_id, stars')
    .eq('profile_id', profileId)
    .eq('module', MODULE)

  if (error || !data) return {}

  return Object.fromEntries(data.map((row) => [row.level_id, row.stars]))
}

export async function saveFlagProgress(
  profileId: string,
  levelId: number,
  stars: number,
  previousStars = 0,
): Promise<number> {
  const best = Math.min(3, Math.max(previousStars, Math.max(0, stars)))
  if (best === 0) return 0

  const levelKey = flagLevelKey(levelId)
  const { error } = await supabase.from('progress').upsert(
    {
      profile_id: profileId,
      module: MODULE,
      level_id: levelKey,
      stars: best,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,module,level_id' },
  )
  if (error) console.error('saveFlagProgress', error)
  return best
}

export function maxUnlockedFlagLevel(
  levelCount: number,
  progress: FlagProgressMap,
): number {
  let max = 1
  for (let i = 1; i < levelCount; i++) {
    const key = flagLevelKey(i)
    if ((progress[key] ?? 0) >= 1) {
      max = i + 1
    } else {
      break
    }
  }
  return max
}
