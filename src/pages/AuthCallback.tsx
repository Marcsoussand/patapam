import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const code = new URLSearchParams(window.location.search).get('code')

      if (code) {
        // Tente l'échange explicite du code PKCE
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (data.session) {
          navigate('/profiles', { replace: true })
          return
        }

        // Si erreur (verifier déjà consommé par l'auto-detect du client),
        // la session a peut-être déjà été établie — on la vérifie
        if (error) {
          const { data: fallback } = await supabase.auth.getSession()
          if (fallback.session) {
            navigate('/profiles', { replace: true })
            return
          }
        }
      } else {
        // Pas de code (flux direct) — vérifie session existante
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          navigate('/profiles', { replace: true })
          return
        }
      }

      navigate('/login', { replace: true })
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-patapam-green">
      <p className="text-white text-xl font-bold">Connexion en cours…</p>
    </div>
  )
}
