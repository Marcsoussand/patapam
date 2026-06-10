import type { CardRarity } from '../types/collection'
import type { CollectionCardDef } from '../types/collection'
import { COLLECTION_CATALOG } from '../data/collectionCards'

export type PackType = 'simple' | 'gold'

export const PACK_SIZE = 3

export const PACK_PRICES: Record<PackType, number> = {
  simple: 2,
  gold: 10,
}

const RARITY_ORDER: CardRarity[] = ['common', 'rare', 'super_rare', 'epic']

const SIMPLE_ODDS: Record<CardRarity, number> = {
  common: 0.7,
  rare: 0.25,
  super_rare: 0.04,
  epic: 0.01,
}

/** Probabilités par slot pour le pack or (cartes 1, 2, 3) */
const GOLD_ODDS_BY_SLOT: Record<CardRarity, number>[] = [
  { common: 0.5, rare: 0.3, super_rare: 0.15, epic: 0.05 },
  { common: 0.3, rare: 0.5, super_rare: 0.15, epic: 0.05 },
  { common: 0.15, rare: 0.5, super_rare: 0.3, epic: 0.05 },
]

const CARDS_BY_RARITY: Record<CardRarity, CollectionCardDef[]> = {
  common: [],
  rare: [],
  super_rare: [],
  epic: [],
}

for (const card of COLLECTION_CATALOG) {
  CARDS_BY_RARITY[card.rarity].push(card)
}

function rollRarity(odds: Record<CardRarity, number>): CardRarity {
  const roll = Math.random()
  let cumulative = 0
  for (const rarity of RARITY_ORDER) {
    cumulative += odds[rarity]
    if (roll < cumulative) return rarity
  }
  return 'common'
}

function pickRandomFromPool(
  pool: CollectionCardDef[],
  excludeIds: Set<string>,
): CollectionCardDef | null {
  const available = pool.filter((c) => !excludeIds.has(c.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)] ?? null
}

function pickCardForSlot(
  odds: Record<CardRarity, number>,
  excludeIds: Set<string>,
): CollectionCardDef | null {
  const rarity = rollRarity(odds)
  let card = pickRandomFromPool(CARDS_BY_RARITY[rarity], excludeIds)

  if (!card) {
    for (const fallbackRarity of RARITY_ORDER) {
      card = pickRandomFromPool(CARDS_BY_RARITY[fallbackRarity], excludeIds)
      if (card) break
    }
  }

  return card
}

/** Ouvre un pack : 3 cartes distinctes, tirage pur aléatoire dans chaque rareté. */
export function rollPackCards(type: PackType): CollectionCardDef[] {
  const oddsPerSlot =
    type === 'simple' ? [SIMPLE_ODDS, SIMPLE_ODDS, SIMPLE_ODDS] : GOLD_ODDS_BY_SLOT

  const picked: CollectionCardDef[] = []
  const pickedIds = new Set<string>()

  for (const odds of oddsPerSlot) {
    const card = pickCardForSlot(odds, pickedIds)
    if (!card) break
    picked.push(card)
    pickedIds.add(card.id)
  }

  return picked
}
