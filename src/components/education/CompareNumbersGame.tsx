import { useEffect, useMemo, useState } from 'react'
import type { CompareQuestion } from '../../education/types/math'
import { generateCompareQuestions } from '../../education/games/generateQuestions'
import { starLabel, starsFromCorrectCount } from '../../education/utils/mathStars'
import { playEncouragement, playMathPrompt } from '../../lib/audioClips'
import MathLevelSuccess from './MathLevelSuccess'

interface CompareNumbersGameProps {
  min: number
  max: number
  mode: 'max' | 'min'
  questionCount: number
  title: string
  onComplete: (correct: number, stars: 0 | 1 | 2 | 3) => void | Promise<number>
  onContinue: () => void
  onReplay: () => void
}

export default function CompareNumbersGame({
  min,
  max,
  mode,
  questionCount,
  title,
  onComplete,
  onContinue,
  onReplay,
}: CompareNumbersGameProps) {
  const questions = useMemo(
    () => generateCompareQuestions(questionCount, min, max, mode),
    [questionCount, min, max, mode],
  )

  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const [feedback, setFeedback] = useState<'ok' | 'ko' | null>(null)
  const [coinsAwarded, setCoinsAwarded] = useState(0)
  const [finalStars, setFinalStars] = useState<0 | 1 | 2 | 3>(0)

  const current: CompareQuestion | undefined = questions[index]
  const prompt = mode === 'max' ? 'Quel est le plus grand ?' : 'Quel est le plus petit ?'

  useEffect(() => {
    if (finished) return
    void playMathPrompt(mode)
  }, [index, mode, finished])

  useEffect(() => {
    if (!finished || finalStars >= 1) return
    void playEncouragement()
  }, [finished, finalStars])

  function handleAnswer(value: number) {
    if (finished || !current || feedback) return
    const isOk = value === current.correct
    setFeedback(isOk ? 'ok' : 'ko')
    const nextCorrect = correct + (isOk ? 1 : 0)

    window.setTimeout(() => {
      setFeedback(null)
      if (index + 1 >= questions.length) {
        const stars = starsFromCorrectCount(nextCorrect, questions.length)
        setCorrect(nextCorrect)
        setFinalStars(stars)
        setFinished(true)
        void Promise.resolve(onComplete(nextCorrect, stars)).then((coins) => {
          setCoinsAwarded(typeof coins === 'number' ? coins : 0)
        })
      } else {
        setCorrect(nextCorrect)
        setIndex((i) => i + 1)
      }
    }, 600)
  }

  if (finished) {
    const stars = finalStars
    if (stars >= 1) {
      return (
        <>
          <MathLevelSuccess
            title={title}
            correct={correct}
            total={questions.length}
            stars={stars as 1 | 2 | 3}
            coinsAwarded={coinsAwarded}
            onReplay={onReplay}
            onContinue={onContinue}
          />
        </>
      )
    }

    return (
      <div className="flex flex-col items-center gap-6 text-center px-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-white/90 text-lg">
          {correct} / {questions.length} bonnes réponses
        </p>
        <p className="text-3xl" aria-label={`${stars} étoiles`}>
          {starLabel(stars)}
        </p>
        <p className="text-amber-200">Encore un effort — il faut au moins 3 bonnes réponses.</p>
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

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md px-4">
      <div className="w-full text-center">
        <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
        <p className="text-white/70 text-sm">
          Question {index + 1} / {questions.length}
        </p>
      </div>

      <p className="text-2xl font-bold text-white">{prompt}</p>

      <div className="flex gap-6 w-full justify-center">
        {[current.a, current.b].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleAnswer(value)}
            disabled={!!feedback}
            className={`flex h-28 w-28 items-center justify-center rounded-2xl border-4 text-4xl font-black shadow-xl transition-all ${
              feedback && value === current.correct
                ? 'border-emerald-300 bg-emerald-500/90 text-white scale-105'
                : feedback && value !== current.correct
                  ? 'border-red-300/80 bg-red-500/40 text-white/70'
                  : 'border-white/80 bg-white/95 text-purple-900 hover:scale-105 active:scale-95'
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {feedback === 'ok' && <p className="text-emerald-300 font-bold">Bravo !</p>}
      {feedback === 'ko' && (
        <p className="text-amber-200 font-semibold">
          C&apos;était <strong>{current.correct}</strong>
        </p>
      )}
    </div>
  )
}
