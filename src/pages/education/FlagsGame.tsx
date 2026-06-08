import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateFlagQuestion } from '../../education/flags/generateQuestion'
import { educationFlagAudioUrl, educationFlagPublicUrl } from '../../lib/educationFlagsStorage'
import { loadFlagPanel, STARTER_FLAG_PANEL_ID } from '../../lib/flagCatalog'
import type { FlagCountry, FlagPanel, FlagQuestion } from '../../types/flags'

export default function FlagsGame() {
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [panel, setPanel] = useState<FlagPanel | null>(null)
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState<FlagQuestion | null>(null)
  const [feedback, setFeedback] = useState<'ok' | 'ko' | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const loadQuestion = useCallback((p: FlagPanel) => {
    setFeedback(null)
    setQuestion(generateFlagQuestion(p.countries, p.choice_count))
  }, [])

  useEffect(() => {
    let cancelled = false
    loadFlagPanel(STARTER_FLAG_PANEL_ID).then((data) => {
      if (cancelled) return
      setPanel(data)
      if (data) loadQuestion(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [loadQuestion])

  function playCountryName(country: FlagCountry) {
    const url = educationFlagAudioUrl(country.audio_path_fr)
    if (!url) return
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = new Audio(url)
    } else {
      audioRef.current = new Audio(url)
    }
    void audioRef.current.play().catch(() => {})
  }

  useEffect(() => {
    if (!question) return
    playCountryName(question.promptCountry)
  }, [question])

  function handleAnswer(country: FlagCountry) {
    if (!question || !panel || feedback) return
    const isOk = country.id === question.promptCountry.id
    setFeedback(isOk ? 'ok' : 'ko')
    setScore((s) => ({
      correct: s.correct + (isOk ? 1 : 0),
      total: s.total + 1,
    }))

    window.setTimeout(() => {
      loadQuestion(panel)
    }, 900)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-patapam-purple text-white">
        Chargement…
      </div>
    )
  }

  if (!panel || panel.countries.length < 2) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-patapam-purple p-6 text-white text-center">
        <p>Panel drapeaux indisponible — vérifie la migration et les uploads Storage.</p>
        <button
          type="button"
          onClick={() => navigate('/education')}
          className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
        >
          Retour
        </button>
      </div>
    )
  }

  if (!question) return null

  const promptName = question.promptCountry.name_fr

  return (
    <div className="flex flex-col min-h-screen bg-patapam-purple">
      <header className="flex items-center justify-between px-4 py-3 bg-black/30 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/education')}
          className="rounded-xl px-3 py-1.5 text-white/90 hover:bg-white/10 font-semibold text-sm"
        >
          ← Éducation
        </button>
        <h1 className="text-white font-bold">🏳️ Drapeaux</h1>
        <span className="text-white/80 text-sm tabular-nums">
          {score.correct}/{score.total}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-6">
        <div className="text-center">
          <p className="text-white/70 text-sm mb-2">Quel est le drapeau de…</p>
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-3xl font-black text-white drop-shadow-md">{promptName}</h2>
            {question.promptCountry.audio_path_fr && (
              <button
                type="button"
                onClick={() => playCountryName(question.promptCountry)}
                className="rounded-full bg-white/20 p-2 text-xl hover:bg-white/30 transition-colors"
                aria-label={`Écouter ${promptName}`}
              >
                🔊
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-5 sm:gap-10 w-full max-w-3xl px-2">
          {question.choices.map((country) => {
            const isCorrect = country.id === question.promptCountry.id
            let ring = 'ring-white/40 hover:ring-amber-300 hover:scale-[1.02]'
            if (feedback && isCorrect) ring = 'ring-4 ring-emerald-400 scale-[1.02]'
            if (feedback && !isCorrect && feedback === 'ko') ring = 'ring-white/20 opacity-50'

            return (
              <button
                key={country.id}
                type="button"
                disabled={!!feedback}
                onClick={() => handleAnswer(country)}
                className={`relative aspect-[4/3] w-[42vw] max-w-[340px] min-w-[160px] overflow-hidden rounded-2xl shadow-xl ring-2 transition-all ${ring} disabled:cursor-default`}
              >
                <img
                  src={educationFlagPublicUrl(country.storage_path)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              </button>
            )
          })}
        </div>

        {feedback === 'ok' && <p className="text-emerald-300 font-bold text-lg">Bravo !</p>}
        {feedback === 'ko' && (
          <p className="text-amber-200 font-semibold">
            C&apos;était <strong>{promptName}</strong>
          </p>
        )}
      </main>
    </div>
  )
}
