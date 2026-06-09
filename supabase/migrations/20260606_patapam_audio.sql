-- ============================================================
-- Audio Patapam — catalogue + Storage
-- ============================================================
--
-- Buckets :
--   patapam-audio  (public)  — voix officielle, shared/{locale}/…
--   patapam-voice  (privé)   — clones vocaux parent (plus tard)
--
-- SETUP Storage (après migration) :
-- 1. Bucket « patapam-audio » créé ci-dessous
-- 2. Uploader les M4A, ex. :
--      shared/fr/congrats/bravo1.m4a … genial2.m4a (12 fichiers)
--      shared/fr/encouragements/rejoue.m4a
--      shared/fr/encouragements/retente-ta-chance.m4a
--      shared/fr/encouragements/tu-peux-mieux-faire.m4a
--      shared/fr/encouragements/tu-vas-y-arriver.m4a
--      shared/fr/math/prompts/plus-grand.m4a
--      shared/fr/math/prompts/plus-petit.m4a
-- 3. (Plus tard) patapam-voice/{parent_uuid}/{voice_profile_uuid}/fr/…
--
-- Format recommandé : M4A (AAC), mono, 96 kbps, -movflags +faststart

-- --------------------------------------------------------
-- patapam-audio — voix officielle (public)
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patapam-audio',
  'patapam-audio',
  true,
  5242880,
  ARRAY['audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/mpeg', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "patapam_audio_storage_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patapam-audio');

CREATE POLICY "patapam_audio_storage_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patapam-audio');

CREATE POLICY "patapam_audio_storage_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patapam-audio');

CREATE POLICY "patapam_audio_storage_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patapam-audio');

-- --------------------------------------------------------
-- patapam-voice — clones vocaux parent (privé, usage futur)
-- Chemin : {parent_id}/{voice_profile_id}/{locale}/…
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patapam-voice',
  'patapam-voice',
  false,
  10485760,
  ARRAY['audio/mp4', 'audio/x-m4a', 'audio/m4a', 'audio/mpeg', 'audio/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "patapam_voice_storage_owner_read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'patapam-voice'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "patapam_voice_storage_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patapam-voice'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "patapam_voice_storage_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patapam-voice'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "patapam_voice_storage_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patapam-voice'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- --------------------------------------------------------
-- voice_profiles — profil voix clonée (futur)
-- --------------------------------------------------------
CREATE TABLE voice_profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       text NOT NULL DEFAULT 'Ma voix',
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'ready', 'failed')),
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_profiles_owner_read"
ON voice_profiles FOR SELECT
TO authenticated
USING (parent_id = auth.uid());

CREATE POLICY "voice_profiles_owner_insert"
ON voice_profiles FOR INSERT
TO authenticated
WITH CHECK (parent_id = auth.uid());

CREATE POLICY "voice_profiles_owner_update"
ON voice_profiles FOR UPDATE
TO authenticated
USING (parent_id = auth.uid());

CREATE POLICY "voice_profiles_owner_delete"
ON voice_profiles FOR DELETE
TO authenticated
USING (parent_id = auth.uid());

-- --------------------------------------------------------
-- audio_clips — catalogue audio (voix officielle + clones)
-- clip_key : identifiant stable unique par locale ('bravo1', 'alouf2', 'plus_grand')
--            → plusieurs variantes = plusieurs clip_key (bravo1, bravo2, …)
-- category : congrats | encouragement | math_prompt | math_number_unit | …
-- --------------------------------------------------------
CREATE TABLE audio_clips (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_key          text NOT NULL,
  category          text NOT NULL,
  locale            text NOT NULL CHECK (locale IN ('fr', 'en', 'he')),
  label             text NOT NULL,
  storage_path      text NOT NULL,
  voice_profile_id  uuid REFERENCES voice_profiles(id) ON DELETE CASCADE,
  sort_order        int NOT NULL DEFAULT 0,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX audio_clips_default_voice_unique
  ON audio_clips (clip_key, locale)
  WHERE voice_profile_id IS NULL;

CREATE UNIQUE INDEX audio_clips_cloned_voice_unique
  ON audio_clips (clip_key, locale, voice_profile_id)
  WHERE voice_profile_id IS NOT NULL;

CREATE INDEX audio_clips_category_locale_idx
  ON audio_clips (category, locale)
  WHERE is_active = true AND voice_profile_id IS NULL;

ALTER TABLE audio_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audio_clips_public_read"
ON audio_clips FOR SELECT
USING (
  is_active = true
  AND voice_profile_id IS NULL
);

CREATE POLICY "audio_clips_owner_read_cloned"
ON audio_clips FOR SELECT
TO authenticated
USING (
  voice_profile_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM voice_profiles vp
    WHERE vp.id = voice_profile_id AND vp.parent_id = auth.uid()
  )
);

-- --------------------------------------------------------
-- Seed — félicitations FR (12), encouragements, consignes
-- --------------------------------------------------------
INSERT INTO audio_clips (clip_key, category, locale, label, storage_path, sort_order) VALUES
  ('bravo1',     'congrats', 'fr', 'Bravo !',       'shared/fr/congrats/bravo1.m4a',     1),
  ('bravo2',     'congrats', 'fr', 'Bravo !',       'shared/fr/congrats/bravo2.m4a',     2),
  ('bravo3',     'congrats', 'fr', 'Bravo !',       'shared/fr/congrats/bravo3.m4a',     3),
  ('bravo4',     'congrats', 'fr', 'Bravo !',       'shared/fr/congrats/bravo4.m4a',     4),
  ('super1',     'congrats', 'fr', 'Super !',       'shared/fr/congrats/super1.m4a',     5),
  ('super2',     'congrats', 'fr', 'Super !',       'shared/fr/congrats/super2.m4a',     6),
  ('super3',     'congrats', 'fr', 'Super !',       'shared/fr/congrats/super3.m4a',     7),
  ('magnifique', 'congrats', 'fr', 'Magnifique !',  'shared/fr/congrats/magnifique.m4a', 8),
  ('champion1',  'congrats', 'fr', 'Champion !',    'shared/fr/congrats/champion1.m4a',  9),
  ('champion2',  'congrats', 'fr', 'Champion !',    'shared/fr/congrats/champion2.m4a', 10),
  ('genial1',    'congrats', 'fr', 'Génial !',      'shared/fr/congrats/genial1.m4a',   11),
  ('genial2',    'congrats', 'fr', 'Génial !',      'shared/fr/congrats/genial2.m4a',   12),

  ('bravo',    'congrats',    'en', 'Well done!',           'shared/en/congrats/bravo.m4a',    1),
  ('champion', 'congrats',    'en', 'Champion!',            'shared/en/congrats/champion.m4a', 2),
  ('kolhakavod1', 'congrats', 'he', 'כל הכבוד!',            'shared/he/congrats/kolhakavod1.m4a', 1),
  ('alouf1',   'congrats',    'he', 'אלוף!',                'shared/he/congrats/alouf1.m4a', 2),
  ('alouf2',   'congrats',    'he', 'אלוף!',                'shared/he/congrats/alouf2.m4a', 3),
  ('meoule1',  'congrats',    'he', 'מעולה!',               'shared/he/congrats/meoule1.m4a', 4),

  ('continue1', 'encouragement', 'fr', 'Continue !',
   'shared/fr/encouragements/continue1.m4a', 1),
  ('continue2', 'encouragement', 'fr', 'Continue !',
   'shared/fr/encouragements/continue2.m4a', 2),
  ('retente1',  'encouragement', 'fr', 'Retente ta chance !',
   'shared/fr/encouragements/retente1.m4a', 3),
  ('mieux_faire', 'encouragement', 'fr', 'Tu peux mieux faire !',
   'shared/fr/encouragements/tu-peux-mieux-faire.m4a', 4),
  ('encore_un_effort1', 'encouragement', 'fr', 'Encore un effort !',
   'shared/fr/encouragements/encore-un-effort1.m4a', 5),
  ('encore_un_effort2', 'encouragement', 'fr', 'Encore un effort !',
   'shared/fr/encouragements/encore-un-effort2.m4a', 6),
  ('encore_un_effort3', 'encouragement', 'fr', 'Encore un effort !',
   'shared/fr/encouragements/encore-un-effort3.m4a', 7),

  ('rejoue',      'encouragement', 'en', 'Try again!',
   'shared/en/encouragements/try-again.m4a', 1),
  ('retente',     'encouragement', 'en', 'Give it another go!',
   'shared/en/encouragements/give-it-another-go.m4a', 2),
  ('mieux_faire', 'encouragement', 'en', 'You can do better!',
   'shared/en/encouragements/you-can-do-better.m4a', 3),
  ('vas_y_arriver', 'encouragement', 'en', 'You''ll get there!',
   'shared/en/encouragements/you-will-get-there.m4a', 4),

  ('rejoue',      'encouragement', 'he', 'נסה שוב!',
   'shared/he/encouragements/try-again.m4a', 1),
  ('retente',     'encouragement', 'he', 'נסה שוב, אתה יכול!',
   'shared/he/encouragements/give-it-another-go.m4a', 2),
  ('mieux_faire', 'encouragement', 'he', 'אתה יכול לעשות יותר טוב!',
   'shared/he/encouragements/you-can-do-better.m4a', 3),
  ('vas_y_arriver', 'encouragement', 'he', 'אתה תצליח!',
   'shared/he/encouragements/you-will-get-there.m4a', 4),

  ('plus_grand', 'math_prompt', 'fr', 'Quel est le plus grand nombre ?',
   'shared/fr/math/prompts/plus-grand.m4a', 1),
  ('plus_petit', 'math_prompt', 'fr', 'Quel est le plus petit nombre ?',
   'shared/fr/math/prompts/plus-petit.m4a', 2),
  ('plus_grand', 'math_prompt', 'en', 'Which is the largest number?',
   'shared/en/math/prompts/plus-grand.m4a', 1),
  ('plus_petit', 'math_prompt', 'en', 'Which is the smallest number?',
   'shared/en/math/prompts/plus-petit.m4a', 2),
  ('plus_grand', 'math_prompt', 'he', 'מה המספר הגדול יותר?',
   'shared/he/math/prompts/plus-grand.m4a', 1),
  ('plus_petit', 'math_prompt', 'he', 'מה המספר הקטן יותר?',
   'shared/he/math/prompts/plus-petit.m4a', 2),

  ('quel_drapeau', 'flags_prompt', 'fr', 'Quel est le drapeau de…',
   'shared/fr/flags/prompts/quel-est-le-drapeau.m4a', 1),
  ('quel_drapeau', 'flags_prompt', 'en', 'Which is the flag of…',
   'shared/en/flags/prompts/which-is-the-flag.m4a', 1),
  ('quel_drapeau', 'flags_prompt', 'he', 'מה הדגל של…',
   'shared/he/flags/prompts/what-is-the-flag.m4a', 1)
ON CONFLICT (clip_key, locale) WHERE voice_profile_id IS NULL DO UPDATE SET
  category = EXCLUDED.category,
  label = EXCLUDED.label,
  storage_path = EXCLUDED.storage_path,
  sort_order = EXCLUDED.sort_order,
  is_active = true;
