import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCardCollection(profileId: string | undefined) {
  const [owned, setOwned] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profileId) {
      setOwned(new Map())
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from('card_collection')
      .select('card_id, quantity')
      .eq('profile_id', profileId)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.warn('[card_collection]', error.message)
          setOwned(new Map())
        } else {
          setOwned(new Map((data ?? []).map((r) => [r.card_id, r.quantity])))
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [profileId])

  const addCards = useCallback(
    async (cardIds: string[]) => {
      if (!profileId || cardIds.length === 0) return

      const next = new Map(owned)
      for (const cardId of cardIds) {
        next.set(cardId, (next.get(cardId) ?? 0) + 1)
      }
      setOwned(next)

      for (const cardId of cardIds) {
        const quantity = next.get(cardId) ?? 1
        await supabase.from('card_collection').upsert(
          { profile_id: profileId, card_id: cardId, quantity },
          { onConflict: 'profile_id,card_id' }
        )
      }
    },
    [profileId, owned]
  )

  const hasCard = useCallback((cardId: string) => owned.has(cardId), [owned])

  return { owned, loading, addCards, hasCard }
}
