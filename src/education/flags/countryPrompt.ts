import type { FlagCountry } from '../../types/flags'

/** Libellé complet pour la consigne FR : « du Mexique », « de l'Italie »… */
export function countryPromptFr(country: FlagCountry): string {
  return `${country.article_fr}${country.name_fr}`
}
