import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProfileStore, type ChildProfile } from '../store/profileStore'
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

interface Character {
  id: string
  name_fr: string
  animal: string | null
  image_url: string | null
}

interface AddProfileModalProps {
  characters: Character[]
  onClose: () => void
  onCreated: (profile: ChildProfile) => void
}

function AddProfileModal({ characters, onClose, onCreated }: AddProfileModalProps) {
  const [name, setName] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Session expirée'); setLoading(false); return }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        parent_id: user.id,
        name: name.trim(),
        birth_year: birthYear ? parseInt(birthYear) : null,
        character_id: selectedCharacter,
      })
      .select()
      .single()

    if (error) { setError('Erreur lors de la création'); setLoading(false); return }
    onCreated(data as ChildProfile)
  }

  const currentYear = new Date().getFullYear()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">
        <h2 className="text-2xl font-bold text-patapam-green mb-5 text-center">
          Ajouter un joueur
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Léa"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-patapam-green"
            />
          </div>

          {/* Année de naissance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année de naissance
            </label>
            <input
              type="number"
              min={currentYear - 15}
              max={currentYear}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder={String(currentYear - 6)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-patapam-green"
            />
          </div>

          {/* Choix du personnage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Avatar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {characters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCharacter(c.id)}
                  className={`rounded-2xl border-4 overflow-hidden transition-all aspect-square ${
                    selectedCharacter === c.id
                      ? 'border-patapam-green scale-105 shadow-lg'
                      : 'border-transparent hover:border-patapam-green/40'
                  }`}
                >
                  {characterImages[c.name_fr] ? (
                    <img src={characterImages[c.name_fr]} alt={c.name_fr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-patapam-yellow/20 flex items-center justify-center text-4xl">🧸</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-patapam-red text-sm text-center">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-600 font-semibold rounded-xl py-3 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-patapam-green text-white font-bold rounded-xl py-3 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? '…' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const MAX_PROFILES = 6

export default function ProfileSelect() {
  const navigate = useNavigate()
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)
  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('characters').select('id, name_fr, animal, image_url'),
    ]).then(([{ data: profileData }, { data: charData }]) => {
      setProfiles((profileData as ChildProfile[]) ?? [])
      setCharacters((charData as Character[]) ?? [])
      setLoading(false)
    })
  }, [])

  const characterById = Object.fromEntries(characters.map((c) => [c.id, c]))

  function selectProfile(profile: ChildProfile) {
    setActiveProfile(profile)
    navigate('/')
  }

  function handleCreated(profile: ChildProfile) {
    setProfiles((prev) => [...prev, profile])
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-patapam-yellow">
        <p className="text-white text-2xl font-bold">Chargement…</p>
      </div>
    )
  }

  // 1 seul slot "+" visible à la fois, max 6 profils
  const showAddSlot = profiles.length < MAX_PROFILES

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-patapam-yellow gap-8 p-6">
      <h1 className="text-4xl font-bold text-white drop-shadow">Qui joue ?</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Profils existants */}
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => selectProfile(profile)}
            className="touch-target flex flex-col items-center gap-2 bg-white rounded-3xl px-8 py-6 shadow-lg hover:scale-105 transition-transform w-40"
          >
            <div className="w-20 h-20 rounded-full bg-patapam-green flex items-center justify-center overflow-hidden">
              {characterById[profile.character_id ?? ''] && characterImages[characterById[profile.character_id ?? ''].name_fr] ? (
                <img
                  src={characterImages[characterById[profile.character_id ?? ''].name_fr]}
                  alt={characterById[profile.character_id ?? ''].name_fr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">🧸</span>
              )}
            </div>
            <span className="text-xl font-bold text-gray-800">{profile.name}</span>
            <span className="text-sm text-patapam-yellow font-semibold">
              {profile.coins} 🪙
            </span>
          </button>
        ))}

        {/* Slot "+" unique */}
        {showAddSlot && (
          <button
            onClick={() => setShowModal(true)}
            className="touch-target flex flex-col items-center justify-center gap-2 bg-white/40 border-4 border-dashed border-white rounded-3xl px-8 py-6 shadow-inner hover:bg-white/60 hover:scale-105 transition-all w-40 h-44"
          >
            <span className="text-5xl text-white font-light leading-none">+</span>
            <span className="text-sm font-semibold text-white text-center leading-tight">
              Ajouter un joueur
            </span>
          </button>
        )}
      </div>

      <button
        onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
        className="text-white underline text-sm opacity-70 hover:opacity-100"
      >
        Se déconnecter
      </button>

      {showModal && (
        <AddProfileModal
          characters={characters}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}


