import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
import { usePageMusic } from '../hooks/usePageMusic'
import { zoneBgmUrl } from '../lib/zoneMusic'
import patapamImg from '../img/patapam_debout.png'
import beachImg from '../img/pages/beach.png'
import dauphinou from '../img/dauphinou.png'
import mollasson from '../img/mollasson.png'
import bobby from '../img/bobby.png'
import tartuffe from '../img/tartuffe.png'
import betachou from '../img/betachou.png'
import CodingGame from '../coding/CodingGame'

const characterImages: Record<string, string> = {
  Patapam: patapamImg,
  Bobby: bobby,
  Tartuffe: tartuffe,
  Mollasson: mollasson,
  Dauphinou: dauphinou,
  Betachou: betachou,
}

interface BeachPanelProps {
  style: CSSProperties
  onClick: () => void
  label: string
}

function BeachPanel({ style, onClick, label }: BeachPanelProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="group absolute flex items-center justify-center border-2 border-transparent hover:border-white/60 hover:bg-white/20 transition-all duration-200 rounded-lg"
    >
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white font-bold text-sm drop-shadow-lg bg-black/40 px-2 py-1 rounded-lg">
        {label}
      </span>
    </button>
  )
}

export default function Beach() {
  const navigate = useNavigate()
  const profile = useProfileStore((s) => s.activeProfile)
  const [charName, setCharName] = useState<string | null>(null)
  const [mollassonOpen, setMollassonOpen] = useState(false)
  const [dauphinouOpen, setDauphinouOpen] = useState(false)

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
  const bgmUrl = useMemo(() => zoneBgmUrl('beach'), [])
  usePageMusic(bgmUrl)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-patapam-blue">
      <header className="flex items-center justify-between px-4 py-3 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 overflow-hidden flex items-center justify-center text-xl">
            {avatarImg
              ? <img src={avatarImg} alt={charName ?? ''} className="w-full h-full object-cover" />
              : <span>🧸</span>
            }
          </div>
          <span className="text-white font-bold text-lg">{profile?.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => navigate('/cabin')} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span className="text-xl">🏠</span>
            <span className="text-xs">Cabane</span>
          </button>
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span className="text-xl">🌳</span>
            <span className="text-xs">Clairière</span>
          </button>
          <button onClick={() => navigate('/collection')} className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <span className="text-xl">📚</span>
            <span className="text-xs">Album</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-white/20 rounded-full px-4 py-1">
          <span className="text-yellow-300 text-lg">🪙</span>
          <span className="text-white font-bold">{profile?.coins ?? 0}</span>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-black">
        <div className="relative" style={{ aspectRatio: '1424/752', height: '100%', maxHeight: '100%', maxWidth: '100%' }}>
          <img
            src={beachImg}
            alt="La Plage de Patapam"
            className="absolute inset-0 w-full h-full object-fill"
          />

          <BeachPanel
            onClick={() => setDauphinouOpen(true)}
            style={{ top: '50%', left: '0%', width: '55%', height: '45%' }}
            label="🐬 Codage — Dauphinou"
          />
          <BeachPanel
            onClick={() => setMollassonOpen(true)}
            style={{ top: '0%', left: '40%', width: '40%', height: '50%' }}
            label="🦥 Codage — Mollasson"
          />
          <BeachPanel
            onClick={() => navigate('/')}
            style={{ top: '50%', left: '65%', width: '35%', height: '45%' }}
            label="🌳 Clairière"
          />
        </div>
      </div>

      {mollassonOpen && profile && (
        <CodingGame profileId={profile.id} onClose={() => setMollassonOpen(false)} hero="mollasson" />
      )}
      {dauphinouOpen && profile && (
        <CodingGame profileId={profile.id} onClose={() => setDauphinouOpen(false)} hero="dauphinou" />
      )}
    </div>
  )
}
