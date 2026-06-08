import { supabase } from './supabase'

/** Pièces gagnées = delta d'étoiles (1–3), sans refarm si déjà au max. */
export function mathVictoryCoins(previousStars: number, newStars: number): number {
  if (newStars < 1) return 0
  return Math.max(0, newStars - previousStars)
}

export async function awardProfileCoins(
  profileId: string,
  currentCoins: number,
  coinsToAdd: number,
): Promise<boolean> {
  if (coinsToAdd <= 0) return true

  const { error } = await supabase
    .from('profiles')
    .update({ coins: currentCoins + coinsToAdd })
    .eq('id', profileId)

  if (error) {
    console.error('awardProfileCoins', error)
    return false
  }
  return true
}
