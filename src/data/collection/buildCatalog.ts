import type { AlbumPageDef, AlbumSection, CollectionCardDef, CardRarity } from '../../types/collection'
import { cardId } from '../../types/collection'
import { COMMON_PAGE_SLOTS, COLLECTIBLE_PAGE_SLOTS, COLLECTIBLE_RARITIES } from './albumLayout'
import { resolveCollectionImage } from './collectionImages'
import patapamImg from '../../img/patapam_debout.png'


function buildPageCards(
  slotsPages: (string | null)[][],
  section: AlbumSection,
  rarity: CardRarity,
): CollectionCardDef[] {
  const cards: CollectionCardDef[] = []

  slotsPages.forEach((slots, page) => {
    slots.forEach((slug, slot) => {
      if (!slug) return
      const image = resolveCollectionImage(slug) ?? patapamImg
      cards.push({
        id: cardId(slug, rarity),
        slug,
        titleFr: '',
        image,
        rarity,
        section,
        page,
        slot,
      })
    })
  })

  return cards
}

function buildAlbumPages(
  slotsPages: (string | null)[][],
  section: AlbumSection,
): AlbumPageDef[] {
  return slotsPages.map((slots, pageIndex) => ({
    section,
    pageIndex,
    hasPlaceholder: slots.some((s) => s === null),
  }))
}

const COMMON_CARDS = buildPageCards(COMMON_PAGE_SLOTS, 'common', 'common')

const COLLECTIBLE_BY_RARITY = Object.fromEntries(
  COLLECTIBLE_RARITIES.map((rarity) => [
    rarity,
    buildPageCards(COLLECTIBLE_PAGE_SLOTS, rarity, rarity),
  ]),
) as Record<(typeof COLLECTIBLE_RARITIES)[number], CollectionCardDef[]>

export const COLLECTION_CATALOG: CollectionCardDef[] = [
  ...COMMON_CARDS,
  ...COLLECTIBLE_RARITIES.flatMap((r) => COLLECTIBLE_BY_RARITY[r]),
]

export const ALBUM_PAGES: Record<AlbumSection, AlbumPageDef[]> = {
  common: buildAlbumPages(COMMON_PAGE_SLOTS, 'common'),
  rare: buildAlbumPages(COLLECTIBLE_PAGE_SLOTS, 'rare'),
  super_rare: buildAlbumPages(COLLECTIBLE_PAGE_SLOTS, 'super_rare'),
  epic: buildAlbumPages(COLLECTIBLE_PAGE_SLOTS, 'epic'),
}

export const TOTAL_COLLECTIBLE_CARDS = COLLECTION_CATALOG.length

const SECTION_ORDER: AlbumSection[] = ['common', 'rare', 'super_rare', 'epic']

export interface FlatAlbumPage {
  section: AlbumSection
  pageIndex: number
}

/** Toutes les pages en ordre livre : Basique → Rare → Super rare → Épique */
export function flatAlbumPages(): FlatAlbumPage[] {
  return SECTION_ORDER.flatMap((section) =>
    ALBUM_PAGES[section].map((_, pageIndex) => ({ section, pageIndex })),
  )
}

export function flatIndexForSection(section: AlbumSection, pageIndex = 0): number {
  const pages = flatAlbumPages()
  return Math.max(
    0,
    pages.findIndex((p) => p.section === section && p.pageIndex === pageIndex),
  )
}

export function sectionFirstFlatIndex(section: AlbumSection): number {
  return flatIndexForSection(section, 0)
}

export function cardsForAlbumPage(section: AlbumSection, pageIndex: number): CollectionCardDef[] {
  return COLLECTION_CATALOG.filter((c) => c.section === section && c.page === pageIndex).sort(
    (a, b) => a.slot - b.slot,
  )
}

export function slotsForAlbumPage(section: AlbumSection, pageIndex: number): (string | null)[] {
  if (section === 'common') return COMMON_PAGE_SLOTS[pageIndex] ?? []
  return COLLECTIBLE_PAGE_SLOTS[pageIndex] ?? []
}

export function cardById(id: string): CollectionCardDef | undefined {
  return COLLECTION_CATALOG.find((c) => c.id === id)
}

