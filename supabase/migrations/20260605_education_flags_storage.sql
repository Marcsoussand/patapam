-- ============================================================
-- Jeu des drapeaux — catalogue + Storage
-- ============================================================
--
-- SETUP Storage (après migration) :
-- 1. Bucket « education-flags » (public) — créé ci-dessous
-- 2. Uploader les SVG à la racine du bucket : fr.svg, de.svg, … (20 fichiers)
-- 3. (Plus tard) Audio : audio/fr/fr.mp3, audio/en/us.mp3, …
--
-- SOURCE RECOMMANDÉE DES DRAPEAUX (licence MIT, usage commercial OK) :
--   https://github.com/lipis/flag-icons
--   Fichiers SVG : node_modules/flag-icons/flags/4x3/{code}.svg
--   → copier tel quel depuis node_modules/flag-icons/flags/4x3/{code}.svg
--   Ne pas hotlinker : copier une fois dans ton bucket Supabase.
--
-- Panel « starter_20 » — 20 pays :
--   fr il us gb de es it ca lb ch pt nl gr tr ma sa br jp au mx

-- Bucket public — drapeaux + audio (sous-dossiers flags/ et audio/)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'education-flags',
  'education-flags',
  true,
  5242880,
  ARRAY['image/png', 'image/webp', 'image/svg+xml', 'audio/mpeg', 'audio/mp4', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "education_flags_storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'education-flags');

CREATE POLICY "education_flags_storage_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'education-flags');

CREATE POLICY "education_flags_storage_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'education-flags');

CREATE POLICY "education_flags_storage_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'education-flags');

-- --------------------------------------------------------
-- flag_countries — catalogue pays (fichiers dans Storage)
-- id = code ISO 3166-1 alpha-2 (minuscules)
-- --------------------------------------------------------
CREATE TABLE flag_countries (
  id              text PRIMARY KEY,
  name_fr         text NOT NULL,
  name_en         text NOT NULL,
  name_he         text NOT NULL,
  storage_path    text NOT NULL,
  audio_path_fr   text,
  audio_path_en   text,
  audio_path_he   text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE flag_countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flag_countries_public_read"
ON flag_countries FOR SELECT
USING (is_active = true);

-- --------------------------------------------------------
-- flag_panels — panel restreint (ex. 20 pays, 2 choix au départ)
-- --------------------------------------------------------
CREATE TABLE flag_panels (
  id              text PRIMARY KEY,
  name_fr         text NOT NULL,
  name_en         text NOT NULL,
  name_he         text NOT NULL,
  choice_count    smallint NOT NULL DEFAULT 2
                  CHECK (choice_count BETWEEN 2 AND 6),
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE flag_panels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flag_panels_public_read"
ON flag_panels FOR SELECT
USING (is_active = true);

-- --------------------------------------------------------
-- flag_panel_countries — pays d'un panel
-- --------------------------------------------------------
CREATE TABLE flag_panel_countries (
  panel_id        text NOT NULL REFERENCES flag_panels(id) ON DELETE CASCADE,
  country_id      text NOT NULL REFERENCES flag_countries(id) ON DELETE RESTRICT,
  sort_order      int NOT NULL DEFAULT 0,
  PRIMARY KEY (panel_id, country_id)
);

ALTER TABLE flag_panel_countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flag_panel_countries_public_read"
ON flag_panel_countries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM flag_panels p
    WHERE p.id = panel_id AND p.is_active = true
  )
);

-- --------------------------------------------------------
-- Seed — panel starter_20 + 20 pays
-- --------------------------------------------------------
INSERT INTO flag_panels (id, name_fr, name_en, name_he, choice_count) VALUES (
  'starter_20',
  'Drapeaux — découverte (20 pays)',
  'Flags — starter (20 countries)',
  'דגלים — התחלה (20 מדינות)',
  2
)
ON CONFLICT (id) DO UPDATE SET
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  name_he = EXCLUDED.name_he,
  choice_count = EXCLUDED.choice_count;

INSERT INTO flag_countries (
  id, name_fr, name_en, name_he, storage_path
) VALUES
  ('fr', 'France',          'France',        'צרפת',           'fr.svg'),
  ('il', 'Israël',          'Israel',        'ישראל',          'il.svg'),
  ('us', 'États-Unis',      'United States', 'ארצות הברית',    'us.svg'),
  ('gb', 'Royaume-Uni',     'United Kingdom','בריטניה',        'gb.svg'),
  ('de', 'Allemagne',       'Germany',       'גרמניה',         'de.svg'),
  ('es', 'Espagne',         'Spain',         'ספרד',           'es.svg'),
  ('it', 'Italie',          'Italy',         'איטליה',         'it.svg'),
  ('ca', 'Canada',          'Canada',        'קנדה',           'ca.svg'),
  ('lb', 'Liban',           'Lebanon',       'לבנון',          'lb.svg'),
  ('ch', 'Suisse',          'Switzerland',   'שווייץ',         'ch.svg'),
  ('pt', 'Portugal',        'Portugal',      'פורטוגל',        'pt.svg'),
  ('nl', 'Pays-Bas',        'Netherlands',   'הולנד',          'nl.svg'),
  ('gr', 'Grèce',           'Greece',        'יוון',           'gr.svg'),
  ('tr', 'Turquie',         'Turkey',        'טורקיה',         'tr.svg'),
  ('ma', 'Maroc',           'Morocco',       'מרוקו',          'ma.svg'),
  ('sa', 'Arabie saoudite', 'Saudi Arabia',  'ערב הסעודית',    'sa.svg'),
  ('br', 'Brésil',          'Brazil',        'ברזיל',          'br.svg'),
  ('jp', 'Japon',           'Japan',         'יפן',            'jp.svg'),
  ('au', 'Australie',       'Australia',     'אוסטרליה',       'au.svg'),
  ('mx', 'Mexique',         'Mexico',        'מקסיקו',         'mx.svg')
ON CONFLICT (id) DO UPDATE SET
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  name_he = EXCLUDED.name_he,
  storage_path = EXCLUDED.storage_path;

INSERT INTO flag_panel_countries (panel_id, country_id, sort_order) VALUES
  ('starter_20', 'fr', 1),
  ('starter_20', 'il', 2),
  ('starter_20', 'us', 3),
  ('starter_20', 'gb', 4),
  ('starter_20', 'de', 5),
  ('starter_20', 'es', 6),
  ('starter_20', 'it', 7),
  ('starter_20', 'ca', 8),
  ('starter_20', 'lb', 9),
  ('starter_20', 'ch', 10),
  ('starter_20', 'pt', 11),
  ('starter_20', 'nl', 12),
  ('starter_20', 'gr', 13),
  ('starter_20', 'tr', 14),
  ('starter_20', 'ma', 15),
  ('starter_20', 'sa', 16),
  ('starter_20', 'br', 17),
  ('starter_20', 'jp', 18),
  ('starter_20', 'au', 19),
  ('starter_20', 'mx', 20)
ON CONFLICT (panel_id, country_id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order;
