import type { Json } from '../types/database'
import { supabase } from './supabase'
import type { CabinFloor, CabinLayout, CabinPlacedItem } from '../types/cabin'

const EMPTY_LAYOUT: CabinLayout = { floor1: [], floor2: [] }

function isPlacedItem(value: unknown): value is CabinPlacedItem {
  if (!value || typeof value !== 'object') return false
  const o = value as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.itemId === 'string' &&
    typeof o.x === 'number' &&
    typeof o.y === 'number'
  )
}

function parseFloorItems(value: unknown): CabinPlacedItem[] {
  if (!Array.isArray(value)) return []
  return value.filter(isPlacedItem)
}

/** Normalise l'ancien format [] ou un objet partiel. */
export function parseCabinLayout(raw: unknown): CabinLayout {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...EMPTY_LAYOUT, floor1: parseFloorItems(raw) }
  }
  const o = raw as Record<string, unknown>
  return {
    floor1: parseFloorItems(o.floor1),
    floor2: parseFloorItems(o.floor2),
  }
}

export function floorKey(floor: CabinFloor): 'floor1' | 'floor2' {
  return floor === 1 ? 'floor1' : 'floor2'
}

export function countPlacedByItemId(layout: CabinLayout): Map<string, number> {
  const counts = new Map<string, number>()
  for (const item of [...layout.floor1, ...layout.floor2]) {
    counts.set(item.itemId, (counts.get(item.itemId) ?? 0) + 1)
  }
  return counts
}

export async function loadCabinLayout(profileId: string): Promise<CabinLayout> {
  const { data, error } = await supabase
    .from('profiles')
    .select('cabin_layout')
    .eq('id', profileId)
    .single()

  if (error) {
    console.error('loadCabinLayout', error)
    return { ...EMPTY_LAYOUT }
  }

  return parseCabinLayout(data?.cabin_layout)
}

export async function saveCabinLayout(profileId: string, layout: CabinLayout): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ cabin_layout: layout as unknown as Json })
    .eq('id', profileId)

  if (error) {
    console.error('saveCabinLayout', error)
    return false
  }
  return true
}
