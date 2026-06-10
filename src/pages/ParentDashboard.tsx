import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProfileStore, type ChildProfile } from '../store/profileStore'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const activeProfile = useProfileStore((s) => s.activeProfile)
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile)

  const [profiles, setProfiles] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ChildProfile | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .order('created_at')
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError('Impossible de charger les profils')
        else setProfiles((data as ChildProfile[]) ?? [])
        setLoading(false)
      })
  }, [])

  function startEdit(profile: ChildProfile) {
    setEditingId(profile.id)
    setEditName(profile.name)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function saveName(profileId: string) {
    const trimmed = editName.trim()
    if (!trimmed) return
    setSavingId(profileId)
    setError(null)

    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ name: trimmed })
      .eq('id', profileId)
      .select()
      .single()

    setSavingId(null)
    if (updateError) {
      setError('Erreur lors de la modification du nom')
      return
    }

    const updated = data as ChildProfile
    setProfiles((prev) => prev.map((p) => (p.id === profileId ? updated : p)))
    if (activeProfile?.id === profileId) {
      setActiveProfile(updated)
    }
    cancelEdit()
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', deleteTarget.id)

    setDeleting(false)
    if (deleteError) {
      setError('Erreur lors de la suppression')
      return
    }

    setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    if (activeProfile?.id === deleteTarget.id) {
      setActiveProfile(null)
    }
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col min-h-screen bg-patapam-yellow">
      <header className="flex items-center gap-4 px-4 py-4 bg-black/15 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/profiles')}
          className="rounded-xl px-3 py-2 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
        >
          ← Profils
        </button>
        <h1 className="text-xl font-bold text-white drop-shadow">Gestion du compte</h1>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full">
        <p className="text-white/90 text-sm mb-6 leading-relaxed">
          Modifier ou supprimer les profils joueurs. La suppression efface aussi la progression
          associée.
        </p>

        {loading && <p className="text-white font-semibold text-center">Chargement…</p>}

        {!loading && profiles.length === 0 && (
          <p className="text-white/90 text-center">Aucun profil pour ce compte.</p>
        )}

        <ul className="flex flex-col gap-3">
          {profiles.map((profile) => (
            <li
              key={profile.id}
              className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-md"
            >
              {editingId === profile.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 min-w-0 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-patapam-green"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void saveName(profile.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <button
                    type="button"
                    disabled={savingId === profile.id || !editName.trim()}
                    onClick={() => void saveName(profile.id)}
                    className="shrink-0 rounded-xl bg-patapam-green px-3 py-2 text-white text-sm font-bold disabled:opacity-50"
                  >
                    {savingId === profile.id ? '…' : 'OK'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="shrink-0 rounded-xl border border-gray-300 px-3 py-2 text-gray-600 text-sm"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 min-w-0 text-lg font-bold text-gray-800 truncate">
                    {profile.name}
                  </span>
                  <span className="text-sm text-gray-500 shrink-0">{profile.coins} 🪙</span>
                  <button
                    type="button"
                    onClick={() => startEdit(profile)}
                    className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label={`Modifier ${profile.name}`}
                    title="Modifier le prénom"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(profile)}
                    className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-patapam-red hover:bg-red-50 transition-colors"
                    aria-label={`Supprimer ${profile.name}`}
                    title="Supprimer le profil"
                  >
                    ✕
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {error && <p className="mt-4 text-center text-patapam-red font-semibold text-sm">{error}</p>}
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Supprimer {deleteTarget.name} ?
            </h2>
            <p className="text-gray-600 text-sm text-center mb-6 leading-relaxed">
              Cette action est définitive : progression, pièces et objets de ce profil seront
              perdus.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 border border-gray-300 text-gray-600 font-semibold rounded-xl py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="flex-1 bg-patapam-red text-white font-bold rounded-xl py-3 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {deleting ? '…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
