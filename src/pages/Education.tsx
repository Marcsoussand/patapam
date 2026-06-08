import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import patapamImg from '../img/patapam_debout.png'
import educationImg from '../img/pages/education.png'
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

export default function Education() {
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
    <div className="flex flex-col h-screen overflow-hidden bg-patapam-purple">
      <header className="flex items-center justify-between px-4 py-3 bg-black/20 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 overflow-hidden flex items-center justify-center text-xl">
            {avatarImg ? (
              <img src={avatarImg} alt={charName ?? ''} className="w-full h-full object-cover" />
            ) : (
              <span>🧸</span>
            )}
          </div>
          <span className="text-white font-bold text-lg">{profile?.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/cabin')}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs">Cabane</span>
          </button>
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
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white bg-white/20"
          >
            <span className="text-xl">🎓</span>
            <span className="text-xs font-bold">Éducation</span>
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
          <span className="text-white font-bold">{profile?.coins ?? 0}</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-black relative">
        <div
          className="relative h-full max-h-full w-full max-w-full"
          style={{ aspectRatio: '1671/940', height: '100%' }}
        >
          <img
            src={educationImg}
            alt="Zone éducation de Patapam"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
            draggable={false}
          />

          {/* Overlay sombre — opacité élevée, ajustable plus tard */}
          <div className="absolute inset-0 bg-black/55 pointer-events-none" aria-hidden />

          <button
            type="button"
            onClick={() => navigate('/education/math')}
            style={{ position: 'absolute', top: '0%', left: '0%', width: '33.33%', height: '33.33%' }}
            className="group z-10 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-transparent hover:border-amber-300/70 hover:bg-white/15 transition-all duration-200"
          >
            <span className="text-3xl drop-shadow-lg" aria-hidden>
              🔢
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm drop-shadow-lg bg-black/50 px-2 py-1 rounded-lg">
              Maths
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/education/flags')}
            style={{ position: 'absolute', top: '0%', right: '0%', width: '33.33%', height: '33.33%' }}
            className="group z-10 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-transparent hover:border-amber-300/70 hover:bg-white/15 transition-all duration-200"
          >
            <span className="text-3xl drop-shadow-lg" aria-hidden>
              🏳️
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm drop-shadow-lg bg-black/50 px-2 py-1 rounded-lg">
              Drapeaux
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
