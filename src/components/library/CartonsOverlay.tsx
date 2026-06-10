import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguageStore } from '../../store/languageStore'
import {
  CATEGORY_KEYS,
  DOMAN_CONTENT,
  getCategory,
  shuffle,
  whereisAudio,
  wordLabel,
  type AgeGroup,
  type CardWord,
  type CategoryKey,
} from '../../data/cartons'
import { playCongrats } from '../../lib/audioClips'
import { playSfx, stopSfx } from '../../lib/patapamAudio'
import './cartons.css'

type SetupScreen = 'age' | 'category' | 'mode'
type CardMode = 'learn' | 'find' | null

interface FindRound {
  correct: CardWord
  cards: CardWord[]
}

interface CartonsOverlayProps {
  open: boolean
  onClose: () => void
}

function useFitText(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  scale = 1,
) {
  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return

    const fit = () => {
      const maxW = (el.parentElement?.clientWidth ?? window.innerWidth) * 0.92 * scale
      const maxH = (el.parentElement?.clientHeight ?? window.innerHeight) * 0.8 * scale
      let size = Math.min(maxH, maxW)
      el.style.fontSize = `${size}px`
      while ((el.scrollWidth > maxW || el.scrollHeight > maxH) && size > 20) {
        size -= 4
        el.style.fontSize = `${size}px`
      }
    }

    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [ref, active, scale])
}

function useFitTextButton(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
) {
  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return

    const fit = () => {
      const w = el.clientWidth || window.innerWidth * 0.44
      const h = el.clientHeight || window.innerHeight * 0.7
      let size = Math.min(w * 0.9, h * 0.85)
      el.style.fontSize = `${size}px`
      while ((el.scrollWidth > w || el.scrollHeight > h) && size > 12) {
        size -= 4
        el.style.fontSize = `${size}px`
      }
    }

    requestAnimationFrame(() => requestAnimationFrame(fit))
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [ref, active])
}

function DomanPopup({ onClose }: { onClose: () => void }) {
  const language = useLanguageStore((s) => s.language)
  const content = DOMAN_CONTENT[language] ?? DOMAN_CONTENT.fr

  return (
    <div className="doman-overlay" onClick={onClose}>
      <div className="doman-popup" onClick={(e) => e.stopPropagation()}>
        <div className="doman-popup__header">
          <h3>{content.title}</h3>
          <button type="button" className="doman-popup__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>
        <div
          className="doman-popup__body"
          dir={content.dir}
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      </div>
    </div>
  )
}

function FindCardButton({
  card,
  isCorrect,
  feedback,
  onPick,
}: {
  card: CardWord
  isCorrect: boolean
  feedback: 'correct' | 'wrong' | null
  onPick: (correct: boolean) => void
}) {
  const language = useLanguageStore((s) => s.language)
  const ref = useRef<HTMLButtonElement>(null)
  useFitTextButton(ref, feedback === null)

  const className = [
    'card-overlay__find-card',
    feedback === 'correct' ? 'is-correct' : '',
    feedback === 'wrong' ? 'is-wrong' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      disabled={feedback !== null}
      onClick={() => onPick(isCorrect)}
    >
      {wordLabel(card, language)}
    </button>
  )
}

export default function CartonsOverlay({ open, onClose }: CartonsOverlayProps) {
  const { t } = useTranslation()
  const language = useLanguageStore((s) => s.language)

  const [screen, setScreen] = useState<SetupScreen>('age')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null)
  const [categoryKey, setCategoryKey] = useState<CategoryKey | null>(null)
  const [cardMode, setCardMode] = useState<CardMode>(null)
  const [showDoman, setShowDoman] = useState(false)

  const [learnIndex, setLearnIndex] = useState(0)
  const [learnWordVisible, setLearnWordVisible] = useState(true)
  const [findSeen, setFindSeen] = useState<string[]>([])
  const [findRound, setFindRound] = useState<FindRound | null>(null)
  const [findFeedback, setFindFeedback] = useState<Record<string, 'correct' | 'wrong'>>({})

  const learnWordRef = useRef<HTMLDivElement>(null)
  const learnTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const category = categoryKey ? getCategory(categoryKey) : undefined
  const ageLabel =
    ageGroup === 'young'
      ? t('library.cartons.ageYoung')
      : ageGroup === 'older'
        ? t('library.cartons.ageOlder')
        : ''

  useFitText(
    learnWordRef,
    cardMode === 'learn' && learnWordVisible,
    ageGroup === 'older' ? 2 / 3 : 1,
  )

  const stopAudio = useCallback(() => {
    stopSfx()
  }, [])

  const clearLearnTimers = useCallback(() => {
    learnTimersRef.current.forEach(clearTimeout)
    learnTimersRef.current = []
  }, [])

  const resetState = useCallback(() => {
    clearLearnTimers()
    stopAudio()
    setScreen('age')
    setAgeGroup(null)
    setCategoryKey(null)
    setCardMode(null)
    setShowDoman(false)
    setLearnIndex(0)
    setLearnWordVisible(true)
    setFindSeen([])
    setFindRound(null)
    setFindFeedback({})
  }, [clearLearnTimers, stopAudio])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  const exitCardMode = useCallback(() => {
    clearLearnTimers()
    stopAudio()
    setCardMode(null)
    setLearnIndex(0)
    setLearnWordVisible(true)
    setFindSeen([])
    setFindRound(null)
    setFindFeedback({})
    setScreen('mode')
  }, [clearLearnTimers, stopAudio])

  const startFindRound = useCallback(
    (seen: string[]) => {
      if (!category) return

      if (seen.length >= category.words.length) {
        exitCardMode()
        return
      }

      const unseen = category.words.filter((w) => !seen.includes(w.fr))
      const correct = shuffle(unseen)[0]
      const others = category.words.filter((w) => w.fr !== correct.fr)
      const wrong = others[Math.floor(Math.random() * others.length)]
      const cards = shuffle([correct, wrong])

      setFindRound({ correct, cards })
      setFindFeedback({})

      stopAudio()
      void playSfx(whereisAudio(correct.audio))
    },
    [category, exitCardMode, stopAudio],
  )

  useEffect(() => {
    if (!open) resetState()
  }, [open, resetState])

  useEffect(() => {
    if (cardMode !== 'learn' || !category) return

    if (learnIndex >= category.words.length) {
      exitCardMode()
      return
    }

    if (!learnWordVisible) return

    const word = category.words[learnIndex]
    stopAudio()
    void playSfx(word.audio)

    const hideTimer = setTimeout(() => {
      setLearnWordVisible(false)
      const nextTimer = setTimeout(() => {
        setLearnIndex((i) => i + 1)
        setLearnWordVisible(true)
      }, 1000)
      learnTimersRef.current.push(nextTimer)
    }, 10000)
    learnTimersRef.current.push(hideTimer)

    return () => {
      clearLearnTimers()
      stopAudio()
    }
  }, [cardMode, category, learnIndex, learnWordVisible, clearLearnTimers, stopAudio, exitCardMode])

  useEffect(() => {
    if (cardMode === 'find' && findRound === null && category) {
      startFindRound(findSeen)
    }
  }, [cardMode, findRound, findSeen, category, startFindRound])

  if (!open) return null

  const currentLearnWord =
    cardMode === 'learn' && category && learnIndex < category.words.length
      ? category.words[learnIndex]
      : null

  function handleFindPick(card: CardWord, isCorrect: boolean) {
    if (!findRound || findFeedback[card.fr]) return

    if (isCorrect) {
      setFindFeedback({ [card.fr]: 'correct' })
      stopAudio()

      const nextSeen = [...findSeen, findRound.correct.fr]
      const advance = () => {
        setFindSeen(nextSeen)
        setFindRound(null)
      }

      void playCongrats(language).then((snd) => {
        if (!snd) {
          advance()
          return
        }
        snd.addEventListener('ended', advance, { once: true })
        setTimeout(() => {
          if (!snd.ended) {
            snd.pause()
            advance()
          }
        }, 3000)
      })
    } else {
      setFindFeedback({ [card.fr]: 'wrong' })
    }
  }

  return (
    <>
      <div className="reading-panel">
        <div className="reading-panel__content">
          {screen === 'age' && (
            <div className="cartons-setup">
              <h2 className="cartons-setup__title">
                {t('library.cartons.title')}
                <button
                  type="button"
                  className="cartons-info-btn"
                  aria-label={t('library.cartons.domanInfo')}
                  onClick={() => setShowDoman(true)}
                >
                  ℹ
                </button>
              </h2>
              <p className="cartons-setup__subtitle">{t('library.cartons.ageLabel')}</p>
              <div className="cartons-setup__levels">
                <button
                  type="button"
                  className="cartons-age-btn"
                  onClick={() => {
                    setAgeGroup('young')
                    setScreen('category')
                  }}
                >
                  {t('library.cartons.ageYoung')}
                </button>
                <button
                  type="button"
                  className="cartons-age-btn"
                  onClick={() => {
                    setAgeGroup('older')
                    setScreen('category')
                  }}
                >
                  {t('library.cartons.ageOlder')}
                </button>
              </div>
            </div>
          )}

          {screen === 'category' && (
            <div className="cartons-setup">
              <div className="cartons-setup__nav">
                <button type="button" className="cartons-back-btn" onClick={() => setScreen('age')}>
                  {t('library.cartons.back')}
                </button>
                <h2 className="cartons-setup__title">
                  {t('library.cartons.title')} — {ageLabel}
                </h2>
              </div>
              <div className="cartons-setup__categories">
                {CATEGORY_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="cartons-category-btn"
                    onClick={() => {
                      setCategoryKey(key)
                      setScreen('mode')
                    }}
                  >
                    {t(`library.cartons.categories.${key}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {screen === 'mode' && (
            <div className="cartons-setup">
              <div className="cartons-setup__nav">
                <button
                  type="button"
                  className="cartons-back-btn"
                  onClick={() => setScreen('category')}
                >
                  {t('library.cartons.back')}
                </button>
                <h2 className="cartons-setup__title">{t('library.cartons.title')}</h2>
              </div>
              <div className="cartons-setup__levels">
                <button
                  type="button"
                  className="cartons-age-btn"
                  onClick={() => {
                    setLearnIndex(0)
                    setLearnWordVisible(true)
                    setCardMode('learn')
                  }}
                >
                  {t('library.cartons.learn')}
                </button>
                <button
                  type="button"
                  className="cartons-age-btn"
                  onClick={() => {
                    setFindSeen([])
                    setFindRound(null)
                    setCardMode('find')
                  }}
                >
                  {t('library.cartons.find')}
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          className="reading-panel__close"
          onClick={handleClose}
          aria-label={t('common.back')}
        >
          ✕
        </button>
      </div>

      {cardMode === 'learn' && currentLearnWord && (
        <div className="card-overlay">
          <button type="button" className="card-overlay__stop" onClick={exitCardMode}>
            {t('library.cartons.stop')}
          </button>
          <div
            ref={learnWordRef}
            className={`card-overlay__word${ageGroup === 'older' ? ' card-overlay__word--older' : ''}`}
          >
            {learnWordVisible ? wordLabel(currentLearnWord, language) : ''}
          </div>
        </div>
      )}

      {cardMode === 'find' && findRound && (
        <div className="card-overlay">
          <button type="button" className="card-overlay__stop" onClick={exitCardMode}>
            {t('library.cartons.back')}
          </button>
          <div className="card-overlay__find">
            {findRound.cards.map((card) => (
              <FindCardButton
                key={card.fr}
                card={card}
                isCorrect={card.fr === findRound.correct.fr}
                feedback={findFeedback[card.fr] ?? null}
                onPick={(correct) => handleFindPick(card, correct)}
              />
            ))}
          </div>
        </div>
      )}

      {showDoman && <DomanPopup onClose={() => setShowDoman(false)} />}
    </>
  )
}
