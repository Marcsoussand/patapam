import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import { usePageMusic } from '../hooks/usePageMusic'
import { zoneBgmUrl } from '../lib/zoneMusic'
import patapamImg from '../img/patapam_debout.png'
import cabin1stFloor from '../img/pages/cabin_1st_floor.png'
import cabin2ndFloor from '../img/pages/cabin_2nd_floor.png'
import dauphinou from '../img/dauphinou.png'
import mollasson from '../img/mollasson.png'
import bobby from '../img/bobby.png'
import tartuffe from '../img/tartuffe.png'
import betachou from '../img/betachou.png'
import CabinHotspot, { cabinSceneCoords } from '../components/cabin/CabinHotspot'
import CabinInventoryBar from '../components/cabin/CabinInventoryBar'
import CabinPlacedSprite from '../components/cabin/CabinPlacedSprite'
import { loadCabinCatalog, catalogById } from '../lib/cabinCatalog'
import {
  buildBagItems,
  ensureTestCabinItem,
  loadCabinInventory,
} from '../lib/cabinInventory'
import {
  floorKey,
  loadCabinLayout,
  saveCabinLayout,
} from '../lib/cabinLayout'
import type { CabinFloor, CabinItemCatalogEntry, CabinLayout } from '../types/cabin'

const characterImages: Record<string, string> = {
  Patapam: patapamImg,
  Bobby: bobby,
  Tartuffe: tartuffe,
  Mollasson: mollasson,
  Dauphinou: dauphinou,
  Betachou: betachou,
}

const floorImages: Record<CabinFloor, string> = {
  1: cabin1stFloor,
  2: cabin2ndFloor,
}

export default function Cabin() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.activeProfile)
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const [charName, setCharName] = useState<string | null>(null)
  const [floor, setFloor] = useState<CabinFloor>(1)
  const [catalog, setCatalog] = useState<CabinItemCatalogEntry[]>([])
  const [layout, setLayout] = useState<CabinLayout>({ floor1: [], floor2: [] })
  const [loading, setLoading] = useState(true)
  const [isDropOver, setIsDropOver] = useState(false)
  const [selectedPlacedId, setSelectedPlacedId] = useState<string | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const bgmUrl = useMemo(() => zoneBgmUrl('cabin'), [])
  usePageMusic(bgmUrl)

  const catalogMap = catalogById(catalog)
  const [bagVersion, setBagVersion] = useState(0)
  const [inventory, setInventory] = useState<{ item_id: string; quantity: number }[]>([])

  useEffect(() => {
    if (!profile?.character_id) return
    supabase
      .from('characters')
      .select('name_fr')
      .eq('id', profile.character_id)
      .single()
      .then(({ data }) => setCharName(data?.name_fr ?? null))
  }, [profile?.character_id])

  const reloadCabinData = useCallback(async (profileId: string) => {
    await ensureTestCabinItem(profileId)
    const [catalogRows, layoutRows, inventoryRows] = await Promise.all([
      loadCabinCatalog(),
      loadCabinLayout(profileId),
      loadCabinInventory(profileId),
    ])
    setCatalog(catalogRows)
    setLayout(layoutRows)
    setInventory(inventoryRows)
    setBagVersion((v) => v + 1)
  }, [])

  useEffect(() => {
    if (!profile?.id) return
    let cancelled = false
    setLoading(true)
    reloadCabinData(profile.id).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [profile?.id, reloadCabinData])

  useEffect(() => {
    setSelectedPlacedId(null)
  }, [floor])

  const bagItems = buildBagItems(inventory, catalogMap, layout)
  void bagVersion

  const placedOnFloor = layout[floorKey(floor)]

  async function persistLayout(next: CabinLayout) {
    if (!profile) return false
    const previous = layout
    setLayout(next)
    const ok = await saveCabinLayout(profile.id, next)
    if (ok) {
      setActiveProfile({ ...profile, cabin_layout: next as unknown as Record<string, unknown> })
      setBagVersion((v) => v + 1)
      return true
    }
    setLayout(previous)
    return false
  }

  function handleSceneDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const allowed = e.dataTransfer.effectAllowed
    e.dataTransfer.dropEffect = allowed === 'move' ? 'move' : 'copy'
    setIsDropOver(true)
  }

  function parseDragPayload(raw: string): {
    source?: string
    itemId?: string
    placedId?: string
  } | null {
    try {
      return JSON.parse(raw) as { source?: string; itemId?: string; placedId?: string }
    } catch {
      return null
    }
  }

  function handleSceneDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDropOver(false)
    const container = sceneRef.current
    if (!container || !profile) return

    const payload = parseDragPayload(e.dataTransfer.getData('text/plain'))
    if (!payload) return

    const coords = cabinSceneCoords(e, container)
    if (!coords) return

    const key = floorKey(floor)

    if (payload.source === 'cabin-placed' && payload.placedId) {
      const exists = layout[key].some((p) => p.id === payload.placedId)
      if (!exists) return

      const next: CabinLayout = {
        ...layout,
        [key]: layout[key].map((p) =>
          p.id === payload.placedId ? { ...p, x: coords.x, y: coords.y } : p,
        ),
      }
      void persistLayout(next)
      setSelectedPlacedId(payload.placedId)
      return
    }

    if (payload.source !== 'cabin-bag' || !payload.itemId) return

    const cat = catalogMap.get(payload.itemId)
    if (!cat || !cat.floors.includes(floor)) return

    const bag = buildBagItems(inventory, catalogMap, layout)
    if (!bag.some((b) => b.itemId === payload.itemId)) return

    const next: CabinLayout = {
      ...layout,
      [key]: [
        ...layout[key],
        {
          id: crypto.randomUUID(),
          itemId: payload.itemId,
          x: coords.x,
          y: coords.y,
        },
      ],
    }
    void persistLayout(next)
    setSelectedPlacedId(null)
  }

  function handleReturnPlacedToBag(placedId: string) {
    const key = floorKey(floor)
    if (!layout[key].some((p) => p.id === placedId)) return

    const next: CabinLayout = {
      ...layout,
      [key]: layout[key].filter((p) => p.id !== placedId),
    }
    void persistLayout(next)
    setSelectedPlacedId(null)
  }

  const avatarImg = charName ? characterImages[charName] : null

  if (!profile) return null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-amber-900">
      <header className="flex items-center justify-between px-4 py-3 bg-black/25 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 overflow-hidden flex items-center justify-center text-xl">
            {avatarImg ? (
              <img src={avatarImg} alt={charName ?? ''} className="w-full h-full object-cover" />
            ) : (
              <span>🧸</span>
            )}
          </div>
          <span className="text-white font-bold text-lg">{profile.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">🌳</span>
            <span className="text-xs">Clairière</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/collection')}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">📚</span>
            <span className="text-xs">Album</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-white/20 rounded-full px-4 py-1">
          <span className="text-yellow-300 text-lg">🪙</span>
          <span className="text-white font-bold">{profile.coins ?? 0}</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-black relative">
        {loading ? (
          <p className="text-white/80">Chargement de la cabane…</p>
        ) : (
          <div
            ref={sceneRef}
            className={`relative h-full max-h-full w-full max-w-full ${isDropOver ? 'ring-4 ring-amber-300/60 ring-inset' : ''}`}
            style={{ aspectRatio: '1424/752', height: '100%' }}
            onClick={() => setSelectedPlacedId(null)}
            onDragOver={handleSceneDragOver}
            onDragLeave={() => setIsDropOver(false)}
            onDrop={handleSceneDrop}
          >
            <img
              src={floorImages[floor]}
              alt={floor === 1 ? 'Premier étage de la cabane' : 'Deuxième étage de la cabane'}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
              draggable={false}
            />

            {placedOnFloor.map((placed) => {
              const cat = catalogMap.get(placed.itemId)
              if (!cat) return null
              return (
                <CabinPlacedSprite
                  key={placed.id}
                  placed={placed}
                  catalog={cat}
                  selected={selectedPlacedId === placed.id}
                  disabled={loading}
                  onSelect={() => setSelectedPlacedId(placed.id)}
                />
              )
            })}

            {floor === 1 && (
              <>
                <CabinHotspot
                  style={{ top: 0, right: 0, width: '25%', height: '25%' }}
                  onClick={() => setFloor(2)}
                  label="⬆️ Monter à l'étage"
                />
                <CabinHotspot
                  style={{ bottom: 0, left: '40%', width: '20%', height: '20%' }}
                  onClick={() => navigate('/')}
                  label="🌳 Clairière"
                />
              </>
            )}
            {floor === 2 && (
              <CabinHotspot
                style={{ bottom: 0, right: 0, width: '33.33%', height: '33.33%' }}
                onClick={() => setFloor(1)}
                label="⬇️ Redescendre"
              />
            )}

            {selectedPlacedId && (
              <div className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReturnPlacedToBag(selectedPlacedId)
                  }}
                  className="rounded-xl bg-black/70 px-4 py-2 text-sm font-semibold text-white shadow-lg ring-2 ring-amber-300/80 hover:bg-black/85 transition-colors"
                >
                  🎒 Ranger dans le sac
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CabinInventoryBar
        items={bagItems}
        disabled={loading}
        onReturnPlaced={handleReturnPlacedToBag}
      />
    </div>
  )
}
