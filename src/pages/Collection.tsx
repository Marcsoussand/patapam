import { useEffect, useMemo, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { useProfileStore } from '../store/profileStore'

import { supabase } from '../lib/supabase'

import {

  ensureStarterPacks,

  parsePackInventory,

  totalPackCount,

  type PackInventory,

} from '../lib/collectionPacks'

import { useCardCollection } from '../hooks/useCardCollection'

import { TOTAL_COLLECTIBLE_CARDS } from '../data/collectionCards'

import AlbumBook from '../components/collection/AlbumBook'

import PackPanel from '../components/collection/PackPanel'

import '../components/collection/collection.css'

import patapamImg from '../img/patapam_debout.png'

import dauphinou from '../img/dauphinou.png'

import mollasson from '../img/mollasson.png'

import bobby from '../img/bobby.png'

import tartuffe from '../img/tartuffe.png'

import betachou from '../img/betachou.png'



const characterImages: Record<string, string> = {

  Patapam: patapamImg,

  Bobby: bobby,

  Tartuffe: tartuffe,

  Mollasson: mollasson,

  Dauphinou: dauphinou,

  Betachou: betachou,

}



type CollectionTab = 'album' | 'packs'



export default function Collection() {

  const navigate = useNavigate()

  const profile = useProfileStore((s) => s.activeProfile)

  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const patchActiveProfile = useProfileStore((s) => s.patchActiveProfile)

  const [charName, setCharName] = useState<string | null>(null)

  const [tab, setTab] = useState<CollectionTab>('album')

  const [gardenState, setGardenState] = useState<Record<string, unknown>>({})

  const [inventory, setInventory] = useState<PackInventory>({ simple: 0, gold: 0 })

  const [coins, setCoins] = useState(0)

  const { owned, loading, addCards, hasCard } = useCardCollection(profile?.id)



  useEffect(() => {

    if (!profile?.character_id) return

    supabase

      .from('characters')

      .select('name_fr')

      .eq('id', profile.character_id)

      .single()

      .then(({ data }) => setCharName(data?.name_fr ?? null))

  }, [profile?.character_id])



  useEffect(() => {

    if (!profile?.id) return

    let cancelled = false



    async function syncPacks() {

      const currentGarden = profile!.garden_state ?? {}

      const nextGarden =
        currentGarden.starter_packs_granted === true
          ? currentGarden
          : await ensureStarterPacks(profile!.id, currentGarden)

      if (cancelled) return



      setGardenState(nextGarden)

      setInventory(parsePackInventory(nextGarden))

      setCoins(profile!.coins ?? 0)



      if (nextGarden !== currentGarden) {

        setActiveProfile({ ...profile!, garden_state: nextGarden })

      }

    }



    void syncPacks()



    return () => {

      cancelled = true

    }

  }, [profile?.id, profile?.garden_state, profile?.coins, setActiveProfile])



  const avatarImg = charName ? characterImages[charName] : null

  const ownedIds = useMemo(() => new Set(owned.keys()), [owned])

  const collectedCount = ownedIds.size

  const packCount = totalPackCount(inventory)



  function handleInventoryChange(nextInventory: PackInventory, nextGarden: Record<string, unknown>) {
    setInventory(nextInventory)
    setGardenState(nextGarden)
    patchActiveProfile({ garden_state: nextGarden })
  }

  function handleCoinsChange(nextCoins: number) {
    setCoins(nextCoins)
    patchActiveProfile({ coins: nextCoins })
  }



  async function handleCardsAdded(cards: { id: string }[]) {

    await addCards(cards.map((c) => c.id))

  }



  return (

    <div className="flex flex-col h-screen overflow-hidden bg-patapam-purple">

      <header className="flex items-center justify-between px-4 py-3 bg-black/20">

        <div className="flex items-center gap-3">

          <button

            type="button"

            onClick={() => navigate('/')}

            className="text-white/80 hover:text-white text-sm font-bold px-2 py-1 rounded-lg hover:bg-white/10"

          >

            ← Clairière

          </button>

          <div className="w-10 h-10 rounded-full bg-white/30 overflow-hidden flex items-center justify-center text-xl">

            {avatarImg

              ? <img src={avatarImg} alt={charName ?? ''} className="w-full h-full object-cover" />

              : <span>🧸</span>

            }

          </div>

          <span className="text-white font-bold text-lg">{profile?.name}</span>

        </div>



        <div className="flex items-center gap-1 bg-white/15 rounded-full p-1">

          <button

            type="button"

            onClick={() => setTab('album')}

            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${

              tab === 'album' ? 'bg-white text-patapam-purple' : 'text-white/80 hover:text-white'

            }`}

          >

            📖 Album

          </button>

          <button

            type="button"

            onClick={() => setTab('packs')}

            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${

              tab === 'packs' ? 'bg-white text-patapam-purple' : 'text-white/80 hover:text-white'

            }`}

          >

            📦 Packs

            {packCount > 0 && (

              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs text-white">

                {packCount}

              </span>

            )}

          </button>

        </div>



        <div className="text-white/90 text-sm font-bold">

          {loading ? '…' : `${collectedCount} / ${TOTAL_COLLECTIBLE_CARDS}`}

        </div>

      </header>



      <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-4">

        {tab === 'album' ? (

          <AlbumBook hasCard={hasCard} />

        ) : profile ? (

          <PackPanel

            profileId={profile.id}

            coins={coins}

            gardenState={gardenState}

            inventory={inventory}

            onInventoryChange={handleInventoryChange}

            onCoinsChange={handleCoinsChange}

            onCardsAdded={handleCardsAdded}

          />

        ) : null}

      </main>

    </div>

  )

}


