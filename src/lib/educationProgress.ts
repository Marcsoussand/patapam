import { supabase } from './supabase'
import type { MathGradeTrack } from '../education/types/math'
import { mathLevelKey } from '../education/data/mathLevels'

const MODULE = 'math'

export type MathProgressMap = Record<string, number>

export async function loadMathProgress(profileId: string): Promise<MathProgressMap> {
  const { data, error } = await supabase
    .from('progress')
    .select('level_id, stars')
    .eq('profile_id', profileId)
    .eq('module', MODULE)

  if (error || !data) return {}

  return Object.fromEntries(data.map((row) => [row.level_id, row.stars]))
}

export async function saveMathProgress(
  profileId: string,
  track: MathGradeTrack,
  levelId: string,
  stars: number,
  previousStars = 0,
): Promise<number> {
  const best = Math.min(3, Math.max(previousStars, Math.max(0, stars)))
  if (best === 0) return 0

  const levelKey = mathLevelKey(track, levelId)
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
  if (error) console.error('saveMathProgress', error)
  return best
}

export function maxUnlockedLevelIndex(
  levels: { id: string }[],
  track: MathGradeTrack,
  progress: MathProgressMap,
): number {
  let max = 0
  for (let i = 0; i < levels.length - 1; i++) {
    const key = mathLevelKey(track, levels[i].id)
    if ((progress[key] ?? 0) >= 1) {
      max = i + 1
    } else {
      break
    }
  }
  return max
}
