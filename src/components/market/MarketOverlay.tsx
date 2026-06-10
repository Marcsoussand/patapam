import { useCallback, useEffect, useMemo, useState } from 'react'
import { cabinItemPublicUrl } from '../../lib/cabinStorage'
import { catalogById, loadCabinCatalog } from '../../lib/cabinCatalog'
import { loadCabinInventory } from '../../lib/cabinInventory'
import { parseCabinLayout } from '../../lib/cabinLayout'
import {
  buildSellableItems,
  buyCabinMarketItem,
  loadMarketCatalog,
  sellCabinMarketItem,
} from '../../lib/marketCabin'
import type { CabinInventoryEntry, CabinItemCatalogEntry } from '../../types/cabin'

type MarketTab = 'buy' | 'sell'

interface MarketOverlayProps {
  profileId: string
  coins: number
  cabinLayout: Record<string, unknown>
  onClose: () => void
  onCoinsChange: (coins: number) => void
}

export default function MarketOverlay({
  profileId,
  coins,
  cabinLayout,
  onClose,
  onCoinsChange,
}: MarketOverlayProps) {
  const [tab, setTab] = useState<MarketTab>('buy')
  const [catalog, setCatalog] = useState<CabinItemCatalogEntry[]>([])
  const [inventory, setInventory] = useState<CabinInventoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSellId, setSelectedSellId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const layout = useMemo(() => parseCabinLayout(cabinLayout), [cabinLayout])
  const catalogMap = useMemo(() => catalogById(catalog), [catalog])
  const sellable = useMemo(
    () => buildSellableItems(inventory, catalogMap, layout),
    [inventory, catalogMap, layout],
  )

  const reload = useCallback(async () => {
    const [shopItems, inv, fullCatalog] = await Promise.all([
      loadMarketCatalog(),
      loadCabinInventory(profileId),
      loadCabinCatalog(),
    ])
    setCatalog(shopItems.length > 0 ? shopItems : fullCatalog.filter((i) => i.price_coins > 0))
    setInventory(inv)
  }, [profileId])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    reload().finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [reload])

  useEffect(() => {
    if (selectedSellId && !sellable.some((item) => item.itemId === selectedSellId)) {
      setSelectedSellId(null)
    }
  }, [selectedSellId, sellable])

  const selectedSell = sellable.find((item) => item.itemId === selectedSellId)

  async function handleBuy(item: CabinItemCatalogEntry) {
    if (busy) return
    setMessage(null)
    setBusy(true)
    const result = await buyCabinMarketItem(profileId, item, coins)
    setBusy(false)
    if (!result.ok) {
      setMessage(coins < item.price_coins ? 'Pas assez de pièces.' : 'Achat impossible.')
      return
    }
    onCoinsChange(result.coins)
    setInventory(result.inventory)
    setMessage(`${item.name_fr} acheté !`)
  }

  async function handleSell(item: CabinItemCatalogEntry) {
    if (busy) return
    setMessage(null)
    setBusy(true)
    const result = await sellCabinMarketItem(profileId, item, layout, coins, inventory)
    setBusy(false)
    if (!result.ok) {
      setMessage('Cet objet n’est pas dans ton sac (ranger d’abord depuis la cabane).')
      return
    }
    onCoinsChange(result.coins)
    setInventory(result.inventory)
    setSelectedSellId(null)
    setMessage(`${item.name_fr} vendu !`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6">
      <div className="flex h-full max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-amber-50 shadow-2xl">
        <header className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-100/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🛒
            </span>
            <h2 className="text-lg font-bold text-amber-950">Marché</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-bold text-amber-800">
              {coins} 🪙
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-amber-950 hover:bg-white"
            >
              Fermer
            </button>
          </div>
        </header>

        <div className="flex gap-2 border-b border-amber-200 px-4 py-2">
          <button
            type="button"
            onClick={() => {
              setTab('buy')
              setMessage(null)
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
              tab === 'buy' ? 'bg-amber-500 text-white' : 'bg-white text-amber-900 hover:bg-amber-100'
            }`}
          >
            Acheter
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('sell')
              setMessage(null)
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-colors ${
              tab === 'sell' ? 'bg-amber-500 text-white' : 'bg-white text-amber-900 hover:bg-amber-100'
            }`}
          >
            Vendre
          </button>
        </div>

        {message && (
          <p className="px-4 py-2 text-center text-sm font-semibold text-amber-900 bg-amber-100/70">
            {message}
          </p>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {loading ? (
            <p className="text-center text-amber-900/70 py-8">Chargement…</p>
          ) : tab === 'buy' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalog.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-amber-200 bg-white p-3"
                >
                  <img
                    src={cabinItemPublicUrl(item.storage_path)}
                    alt=""
                    className="h-16 w-16 object-contain"
                  />
                  <span className="text-sm font-bold text-gray-900 text-center">{item.name_fr}</span>
                  <span className="text-sm font-semibold text-amber-700">{item.price_coins} 🪙</span>
                  <button
                    type="button"
                    disabled={busy || coins < item.price_coins}
                    onClick={() => handleBuy(item)}
                    className="w-full rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-40"
                  >
                    Acheter
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 min-h-[12rem] justify-center">
              {selectedSell ? (
                <>
                  <img
                    src={cabinItemPublicUrl(selectedSell.catalog.storage_path)}
                    alt=""
                    className="h-24 w-24 object-contain"
                  />
                  <p className="text-lg font-bold text-gray-900">{selectedSell.catalog.name_fr}</p>
                  <p className="text-amber-800 font-semibold">
                    Revente : {selectedSell.catalog.price_coins} 🪙
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleSell(selectedSell.catalog)}
                    className="rounded-xl bg-emerald-600 px-6 py-3 text-base font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                  >
                    Vendre
                  </button>
                </>
              ) : (
                <p className="text-center text-amber-900/70 px-4">
                  Choisis un objet dans ton sac en bas pour le vendre.
                </p>
              )}
            </div>
          )}
        </div>

        {tab === 'sell' && (
          <div className="shrink-0 border-t border-amber-200 bg-amber-100/60 px-3 py-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-900/70">
              Ton sac
            </p>
            {sellable.length === 0 ? (
              <p className="text-sm text-amber-900/60 px-1">
                Rien à vendre — achète au marché ou range un objet depuis la cabane.
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sellable.map((bag) => (
                  <button
                    key={bag.itemId}
                    type="button"
                    onClick={() => {
                      setSelectedSellId(bag.itemId)
                      setMessage(null)
                    }}
                    className={`flex shrink-0 flex-col items-center gap-1 rounded-xl border-2 px-2 py-1.5 min-w-[4.5rem] ${
                      selectedSellId === bag.itemId
                        ? 'border-emerald-500 bg-white ring-2 ring-emerald-300'
                        : 'border-amber-300 bg-white hover:border-amber-500'
                    }`}
                  >
                    <img
                      src={cabinItemPublicUrl(bag.catalog.storage_path)}
                      alt=""
                      className="h-10 w-10 object-contain"
                    />
                    <span className="text-[0.65rem] font-semibold text-gray-800 text-center leading-tight">
                      {bag.catalog.name_fr}
                    </span>
                    {bag.available > 1 && (
                      <span className="text-[0.6rem] text-gray-500">×{bag.available}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
