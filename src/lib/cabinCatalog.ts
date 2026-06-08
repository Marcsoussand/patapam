import { supabase } from './supabase'
import type { CabinItemCatalogEntry } from '../types/cabin'

export async function loadCabinCatalog(): Promise<CabinItemCatalogEntry[]> {
  const { data, error } = await supabase
    .from('cabin_items')
    .select('id, name_fr, name_en, name_he, storage_path, width_pct, height_pct, floors, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('loadCabinCatalog', error)
    return []
  }

  return (data ?? []) as CabinItemCatalogEntry[]
}

export function catalogById(items: CabinItemCatalogEntry[]): Map<string, CabinItemCatalogEntry> {
  return new Map(items.map((item) => [item.id, item]))
}
