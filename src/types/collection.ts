export type CardRarity = 'common' | 'rare' | 'super_rare' | 'epic'

export type AlbumSection = 'common' | 'rare' | 'super_rare' | 'epic'

export const SLOTS_PER_PAGE = 4

export interface CollectionCardDef {
  id: string
  /** Slug image stable (indépendant de la rareté) */
  slug: string
  titleFr: string
  image: string
  rarity: CardRarity
  section: AlbumSection
  page: number
  slot: number
}

export interface AlbumPageDef {
  section: AlbumSection
  pageIndex: number
  /** true si au moins un slot est un placeholder (null dans le layout) */
  hasPlaceholder: boolean
}

export const PACK_SIZE = 3

export const RARITY_LABELS: Record<CardRarity, string> = {
  common: 'Basique',
  rare: 'Rare',
  super_rare: 'Super rare',
  epic: 'Épique',
}

export const SECTION_LABELS: Record<AlbumSection, string> = {
  common: 'Basique',
  rare: 'Rare',
  super_rare: 'Super rare',
  epic: 'Épique',
}

export function cardId(slug: string, rarity: CardRarity): string {
  return `${slug}__${rarity}`
}
