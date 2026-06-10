/**
 * Disposition album — 4 emplacements par page.
 * null = slot réservé (placeholder visuel, pas de carte à collecter).
 *
 * Les pages rare / super rare / épique partagent la même grille ;
 * seule la rareté (cadre CSS) change.
 */

/** 6 pages × 4 — héros de base + toutes les versions Patapam (cadre basique) */
export const COMMON_PAGE_SLOTS: (string | null)[][] = [
  ['patapam', 'tartuffe', 'bobby', 'betachou'],
  ['mollasson', 'lapinou', 'dauphinou', 'mini_patapam'],
  ['patapam_explorateur', 'patapam_cowboy', 'patapam_indien', 'patapam_pirate'],
  ['patapam_pharaon', 'patapam_grec', 'patapam_chevalier', 'patapam_romain'],
  ['patapam_policier', 'patapam_pompier', 'patapam_pilote', 'patapam_courses'],
  ['patapam_footballeur', 'patapam_rugbyman', 'patapam_jardinier', null],
]

/** 9 pages × 4 — images patapam_collection (×3 raretés) */
export const COLLECTIBLE_PAGE_SLOTS: (string | null)[][] = [
  ['tartuffe_cowboy', 'tartuffe_explorateur', 'tartuffe_pirate', 'tartuffe_scribe'],
  ['bobby_chevalier', 'bobby_egyptien', 'bobby_pirate', 'bobby_sorcier'],
  ['mollasson_indien', 'mollasson_pirate', null, null],
  ['dartagnan_le_cheval_blanc', 'ouistiti_le_cheval_gris', 'patapon_le_cheval_marron', 'gascar_le_cheval_noir'],
  ['rene_le_poney', 'betachou_night', null, null],
  ['patapam_explorateur', 'patapam_cowboy', 'patapam_indien', 'patapam_pirate'],
  ['patapam_pharaon', 'patapam_grec', 'patapam_chevalier', 'patapam_romain'],
  ['patapam_policier', 'patapam_pompier', 'patapam_pilote', 'patapam_courses'],
  ['patapam_footballeur', 'patapam_rugbyman', 'patapam_jardinier', null],
]

export const COLLECTIBLE_RARITIES = ['rare', 'super_rare', 'epic'] as const
