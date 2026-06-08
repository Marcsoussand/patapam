-- ============================================================
-- Cabane — catalogue d'objets + Storage
-- ============================================================
--
-- TEST (une fois la migration appliquée) :
-- 1. Dashboard Supabase → Storage → bucket « cabin-items » (public)
-- 2. Uploader une image : test_lantern.png
-- 3. Ouvrir la cabane en jeu : la lanterne test est offerte au 1er passage
--    (ou manuellement) :
--    INSERT INTO inventory (profile_id, item_id, quantity)
--    VALUES ('<uuid-profil>', 'test_lantern', 1)
--      ON CONFLICT (profile_id, item_id) DO UPDATE SET quantity = 1;

-- Bucket public pour les sprites d'objets cabane
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cabin-items',
  'cabin-items',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lecture publique des objets cabane
CREATE POLICY "cabin_items_storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cabin-items');

-- Upload réservé aux utilisateurs authentifiés (dashboard / scripts)
CREATE POLICY "cabin_items_storage_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cabin-items');

CREATE POLICY "cabin_items_storage_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cabin-items');

CREATE POLICY "cabin_items_storage_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cabin-items');

-- --------------------------------------------------------
-- cabin_items — catalogue (métadonnées ; fichier dans Storage)
-- --------------------------------------------------------
CREATE TABLE cabin_items (
  id            text PRIMARY KEY,
  name_fr       text NOT NULL,
  name_en       text NOT NULL,
  name_he       text NOT NULL,
  storage_path  text NOT NULL,
  width_pct     smallint NOT NULL DEFAULT 10
                CHECK (width_pct BETWEEN 1 AND 50),
  height_pct    smallint NOT NULL DEFAULT 10
                CHECK (height_pct BETWEEN 1 AND 50),
  floors        smallint[] NOT NULL DEFAULT ARRAY[1, 2],
  sort_order    int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE cabin_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cabin_items_public_read"
ON cabin_items FOR SELECT
USING (is_active = true);

-- Objet de test (image : cabin-items/test_lantern.png dans Storage)
INSERT INTO cabin_items (
  id, name_fr, name_en, name_he, storage_path, width_pct, height_pct, floors, sort_order
) VALUES (
  'test_lantern',
  'Lanterne',
  'Lantern',
  'פנס',
  'test_lantern.png',
  9,
  14,
  ARRAY[1, 2],
  0
);

-- Lien inventaire → catalogue
ALTER TABLE inventory
  ADD CONSTRAINT inventory_cabin_item_fkey
  FOREIGN KEY (item_id) REFERENCES cabin_items(id) ON DELETE RESTRICT;
