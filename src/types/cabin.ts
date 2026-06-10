/** Objet posé dans la cabane (coords en fraction 0–1 de la scène). */
export interface CabinPlacedItem {
  id: string
  itemId: string
  x: number
  y: number
}

export interface CabinLayout {
  floor1: CabinPlacedItem[]
  floor2: CabinPlacedItem[]
}

export type CabinFloor = 1 | 2

export interface CabinItemCatalogEntry {
  id: string
  name_fr: string
  name_en: string
  name_he: string
  storage_path: string
  width_pct: number
  height_pct: number
  floors: number[]
  sort_order: number
  price_coins: number
}

export interface CabinInventoryEntry {
  item_id: string
  quantity: number
}

/** Objet disponible dans le sac (possédé − déjà posé). */
export interface CabinBagItem {
  itemId: string
  catalog: CabinItemCatalogEntry
  available: number
}
