import { useState } from 'react'
import type { CollectionCardDef } from '../../types/collection'
import type { PackInventory, PackType } from '../../lib/collectionPacks'
import { consumePack, addPackToInventory, withPackInventory } from '../../lib/collectionPacks'
import { PACK_PRICES, rollPackCards } from '../../lib/packLogic'
import { spendProfileCoins } from '../../lib/awardProfileCoins'
import StickerPack from './StickerPack'
import './collection.css'

interface PackPanelProps {
  profileId: string
  coins: number
  gardenState: Record<string, unknown>
  inventory: PackInventory
  onInventoryChange: (inventory: PackInventory, gardenState: Record<string, unknown>) => void
  onCoinsChange: (coins: number) => void
  onCardsAdded: (cards: CollectionCardDef[]) => void
}

function PackIllustration({
  type,
  ready,
  onOpen,
}: {
  type: PackType
  ready: boolean
  onOpen: () => void
}) {
  const className = [
    'pack-illus',
    `pack-illus--${type}`,
    ready ? 'pack-illus--ready' : 'pack-illus--idle',
  ].join(' ')

  const inner = (
    <>
      <div className="pack-illus__flap" aria-hidden />
      <div className="pack-illus__body">
        <span className="pack-illus__star" aria-hidden>
          ★
        </span>
      </div>
    </>
  )

  if (ready) {
    return (
      <button
        type="button"
        className={className}
        onClick={onOpen}
        aria-label={type === 'gold' ? 'Ouvrir un pack or' : 'Ouvrir un pack simple'}
      >
        {inner}
      </button>
    )
  }

  return (
    <div className={className} aria-hidden>
      {inner}
    </div>
  )
}

function PackColumn({
  type,
  count,
  price,
  coins,
  onOpen,
  onBuy,
}: {
  type: PackType
  count: number
  price: number
  coins: number
  onOpen: () => void
  onBuy: () => void
}) {
  const [shakeBuy, setShakeBuy] = useState(false)
  const canBuy = coins >= price
  const ready = count >= 1

  function handleBuyClick() {
    if (!canBuy) {
      setShakeBuy(true)
      window.setTimeout(() => setShakeBuy(false), 450)
      return
    }
    onBuy()
  }

  return (
    <div className={`pack-column pack-column--${type}`}>
      <PackIllustration type={type} ready={ready} onOpen={onOpen} />

      <div
        className={`pack-column__stock${ready ? ' pack-column__stock--ready' : ''}`}
        aria-label={`${count} pack${count !== 1 ? 's' : ''} disponible${count !== 1 ? 's' : ''}`}
      >
        <span className="pack-column__stock-num">{count}</span>
      </div>

      <button
        type="button"
        className={`pack-column__buy${shakeBuy ? ' pack-column__buy--shake' : ''}${
          !canBuy ? ' pack-column__buy--disabled' : ''
        }`}
        onClick={handleBuyClick}
        aria-label={`Acheter un pack pour ${price} pièces`}
      >
        <span className="pack-column__buy-price">{price}</span>
        <span className="pack-column__buy-coin" aria-hidden>
          🪙
        </span>
      </button>
    </div>
  )
}

export default function PackPanel({
  profileId,
  coins,
  gardenState,
  inventory,
  onInventoryChange,
  onCoinsChange,
  onCardsAdded,
}: PackPanelProps) {
  const [opening, setOpening] = useState<{ type: PackType; cards: CollectionCardDef[] } | null>(
    null,
  )

  async function handleOpen(type: PackType) {
    if (inventory[type] < 1) return

    const cards = rollPackCards(type)
    if (cards.length === 0) return

    const nextInventory = await consumePack(profileId, gardenState, type)
    if (!nextInventory) return

    const nextGarden = withPackInventory(gardenState, nextInventory)
    onInventoryChange(nextInventory, nextGarden)
    setOpening({ type, cards })
  }

  async function handleBuy(type: PackType) {
    const price = PACK_PRICES[type]
    if (coins < price) return

    const spent = await spendProfileCoins(profileId, coins, price)
    if (!spent) return

    const nextInventory = await addPackToInventory(profileId, gardenState, type)
    if (!nextInventory) return

    const nextGarden = withPackInventory(gardenState, nextInventory)
    onCoinsChange(coins - price)
    onInventoryChange(nextInventory, nextGarden)
  }

  function handlePackComplete(cards: CollectionCardDef[]) {
    onCardsAdded(cards)
    setOpening(null)
  }

  if (opening) {
    return (
      <StickerPack
        packType={opening.type}
        cards={opening.cards}
        onComplete={handlePackComplete}
      />
    )
  }

  return (
    <div className="pack-panel">
      <div className="pack-panel__wallet" aria-label={`${coins} pièces`}>
        <span className="pack-panel__wallet-num">{coins}</span>
        <span className="pack-panel__wallet-coin" aria-hidden>
          🪙
        </span>
      </div>

      <div className="pack-panel__columns">
        <PackColumn
          type="simple"
          count={inventory.simple}
          price={PACK_PRICES.simple}
          coins={coins}
          onOpen={() => handleOpen('simple')}
          onBuy={() => handleBuy('simple')}
        />
        <PackColumn
          type="gold"
          count={inventory.gold}
          price={PACK_PRICES.gold}
          coins={coins}
          onOpen={() => handleOpen('gold')}
          onBuy={() => handleBuy('gold')}
        />
      </div>
    </div>
  )
}
