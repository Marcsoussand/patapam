import { useMemo, useState } from 'react'
import type { AlbumSection } from '../../types/collection'
import { SECTION_LABELS, SLOTS_PER_PAGE } from '../../types/collection'
import {
  ALBUM_PAGES,
  cardsForAlbumPage,
  slotsForAlbumPage,
  flatAlbumPages,
  sectionFirstFlatIndex,
} from '../../data/collectionCards'
import CollectionCard from './CollectionCard'
import './collection.css'

const SECTION_ORDER: AlbumSection[] = ['common', 'rare', 'super_rare', 'epic']

interface AlbumBookProps {
  hasCard: (cardId: string) => boolean
}

export default function AlbumBook({ hasCard }: AlbumBookProps) {
  const bookPages = useMemo(() => flatAlbumPages(), [])
  const [flatIndex, setFlatIndex] = useState(0)

  const current = bookPages[flatIndex] ?? bookPages[0]
  const section = current.section
  const safePage = current.pageIndex
  const sectionPageCount = ALBUM_PAGES[section].length

  const pageCards = cardsForAlbumPage(section, safePage)
  const slotLayout = slotsForAlbumPage(section, safePage)

  function goPrev() {
    setFlatIndex((i) => Math.max(0, i - 1))
  }

  function goNext() {
    setFlatIndex((i) => Math.min(bookPages.length - 1, i + 1))
  }

  function switchSection(next: AlbumSection) {
    setFlatIndex(sectionFirstFlatIndex(next))
  }

  const atStart = flatIndex === 0
  const atEnd = flatIndex >= bookPages.length - 1

  return (
    <div className="album-book">
      <div className="album-book__sections" role="tablist" aria-label="Rareté de l'album">
        {SECTION_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={section === key}
            className={`album-book__section-tab${section === key ? ' album-book__section-tab--active' : ''}`}
            onClick={() => switchSection(key)}
          >
            {SECTION_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="album-book__shell">
        <div className="album-book__cover">
          <div className="album-book__spine" aria-hidden />
          <div className="album-book__spread" key={`${section}-${safePage}`}>
            <div className={`album-book__grid album-book__grid--${section}`}>
              {Array.from({ length: SLOTS_PER_PAGE }, (_, slot) => {
                const slug = slotLayout[slot]
                if (!slug) {
                  return (
                    <CollectionCard
                      key={`empty-${slot}`}
                      reserved
                      className="collection-card--reserved"
                    />
                  )
                }
                const card = pageCards.find((c) => c.slot === slot)
                return (
                  <CollectionCard
                    key={card?.id ?? slug}
                    card={card}
                    collected={card ? hasCard(card.id) : false}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="album-book__nav">
        <button
          type="button"
          className="album-book__nav-btn"
          disabled={atStart}
          onClick={goPrev}
          aria-label="Page précédente"
        >
          ←
        </button>
        <span className="album-book__page-indicator">
          {SECTION_LABELS[section]} {safePage + 1}/{sectionPageCount}
          <span className="album-book__page-indicator-global">
            {' '}· {flatIndex + 1}/{bookPages.length}
          </span>
        </span>
        <button
          type="button"
          className="album-book__nav-btn"
          disabled={atEnd}
          onClick={goNext}
          aria-label="Page suivante"
        >
          →
        </button>
      </div>
    </div>
  )
}
