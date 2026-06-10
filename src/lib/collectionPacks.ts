import { supabase } from './supabase'
import type { PackType } from './packLogic'

export type { PackType } from './packLogic'

export interface PackInventory {
  simple: number
  gold: number
}

/** Futur : récompense quotidienne J1–J7 (jour manqué = même palier, pas de reset). */
export interface DailyRewardState {
  streak_day: number
  last_claim_at: string | null
}

export function parsePackInventory(gardenState: Record<string, unknown> | undefined): PackInventory {
  const raw = gardenState?.pack_inventory
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const inv = raw as Record<string, unknown>
    return {
      simple: typeof inv.simple === 'number' && inv.simple > 0 ? inv.simple : 0,
      gold: typeof inv.gold === 'number' && inv.gold > 0 ? inv.gold : 0,
    }
  }

  const legacy = gardenState?.unopened_packs
  if (typeof legacy === 'number' && legacy > 0) {
    return { simple: legacy, gold: 0 }
  }

  return { simple: 0, gold: 0 }
}

export function totalPackCount(inventory: PackInventory): number {
  return inventory.simple + inventory.gold
}

export function withPackInventory(
  gardenState: Record<string, unknown> | undefined,
  inventory: PackInventory,
): Record<string, unknown> {
  const { unopened_packs: _legacy, ...rest } = gardenState ?? {}
  return { ...rest, pack_inventory: inventory }
}

async function saveGardenState(
  profileId: string,
  gardenState: Record<string, unknown>,
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ garden_state: gardenState })
    .eq('id', profileId)

  if (error) {
    console.error('saveGardenState', error)
    return false
  }
  return true
}

/** 2 packs simples + 1 pack or — une seule fois par profil. */
export async function ensureStarterPacks(
  profileId: string,
  gardenState: Record<string, unknown> | undefined,
): Promise<Record<string, unknown>> {
  if (gardenState?.starter_packs_granted === true) {
    return gardenState ?? {}
  }

  const inventory = parsePackInventory(gardenState)
  inventory.simple += 2
  inventory.gold += 1

  const newState = {
    ...withPackInventory(gardenState, inventory),
    starter_packs_granted: true,
  }

  await saveGardenState(profileId, newState)
  return newState
}

export async function awardPack(
  profileId: string,
  gardenState: Record<string, unknown> | undefined,
  type: PackType,
  count = 1,
): Promise<PackInventory> {
  const inventory = parsePackInventory(gardenState)
  inventory[type] += count
  const newState = withPackInventory(gardenState, inventory)
  await saveGardenState(profileId, newState)
  return inventory
}

export async function consumePack(
  profileId: string,
  gardenState: Record<string, unknown> | undefined,
  type: PackType,
): Promise<PackInventory | null> {
  const inventory = parsePackInventory(gardenState)
  if (inventory[type] < 1) return null

  inventory[type] -= 1
  const newState = withPackInventory(gardenState, inventory)
  const ok = await saveGardenState(profileId, newState)
  return ok ? inventory : null
}

export async function addPackToInventory(
  profileId: string,
  gardenState: Record<string, unknown> | undefined,
  type: PackType,
): Promise<PackInventory | null> {
  const inventory = parsePackInventory(gardenState)
  inventory[type] += 1
  const newState = withPackInventory(gardenState, inventory)
  const ok = await saveGardenState(profileId, newState)
  return ok ? inventory : null
}
