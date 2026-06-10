/** Articles FR par défaut (si colonne DB absente ou non migrée) */
export const DEFAULT_ARTICLE_FR: Record<string, string> = {
  fr: 'de la ',
  il: "d'",
  us: 'des ',
  gb: 'du ',
  de: "de l'",
  es: "de l'",
  it: "de l'",
  ca: 'du ',
  lb: 'du ',
  ch: 'de la ',
  pt: 'du ',
  nl: 'des ',
  gr: 'de la ',
  tr: 'de la ',
  ma: 'du ',
  sa: "de l'",
  br: 'du ',
  jp: 'du ',
  au: "de l'",
  mx: 'du ',
}

export function resolveArticleFr(countryId: string, fromDb?: string | null): string {
  if (fromDb && fromDb.trim().length > 0) return fromDb
  return DEFAULT_ARTICLE_FR[countryId] ?? 'de '
}
