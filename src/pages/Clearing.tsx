import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProfileStore } from '../store/profileStore'
import { supabase } from '../lib/supabase'
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

interface Zone {
  id: string
  label: string
  emoji: string
  route: string
  color: string
  unlocked: boolean
}

const ZONES: Zone[] = [
  { id: 'dauphinou', label: 'Côte de Dauphinou', emoji: '🌊', route: '/zone/dauphinou', color: 'bg-patapam-blue',   unlocked: true  },
  { id: 'tartuffe',  label: 'Montagne de Tartuffe', emoji: '⛰️',  route: '/zone/tartuffe',  color: 'bg-patapam-purple', unlocked: false },
  { id: 'mollasson', label: 'Forêt de Mollasson', emoji: '🌿', route: '/zone/mollasson', color: 'bg-patapam-green',  unlocked: false },
  { id: 'bobby',     label: 'Village de Bobby',   emoji: '🏘️', route: '/zone/bobby',     color: 'bg-patapam-yellow', unlocked: false },
]

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

  return (
    <div className="flex flex-col min-h-screen bg-patapam-green">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/30 overflow-hidden flex items-center justify-center text-xl">
            {avatarImg
              ? <img src={avatarImg} alt={charName ?? ''} className="w-full h-full object-cover" />
              : <span>🧸</span>
            }
          </div>
          <span className="text-white font-bold text-lg">{profile?.name}</span>
        </div>
        <div className="flex items-center gap-1 bg-white/20 rounded-full px-4 py-1">
          <span className="text-yellow-300 text-lg">🪙</span>
          <span className="text-white font-bold">{profile?.coins ?? 0}</span>
        </div>
      </header>

      {/* Titre */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white drop-shadow">La Clairière</h1>
        <p className="text-white/70 mt-1">Choisis ta destination !</p>
      </div>

      {/* Grille des zones */}
      <div className="grid grid-cols-2 gap-4 px-6 pb-8 flex-1 max-w-lg mx-auto w-full">
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            onClick={() => zone.unlocked && navigate(zone.route)}
            disabled={!zone.unlocked}
            className={`
              touch-target flex flex-col items-center justify-center gap-2 rounded-3xl p-6
              shadow-lg transition-transform
              ${zone.unlocked ? `${zone.color} text-white hover:scale-105 active:scale-95` : 'bg-gray-300 text-gray-400'}
            `}
            style={zone.unlocked ? {} : { filter: 'saturate(0.2) blur(0px)', opacity: 0.5 }}
          >
            <span className="text-5xl">{zone.emoji}</span>
            <span className="font-bold text-sm text-center leading-tight">{zone.label}</span>
            {!zone.unlocked && <span className="text-xs mt-1">🔒 Verrouillé</span>}
          </button>
        ))}
      </div>

      {/* Barre de navigation */}
      <nav className="flex justify-around items-center bg-white py-3 border-t border-gray-100">
        <button onClick={() => navigate('/cabin')} className="flex flex-col items-center gap-1 text-gray-500 hover:text-patapam-green">
          <span className="text-2xl">🏠</span>
          <span className="text-xs">Cabane</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-patapam-green">
          <span className="text-2xl">🌳</span>
          <span className="text-xs font-bold">Clairière</span>
        </button>
        <button onClick={() => navigate('/collection')} className="flex flex-col items-center gap-1 text-gray-500 hover:text-patapam-green">
          <span className="text-2xl">📚</span>
          <span className="text-xs">Album</span>
        </button>
      </nav>
    </div>
  )
}

