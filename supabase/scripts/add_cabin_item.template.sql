-- ============================================================
-- Ajouter UN objet au catalogue cabane
-- ============================================================
--
-- À faire pour chaque nouvel objet (dans cet ordre logique) :
--
-- 1. Storage (Dashboard Supabase)
--    → bucket « cabin-items » → uploader l'image
--    → ex. mon_objet.png (nom = storage_path ci-dessous)
--
-- 2. Catalogue (ce fichier, SQL Editor ou nouvelle migration)
--    → INSERT INTO cabin_items ...
--
-- 3. Donner l'objet à un joueur (test ou récompense de jeu)
--    → INSERT INTO inventory ...
--
-- Pas besoin de toucher au code React : le jeu lit cabin_items + inventory.
-- Pas besoin de refaire 20260604_cabin_items_storage.sql (infra une seule fois).
--
-- Pour versionner : copier ce fichier vers
--   supabase/migrations/YYYYMMDD_cabin_item_<id>.sql
-- puis supabase db push (ou SQL Editor en prod).

INSERT INTO cabin_items (
  id,
  name_fr,
  name_en,
  name_he,
  storage_path,
  width_pct,
  height_pct,
  floors,
  sort_order,
  is_active,
  price_coins
) VALUES (
  'mon_objet',           -- id unique (snake_case, = clé inventaire)
  'Mon objet',           -- nom affiché FR
  'My item',             -- nom EN
  'הפריט שלי',           -- nom HE
  'mon_objet.png',       -- fichier dans bucket cabin-items
  10,                    -- largeur % scène (ajuster après test visuel)
  12,                    -- hauteur % scène
  ARRAY[1, 2],           -- étages autorisés : 1, 2 ou les deux
  10,                    -- ordre dans le sac (croissant)
  true,
  15                     -- prix marché en pièces (0 = pas au marché)
)
ON CONFLICT (id) DO UPDATE SET
  name_fr      = EXCLUDED.name_fr,
  name_en      = EXCLUDED.name_en,
  name_he      = EXCLUDED.name_he,
  storage_path = EXCLUDED.storage_path,
  width_pct    = EXCLUDED.width_pct,
  height_pct   = EXCLUDED.height_pct,
  floors       = EXCLUDED.floors,
  sort_order   = EXCLUDED.sort_order,
  is_active    = EXCLUDED.is_active,
  price_coins  = EXCLUDED.price_coins;

-- Test : offrir l'objet à un profil (remplacer l'UUID)
-- INSERT INTO inventory (profile_id, item_id, quantity)
-- VALUES ('<uuid-profil>', 'mon_objet', 1)
-- ON CONFLICT (profile_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;
