import { useEffect, useState, useMemo, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import { zoneBgmUrl } from '../lib/zoneMusic'
import { usePageMusic } from '../hooks/usePageMusic'
import patapamImg from '../img/patapam_debout.png'
import clairiereImg from '../img/patapam_clairiere.png'
import dauphinou from '../img/dauphinou.png'
import mollasson from '../img/mollasson.png'
import bobby from '../img/bobby.png'
import tartuffe from '../img/tartuffe.png'
import betachou from '../img/betachou.png'
import dauphinouJump from '../img/coding/dauphinou_jump.png'
import mollassonFront from '../img/coding/mollasson_front.png'

const characterImages: Record<string, string> = {
  Patapam: patapamImg,
  Bobby: bobby,
  Tartuffe: tartuffe,
  Mollasson: mollasson,
  Dauphinou: dauphinou,
  Betachou: betachou,
}

interface ClearingPanelProps {
  style: CSSProperties
  onClick: () => void
  label: string
}

function ClearingPanel({ style, onClick, label }: ClearingPanelProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group relative flex items-center justify-center border-2 border-transparent hover:border-white/60 hover:bg-white/20 transition-all duration-200 rounded-lg"
    >
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm drop-shadow-lg bg-black/40 px-2 py-1 rounded-lg">
        {label}
      </span>
    </button>
  )
}

interface ClearingMarkerProps {
  src: string
  label: string
  style: CSSProperties
  className?: string
}

/** Icône décorative sur l'image de fond (position en % par rapport à la clairière) */
function ClearingMarker({ src, label, style, className }: ClearingMarkerProps) {
  return (
    <div
      style={{ position: 'absolute', ...style }}
      className="group z-10 cursor-default"
      title={label}
    >
      <img
        src={src}
        alt={label}
        className={className ?? 'w-full h-full object-contain pointer-events-none'}
      />
      <span className="absolute bottom-full left-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm drop-shadow-lg bg-black/40 px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </div>
  )
}

export default function Clearing() {
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

  const bgmUrl = useMemo(() => zoneBgmUrl('clearing'), [])
  usePageMusic(bgmUrl)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-patapam-green">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-black/20">
        {/* Gauche : avatar + nom */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 overflow-hidden flex items-center justify-center text-xl">
            {avatarImg
              ? <img src={avatarImg} alt={charName ?? ''} className="w-full h-full object-cover" />
              : <span>🧸</span>
            }
          </div>
          <span className="text-white font-bold text-lg">{profile?.name}</span>
        </div>

        {/* Centre : navigation */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/cabin')} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Cabane</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white bg-white/20">
            <span className="text-xl">🌳</span>
            <span className="text-xs font-bold">Clairière</span>
          </button>
          <button onClick={() => navigate('/collection')} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span className="text-xl">📚</span>
            <span className="text-xs">Album</span>
          </button>
        </div>

        {/* Droite : pièces */}
        <div className="flex items-center gap-1 bg-white/20 rounded-full px-4 py-1">
          <span className="text-yellow-300 text-lg">🪙</span>
          <span className="text-white font-bold">{profile?.coins ?? 0}</span>
        </div>
      </header>

      {/* Clairière — image plein écran */}
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
        <div className="relative" style={{ aspectRatio: '1264/843', height: '100%', maxHeight: '100%', maxWidth: '100%' }}>
          <img
            src={clairiereImg}
            alt="La Clairière de Patapam"
            className="absolute inset-0 w-full h-full object-fill"
          />

          {/* Icônes sur l'image (à ajuster : left / bottom en %) */}
          <ClearingMarker
            src={dauphinouJump}
            label="Grotte de Dauphinou"
            style={{ left: '4.25%', bottom: '26.5%', width: '4%', height: '4%' }}
          />
          <ClearingMarker
            src={mollassonFront}
            label="Arbre de Mollasson"
            style={{ left: '4.5%', bottom: '22%', width: '4%', height: '4%' }}
          />

          {/* Zones cliquables */}
          <ClearingPanel
            onClick={() => navigate('/education')}
            style={{ position: 'absolute', top: '0%', left: '0%', width: '33%', height: '40%' }}
            label="🎓 Éducation"
          />
          <ClearingPanel
            onClick={() => navigate('/beach')}
            style={{ position: 'absolute', top: '66.66%', left: '0%', width: '33.33%', height: '33.34%' }}
            label="🏖️ Plage"
          />
          <ClearingPanel
            onClick={() => navigate('/games')}
            style={{ position: 'absolute', top: '40%', left: '30%', width: '40%', height: '26%' }}
            label="🎮 Les Jeux"
          />
          <ClearingPanel
            onClick={() => navigate('/library')}
            style={{ position: 'absolute', top: '0%', left: '33%', width: '37%', height: '40%' }}
            label="📚 Bibliothèque"
          />
          <ClearingPanel
            onClick={() => navigate('/cabin')}
            style={{ position: 'absolute', top: '0%', left: '70%', width: '30%', height: '50%' }}
            label="🏠 La Cabane"
          />
          <ClearingPanel
            onClick={() => navigate('/market')}
            style={{ position: 'absolute', top: '66%', left: '66%', width: '34%', height: '34%' }}
            label="🛒 Marché"
          />
        </div>
      </div>
    </div>
  )
}

