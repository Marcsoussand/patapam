import { useNavigate } from 'react-router-dom'

export default function Games() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-patapam-yellow gap-6">
      <h1 className="text-4xl font-bold text-white drop-shadow">🎮 Les Jeux</h1>
      <p className="text-white/80 text-lg">Les jeux arrivent bientôt !</p>
      <button
        onClick={() => navigate('/')}
        className="bg-white text-patapam-yellow font-bold px-6 py-3 rounded-2xl shadow hover:scale-105 transition-transform"
      >
        ← Retour à la clairière
      </button>
    </div>
  )
}
