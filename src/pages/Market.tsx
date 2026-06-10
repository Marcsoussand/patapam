import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import patapamImg from '../img/patapam_debout.png'
import marketImg from '../img/pages/market.png'
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

export default function Market() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.activeProfile)
  const [charName, setCharName] = useState<string | null>(null)

  useEffect(() => {
    if (!profile?.character_id) return
    supabase
      .from('characters')
      .select('name_fr')
      .eq('id', profile.character_id)
      .single()
      .then(({ data }) => setCharName(data?.name_fr ?? null))
  }, [profile?.character_id])

  const avatarImg = charName ? characterImages[charName] : null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-patapam-yellow">
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

        <h1 className="text-white font-bold text-lg drop-shadow">🛒 Marché</h1>

        <div className="flex items-center gap-1 bg-white/20 rounded-full px-4 py-1">
          <span className="text-yellow-300 text-lg">🪙</span>
          <span className="text-white font-bold">{profile?.coins ?? 0}</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-black relative">
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ aspectRatio: '16/9', maxHeight: '100%', maxWidth: '100%' }}
        >
          <img
            src={marketImg}
            alt="Le marché de Patapam"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ position: 'absolute', top: '0%', left: '37.5%', width: '25%', height: '25%' }}
            className="group z-10 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-transparent hover:border-white/60 hover:bg-white/20 transition-all duration-200"
            aria-label="Retour à la clairière"
          >
            <span className="text-3xl drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden>
              🌳
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm drop-shadow-lg bg-black/40 px-2 py-1 rounded-lg">
              Clairière
            </span>
          </button>

          <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 bg-black/55 text-white px-6 py-4 rounded-2xl text-center max-w-sm backdrop-blur-sm border border-white/20 pointer-events-none">
            <p className="font-bold text-lg mb-1">Bientôt disponible</p>
            <p className="text-sm text-white/85">
              C&apos;est ici que tu pourras déposer tes pièces et échanger avec les marchands.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
