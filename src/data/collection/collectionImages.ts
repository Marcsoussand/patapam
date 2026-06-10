import patapamImg from '../../img/patapam_debout.png'
import betachouImg from '../../img/betachou.png'
import bobbyImg from '../../img/bobby.png'
import tartuffeImg from '../../img/tartuffe.png'
import mollassonImg from '../../img/mollasson.png'
import dauphinouImg from '../../img/dauphinou.png'
import lapinouImg from '../../img/lapinou.png'

/** Personnages de base (src/img) — les 8 communes */
const COMMON_SRC: Record<string, string> = {
  patapam: patapamImg,
  tartuffe: tartuffeImg,
  bobby: bobbyImg,
  betachou: betachouImg,
  mollasson: mollassonImg,
  lapinou: lapinouImg,
  dauphinou: dauphinouImg,
}

const COLLECTION_GLOB = import.meta.glob<string>(
  '../../img/patapam_collection/*.{png,jpg,jpeg,webp}',
  { eager: true, import: 'default' },
)

function normalizeSlug(filename: string): string {
  return filename
    .replace(/\.[^.]+$/i, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
}

const collectionBySlug = new Map<string, string>()
for (const path of Object.keys(COLLECTION_GLOB)) {
  const file = path.split('/').pop() ?? path
  collectionBySlug.set(normalizeSlug(file), COLLECTION_GLOB[path])
}

/** Résout une image par slug — tolère les renommages via glob normalisé */
export function resolveCollectionImage(slug: string): string | undefined {
  if (COMMON_SRC[slug]) return COMMON_SRC[slug]
  if (slug === 'mini_patapam') return collectionBySlug.get('mini_patapam')
  return collectionBySlug.get(slug.toLowerCase())
}

export function registerCollectionSlug(slug: string, url: string): void {
  collectionBySlug.set(slug.toLowerCase(), url)
}
