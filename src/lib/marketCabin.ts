import { awardProfileCoins, spendProfileCoins } from './awardProfileCoins'
import { countPlacedByItemId } from './cabinLayout'
import { loadCabinCatalog } from './cabinCatalog'
import { loadCabinInventory } from './cabinInventory'
import { supabase } from './supabase'
import type { CabinInventoryEntry, CabinItemCatalogEntry, CabinLayout } from '../types/cabin'

export async function loadMarketCatalog(): Promise<CabinItemCatalogEntry[]> {
  const items = await loadCabinCatalog()
  return items.filter((item) => item.price_coins > 0)
}

export function sellableQuantity(
  inventory: CabinInventoryEntry[],
  layout: CabinLayout,
  itemId: string,
): number {
  const row = inventory.find((entry) => entry.item_id === itemId)
  if (!row) return 0
  const placed = countPlacedByItemId(layout).get(itemId) ?? 0
  return Math.max(0, row.quantity - placed)
}

export function buildSellableItems(
  inventory: CabinInventoryEntry[],
  catalog: Map<string, CabinItemCatalogEntry>,
  layout: CabinLayout,
): { itemId: string; catalog: CabinItemCatalogEntry; available: number }[] {
  const items: { itemId: string; catalog: CabinItemCatalogEntry; available: number }[] = []

  for (const row of inventory) {
    const cat = catalog.get(row.item_id)
    if (!cat || cat.price_coins <= 0) continue
    const available = sellableQuantity(inventory, layout, row.item_id)
    if (available > 0) {
      items.push({ itemId: row.item_id, catalog: cat, available })
    }
  }

  return items.sort((a, b) => a.catalog.sort_order - b.catalog.sort_order)
}

async function addInventoryQuantity(profileId: string, itemId: string): Promise<boolean> {
  const { data, error: readError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('profile_id', profileId)
    .eq('item_id', itemId)
    .maybeSingle()

  if (readError) {
    console.error('addInventoryQuantity read', readError)
    return false
  }

  if (data) {
    const { error } = await supabase
      .from('inventory')
      .update({ quantity: data.quantity + 1 })
      .eq('profile_id', profileId)
      .eq('item_id', itemId)
    if (error) console.error('addInventoryQuantity update', error)
    return !error
  }

  const { error } = await supabase.from('inventory').insert({
    profile_id: profileId,
    item_id: itemId,
    quantity: 1,
  })
  if (error) console.error('addInventoryQuantity insert', error)
  return !error
}

async function removeInventoryQuantity(profileId: string, itemId: string): Promise<boolean> {
  const { data, error: readError } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('profile_id', profileId)
    .eq('item_id', itemId)
    .maybeSingle()

  if (readError || !data || data.quantity < 1) {
    if (readError) console.error('removeInventoryQuantity read', readError)
    return false
  }

  if (data.quantity === 1) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('profile_id', profileId)
      .eq('item_id', itemId)
    if (error) console.error('removeInventoryQuantity delete', error)
    return !error
  }

  const { error } = await supabase
    .from('inventory')
    .update({ quantity: data.quantity - 1 })
    .eq('profile_id', profileId)
    .eq('item_id', itemId)
  if (error) console.error('removeInventoryQuantity update', error)
  return !error
}

export async function buyCabinMarketItem(
  profileId: string,
  item: CabinItemCatalogEntry,
  currentCoins: number,
): Promise<{ ok: boolean; coins: number; inventory: CabinInventoryEntry[] }> {
  const price = item.price_coins
  if (price <= 0 || currentCoins < price) {
    return { ok: false, coins: currentCoins, inventory: await loadCabinInventory(profileId) }
  }

  const spent = await spendProfileCoins(profileId, currentCoins, price)
  if (!spent) {
    return { ok: false, coins: currentCoins, inventory: await loadCabinInventory(profileId) }
  }

  const added = await addInventoryQuantity(profileId, item.id)
  if (!added) {
    await awardProfileCoins(profileId, currentCoins - price, price)
    return { ok: false, coins: currentCoins, inventory: await loadCabinInventory(profileId) }
  }

  return {
    ok: true,
    coins: currentCoins - price,
    inventory: await loadCabinInventory(profileId),
  }
}

export async function sellCabinMarketItem(
  profileId: string,
  item: CabinItemCatalogEntry,
  layout: CabinLayout,
  currentCoins: number,
  inventory: CabinInventoryEntry[],
): Promise<{ ok: boolean; coins: number; inventory: CabinInventoryEntry[] }> {
  const price = item.price_coins
  if (price <= 0 || sellableQuantity(inventory, layout, item.id) < 1) {
    return { ok: false, coins: currentCoins, inventory }
  }

  const removed = await removeInventoryQuantity(profileId, item.id)
  if (!removed) {
    return { ok: false, coins: currentCoins, inventory }
  }

  const credited = await awardProfileCoins(profileId, currentCoins, price)
  if (!credited) {
    await addInventoryQuantity(profileId, item.id)
    return { ok: false, coins: currentCoins, inventory: await loadCabinInventory(profileId) }
  }

  return {
    ok: true,
    coins: currentCoins + price,
    inventory: await loadCabinInventory(profileId),
  }
}
