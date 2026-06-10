-- ============================================================
-- Bibliothèque cartons Doman — catalogue + audio Storage
-- ============================================================
--
-- Remplace progressivement src/data/cartons.ts et la table words (legacy).
--
-- Buckets (déjà créés dans 20260606_patapam_audio.sql) :
--   patapam-audio  (public)  — vocabulaire générique
--   patapam-voice  (privé)   — papa / maman / prénoms par famille
--
-- Chemins Storage recommandés :
--   patapam-audio :
--     shared/{locale}/vocab/young/{category}/{slug}.m4a
--     shared/{locale}/vocab/young/{category}/whereis/whereis_{slug}.m4a
--   patapam-voice :
--     {parent_uuid}/vocab/{locale}/famille/papa.m4a
--     {parent_uuid}/vocab/{locale}/famille/maman.m4a
--     {parent_uuid}/vocab/{locale}/famille/{profile_slug}.m4a
--
-- slot_type :
--   shared  — même audio pour tout le monde (corps, animaux, …)
--   family  — audio par parent (papa, maman)
--   profile — audio par profil enfant (prénom depuis profiles)
--
-- Après migration :
--   1. Uploader les M4A dans les buckets
--   2. Exécuter supabase/scripts/add_carton_word.template.sql par mot
--
-- Format audio : M4A (AAC), mono, 96 kbps, -movflags +faststart

-- --------------------------------------------------------
-- carton_words — catalogue (métadonnées affichage)
-- id stable : {category}_{slug}  ex. corps_tete, famille_papa
-- --------------------------------------------------------
CREATE TABLE carton_words (
  id           text PRIMARY KEY,
  category     text NOT NULL CHECK (category IN ('famille', 'corps', 'animaux', 'jouets', 'nourriture')),
  slot_type    text NOT NULL CHECK (slot_type IN ('shared', 'family', 'profile')),
  label_fr     text NOT NULL,
  label_en     text NOT NULL,
  label_he     text NOT NULL,
  slug         text NOT NULL,
  age_group    text NOT NULL DEFAULT 'young' CHECK (age_group IN ('young', 'older')),
  sort_order   int NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX carton_words_category_age_idx
  ON carton_words (category, age_group, sort_order)
  WHERE is_active = true;

ALTER TABLE carton_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carton_words_public_read"
ON carton_words FOR SELECT
USING (is_active = true);

-- --------------------------------------------------------
-- carton_word_audio — fichiers audio (1+ lignes par mot / locale)
-- audio_kind : word | whereis  (mode « Chercher »)
-- parent_id NULL + profile_id NULL → patapam-audio (shared)
-- parent_id set  + profile_id NULL → patapam-voice (papa, maman)
-- parent_id set  + profile_id set  → patapam-voice (prénom enfant)
-- --------------------------------------------------------
CREATE TABLE carton_word_audio (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id           text NOT NULL REFERENCES carton_words(id) ON DELETE CASCADE,
  locale            text NOT NULL CHECK (locale IN ('fr', 'en', 'he')),
  audio_kind        text NOT NULL DEFAULT 'word'
                    CHECK (audio_kind IN ('word', 'whereis')),
  storage_bucket    text NOT NULL CHECK (storage_bucket IN ('patapam-audio', 'patapam-voice')),
  storage_path      text NOT NULL,
  parent_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id        uuid REFERENCES profiles(id) ON DELETE CASCADE,
  voice_profile_id  uuid REFERENCES voice_profiles(id) ON DELETE SET NULL,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now(),
  CONSTRAINT carton_word_audio_profile_requires_parent
    CHECK (profile_id IS NULL OR parent_id IS NOT NULL),
  CONSTRAINT carton_word_audio_bucket_scope CHECK (
    (storage_bucket = 'patapam-audio' AND parent_id IS NULL AND profile_id IS NULL)
    OR (storage_bucket = 'patapam-voice' AND parent_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX carton_word_audio_shared_unique
  ON carton_word_audio (word_id, locale, audio_kind)
  WHERE parent_id IS NULL AND profile_id IS NULL;

CREATE UNIQUE INDEX carton_word_audio_family_unique
  ON carton_word_audio (word_id, locale, audio_kind, parent_id)
  WHERE parent_id IS NOT NULL AND profile_id IS NULL;

CREATE UNIQUE INDEX carton_word_audio_profile_unique
  ON carton_word_audio (word_id, locale, audio_kind, profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX carton_word_audio_word_locale_idx
  ON carton_word_audio (word_id, locale)
  WHERE is_active = true;

ALTER TABLE carton_word_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carton_word_audio_shared_read"
ON carton_word_audio FOR SELECT
USING (
  is_active = true
  AND parent_id IS NULL
  AND profile_id IS NULL
);

CREATE POLICY "carton_word_audio_owner_read"
ON carton_word_audio FOR SELECT
TO authenticated
USING (
  is_active = true
  AND parent_id = auth.uid()
);

CREATE POLICY "carton_word_audio_owner_insert"
ON carton_word_audio FOR INSERT
TO authenticated
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "carton_word_audio_owner_update"
ON carton_word_audio FOR UPDATE
TO authenticated
USING (parent_id = auth.uid());

CREATE POLICY "carton_word_audio_owner_delete"
ON carton_word_audio FOR DELETE
TO authenticated
USING (parent_id = auth.uid());

-- --------------------------------------------------------
-- Seed — catalogue jeune (sans prénoms : viennent des profiles)
-- Les lignes audio s'ajoutent via add_carton_word.template.sql
-- --------------------------------------------------------
INSERT INTO carton_words (id, category, slot_type, label_fr, label_en, label_he, slug, age_group, sort_order) VALUES
  ('famille_papa',  'famille', 'family',  'papa',         'Papa',         'אבא',       'papa',         'young', 1),
  ('famille_maman', 'famille', 'family',  'maman',        'Maman',        'אמא',       'maman',        'young', 2),

  ('corps_tete',      'corps', 'shared', 'tête',       'Head',         'ראש',       'tete',         'young', 1),
  ('corps_main',      'corps', 'shared', 'main',       'Hand',         'יד',        'main',         'young', 2),
  ('corps_pied',      'corps', 'shared', 'pied',       'Foot',         'רגל',       'pied',         'young', 3),
  ('corps_oreilles',  'corps', 'shared', 'oreilles',   'Ears',         'אוזניים',   'oreilles',     'young', 4),
  ('corps_bouche',    'corps', 'shared', 'bouche',     'Mouth',        'פה',        'bouche',       'young', 5),

  ('animaux_lion',         'animaux', 'shared', 'lion',         'Lion',         'אריה',       'lion',         'young', 1),
  ('animaux_tigre',        'animaux', 'shared', 'tigre',        'Tiger',        'נמר',        'tigre',        'young', 2),
  ('animaux_vache',        'animaux', 'shared', 'vache',        'Cow',          'פרה',        'vache',        'young', 3),
  ('animaux_tortue',       'animaux', 'shared', 'tortue',       'Turtle',       'צב',         'tortue',       'young', 4),
  ('animaux_hippopotame',  'animaux', 'shared', 'hippopotame',  'Hippopotamus', 'היפופוטם',  'hippopotame',  'young', 5),

  ('jouets_ballon',   'jouets', 'shared', 'Ballon',  'Ball',    'כדור',      'ballon',   'young', 1),
  ('jouets_voiture',  'jouets', 'shared', 'Voiture', 'Car',     'מכונית',    'voiture',  'young', 2),
  ('jouets_robot',    'jouets', 'shared', 'Robot',   'Robot',   'רובוט',     'robot',    'young', 3),
  ('jouets_peluche',  'jouets', 'shared', 'Peluche', 'Plushie', 'בובה רכה',  'peluche',  'young', 4),
  ('jouets_cubes',    'jouets', 'shared', 'Cubes',   'Blocks',  'קוביות',    'cubes',    'young', 5),

  ('nourriture_compote',  'nourriture', 'shared', 'Compote', 'Compote', 'קומפוט', 'compote',  'young', 1),
  ('nourriture_gateau',   'nourriture', 'shared', 'Gâteau',  'Cake',    'עוגה',   'gateau',   'young', 2),
  ('nourriture_banane',   'nourriture', 'shared', 'Banane',  'Banana',  'בננה',   'banane',   'young', 3),
  ('nourriture_pomme',    'nourriture', 'shared', 'Pomme',   'Apple',   'תפוח',   'pomme',    'young', 4),
  ('nourriture_carotte',  'nourriture', 'shared', 'Carotte', 'Carrot',  'גזר',    'carotte',  'young', 5)
ON CONFLICT (id) DO UPDATE SET
  category   = EXCLUDED.category,
  slot_type  = EXCLUDED.slot_type,
  label_fr   = EXCLUDED.label_fr,
  label_en   = EXCLUDED.label_en,
  label_he   = EXCLUDED.label_he,
  slug       = EXCLUDED.slug,
  age_group  = EXCLUDED.age_group,
  sort_order = EXCLUDED.sort_order,
  is_active  = true;
