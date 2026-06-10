import type { CardWord, CategoryKey } from '../data/cartons'
import { patapamAudioPublicUrl } from './patapamAudioStorage'
import { playSfx } from './patapamAudio'

/** Mots famille avec 3 clips consécutifs (papa1.m4a, papa2.m4a, …). */
const FAMILLE_MULTI_CLIP_SLUGS = new Set(['papa', 'aaron', 'naor', 'elon'])

/** Fichier unique pour l’instant (harmonisation 1/2/3 plus tard). */
const FAMILLE_SINGLE_CLIP_SLUGS = new Set(['maman'])

const FAMILLE_AUDIO_BASE = 'shared/fr/vocab/famille'

export function familleLearnAudioUrls(slug: string): string[] | null {
  if (FAMILLE_SINGLE_CLIP_SLUGS.has(slug)) {
    return [patapamAudioPublicUrl(`${FAMILLE_AUDIO_BASE}/${slug}.m4a`)]
  }
  if (!FAMILLE_MULTI_CLIP_SLUGS.has(slug)) return null
  return [1, 2, 3].map((n) =>
    patapamAudioPublicUrl(`${FAMILLE_AUDIO_BASE}/${slug}${n}.m4a`),
  )
}

export function sharedYoungWordUrl(
  category: CategoryKey,
  slug: string,
  locale = 'fr',
): string {
  return patapamAudioPublicUrl(`shared/${locale}/vocab/young/${category}/${slug}.m4a`)
}

export function sharedYoungWhereisUrl(
  category: CategoryKey,
  slug: string,
  locale = 'fr',
): string {
  return patapamAudioPublicUrl(
    `shared/${locale}/vocab/young/${category}/whereis/whereis_${slug}.m4a`,
  )
}

function waitForSfxEnd(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    if (audio.ended) {
      resolve()
      return
    }
    const done = () => resolve()
    audio.addEventListener('ended', done, { once: true })
    audio.addEventListener('error', done, { once: true })
  })
}

type CartonPlaybackOptions = {
  isActive?: () => boolean
}

function shouldContinue(options?: CartonPlaybackOptions): boolean {
  return options?.isActive?.() ?? true
}

/** Mode « Apprendre » — enchaîne les clips famille ou joue un seul fichier. */
export async function playCartonLearnAudio(
  word: CardWord,
  category: CategoryKey,
  options?: CartonPlaybackOptions,
): Promise<void> {
  if (category === 'famille') {
    const urls = familleLearnAudioUrls(word.slug)
    if (!urls?.length) return
    for (const url of urls) {
      if (!shouldContinue(options)) return
      const audio = await playSfx(url)
      if (!shouldContinue(options)) return
      if (!audio) continue
      await waitForSfxEnd(audio)
    }
    return
  }

  if (!word.learnAudioUrl) return
  if (!shouldContinue(options)) return
  await playSfx(word.learnAudioUrl)
}

/** Mode « Chercher » — silence si fichier absent. */
export async function playCartonWhereisAudio(
  word: CardWord,
  category: CategoryKey,
  locale = 'fr',
  options?: CartonPlaybackOptions,
): Promise<void> {
  if (!shouldContinue(options)) return

  if (word.whereisUrl) {
    await playSfx(word.whereisUrl)
    return
  }

  if (category === 'famille') {
    await playSfx(
      patapamAudioPublicUrl(`${FAMILLE_AUDIO_BASE}/whereis/whereis_${word.slug}.m4a`),
    )
    return
  }

  await playSfx(sharedYoungWhereisUrl(category, word.slug, locale))
}
