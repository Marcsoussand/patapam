import { useEffect, useMemo, useState } from 'react'
import type { FlagCountry, FlagQuestion } from '../../types/flags'
import { countryPromptFr } from '../../education/flags/countryPrompt'
import { generateFlagQuestionSequence } from '../../education/flags/generateQuestion'
import { flagsStarsFromCorrect, starLabel } from '../../education/utils/flagsStars'
import { educationFlagPublicUrl } from '../../lib/educationFlagsStorage'
import { playEncouragement, playFlagsPrompt } from '../../lib/audioClips'
import { playSfx } from '../../lib/patapamAudio'
import { educationFlagAudioUrl } from '../../lib/educationFlagsStorage'
import MathLevelSuccess from './MathLevelSuccess'

interface FlagsQuizGameProps {
  countries: FlagCountry[]
  questionCount: number
  choiceCount: number
  starThresholds: [number, number, number]
  title: string
  onComplete: (correct: number, stars: 0 | 1 | 2 | 3) => void | Promise<number>
  onContinue: () => void
  onReplay: () => void
  packEligible?: boolean
  packLabel?: string
}

export default function FlagsQuizGame({
  countries,
  questionCount,
  choiceCount,
  starThresholds,
  title,
  onComplete,
  onContinue,
  onReplay,
  packEligible = false,
  packLabel = 'pack',
}: FlagsQuizGameProps) {
  const questions = useMemo(
    () => generateFlagQuestionSequence(countries, questionCount, choiceCount),
    [countries, questionCount, choiceCount],
  )

  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState<'ok' | 'ko' | null>(null)
  const [coinsAwarded, setCoinsAwarded] = useState(0)
  const [finalStars, setFinalStars] = useState<0 | 1 | 2 | 3>(0)
  const [earnedPack, setEarnedPack] = useState(false)

  const current: FlagQuestion | undefined = questions[index]

  function playCountryName(country: FlagCountry) {
    const url = educationFlagAudioUrl(country.audio_path_fr)
    if (!url) return
    void playSfx(url)
  }

  useEffect(() => {
    if (finished) return
    void playFlagsPrompt()
  }, [index, finished])

  useEffect(() => {
    if (finished || !questions[index]) return
    playCountryName(questions[index].promptCountry)
  }, [index, finished, questions])

  useEffect(() => {
    if (!finished || finalStars >= 1) return
    void playEncouragement()
  }, [finished, finalStars])

  function handleAnswer(country: FlagCountry) {
    if (finished || !current || feedback) return
    const isOk = country.id === current.promptCountry.id
    setFeedback(isOk ? 'ok' : 'ko')
    const nextCorrect = correct + (isOk ? 1 : 0)

    window.setTimeout(() => {
      setFeedback(null)
      if (index + 1 >= questions.length) {
        const stars = flagsStarsFromCorrect(nextCorrect, starThresholds)
        setCorrect(nextCorrect)
        setFinalStars(stars)
        setFinished(true)
        setEarnedPack(packEligible && stars === 3)
        void Promise.resolve(onComplete(nextCorrect, stars)).then((coins) => {
          setCoinsAwarded(typeof coins === 'number' ? coins : 0)
        })
      } else {
        setCorrect(nextCorrect)
        setIndex((i) => i + 1)
      }
    }, 700)
  }

  if (finished) {
    const stars = finalStars
    if (stars >= 1) {
      return (
        <MathLevelSuccess
          title={title}
          correct={correct}
          total={questions.length}
          stars={stars as 1 | 2 | 3}
          coinsAwarded={coinsAwarded}
          packAwarded={earnedPack}
          packLabel={packLabel}
          onReplay={onReplay}
          onContinue={onContinue}
        />
      )
    }

    const minStars = starThresholds[0]
    return (
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-white/90 text-lg">
          {correct} / {questions.length} bonnes réponses
        </p>
        <p className="text-3xl" aria-label={`${stars} étoiles`}>
          {starLabel(stars)}
        </p>
        <p className="text-amber-200">
          Encore un effort — il faut au moins {minStars} bonnes réponses.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={onReplay}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-4 py-3 font-bold text-white hover:bg-white/20 transition-colors"
          >
            <span className="text-xl leading-none" aria-hidden>
              🔁
            </span>
            Rejouer
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-3 font-bold text-white hover:bg-white/30 transition-colors"
          >
            <span className="text-xl leading-none" aria-hidden>
              ▶
            </span>
            Continuer
          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  const promptLabel = countryPromptFr(current.promptCountry)

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-3xl px-4">
      <div className="w-full text-center">
        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
        <p className="text-white/70 text-sm">
          Question {index + 1} / {questions.length}
        </p>
      </div>

      <div className="text-center">
        <p className="text-white/70 text-sm mb-2">Quel est le drapeau</p>
        <div className="flex items-center justify-center gap-3">
          <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">{promptLabel}</h3>
          {current.promptCountry.audio_path_fr && (
            <button
              type="button"
              onClick={() => playCountryName(current.promptCountry)}
              className="rounded-full bg-white/20 p-2 text-xl hover:bg-white/30 transition-colors"
              aria-label={`Écouter ${promptLabel}`}
            >
              🔊
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 w-full">
        {current.choices.map((country) => {
          const isCorrect = country.id === current.promptCountry.id
          let ring = 'ring-white/40 hover:ring-amber-300 hover:scale-[1.02]'
          if (feedback && isCorrect) ring = 'ring-4 ring-emerald-400 scale-[1.02]'
          if (feedback && !isCorrect) ring = 'ring-white/20 opacity-60'

          return (
            <button
              key={country.id}
              type="button"
              disabled={!!feedback}
              onClick={() => handleAnswer(country)}
              className={`relative aspect-[4/3] w-[40vw] max-w-[280px] min-w-[140px] overflow-hidden rounded-2xl shadow-xl ring-2 transition-all ${ring} disabled:cursor-default`}
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

      {feedback === 'ok' && <p className="text-emerald-300 font-bold">Bravo !</p>}
      {feedback === 'ko' && (
        <p className="text-amber-200 font-semibold">
          C&apos;était <strong>{promptLabel}</strong>
        </p>
      )}
    </div>
  )
}
