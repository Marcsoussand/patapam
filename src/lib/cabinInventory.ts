import { supabase } from './supabase'
import type { CabinBagItem, CabinInventoryEntry, CabinItemCatalogEntry, CabinLayout } from '../types/cabin'
import { countPlacedByItemId } from './cabinLayout'

export const TEST_CABIN_ITEM_ID = 'test_lantern'

export async function loadCabinInventory(profileId: string): Promise<CabinInventoryEntry[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('item_id, quantity')
    .eq('profile_id', profileId)

  if (error) {
    console.error('loadCabinInventory', error)
    return []
  }

  return data ?? []
}

/** Offre la lanterne de test au premier passage (démo Storage + DB). */
export async function ensureTestCabinItem(profileId: string): Promise<void> {
  const { data, error } = await supabase
    .from('inventory')
    .select('id')
    .eq('profile_id', profileId)
    .eq('item_id', TEST_CABIN_ITEM_ID)
    .maybeSingle()

  if (error) {
    console.error('ensureTestCabinItem', error)
    return
  }
  if (data) return

  const { error: insertError } = await supabase.from('inventory').insert({
    profile_id: profileId,
    item_id: TEST_CABIN_ITEM_ID,
    quantity: 1,
  })

  if (insertError) console.error('ensureTestCabinItem insert', insertError)
}

export function buildBagItems(
  inventory: CabinInventoryEntry[],
  catalog: Map<string, CabinItemCatalogEntry>,
  layout: CabinLayout,
): CabinBagItem[] {
  const placed = countPlacedByItemId(layout)
  const bag: CabinBagItem[] = []

  for (const row of inventory) {
    const cat = catalog.get(row.item_id)
    if (!cat) continue
    const used = placed.get(row.item_id) ?? 0
    const available = row.quantity - used
    if (available > 0) {
      bag.push({ itemId: row.item_id, catalog: cat, available })
    }
  }

  return bag.sort((a, b) => a.catalog.sort_order - b.catalog.sort_order)
}
