-- ============================================================
-- Patapam — Schéma initial
-- ============================================================

-- --------------------------------------------------------
-- characters — Personnages du monde Patapam
-- --------------------------------------------------------
CREATE TABLE characters (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr      text NOT NULL,
  name_en      text NOT NULL,
  name_he      text NOT NULL,
  animal       text,
  type         text NOT NULL DEFAULT 'peluche', -- 'peluche' | 'humain'
  zone         text,            -- 'clearing'|'coast'|'mountain'|'forest'|'village'
  module_guide text,
  image_url    text
);
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON characters FOR SELECT USING (true);

-- Données initiales
INSERT INTO characters (name_fr, name_en, name_he, animal, type, zone, module_guide) VALUES
  ('Patapam',   'Patapam', 'פטפם',    'hippopotame', 'peluche', 'clearing',  null),
  ('Dauphinou', 'Dolphie', 'דולפינוש', 'dauphin',     'peluche', 'coast',     'languages'),
  ('Tartuffe',  'Tartuffe','טרטופי',   'ours',        'peluche', 'mountain',  'education'),
  ('Mollasson', 'Mellow',  'נמנומי',   'paresseux',   'peluche', 'forest',    'coding'),
  ('Bobby',     'Bobby',   'בובי',     'elephant',    'peluche', 'village',   'reading'),
  ('Betachou',  'Waffles', 'בטאצ''ו',  null,          'humain',  null,        'games');

-- --------------------------------------------------------
-- profiles — Profils enfants
-- --------------------------------------------------------
CREATE TABLE profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  birth_year      int,
  character_id    uuid REFERENCES characters(id) ON DELETE SET NULL,
  avatar_url      text,
  coins           int NOT NULL DEFAULT 0,
  play_days_total int NOT NULL DEFAULT 0,
  cabin_layout    jsonb NOT NULL DEFAULT '[]',
  garden_state    jsonb NOT NULL DEFAULT '{"stage": 0, "watered_at": null}',
  created_at      timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent_owns" ON profiles FOR ALL
  USING (parent_id = auth.uid());

-- --------------------------------------------------------
-- progress — Progression par niveau
-- --------------------------------------------------------
CREATE TABLE progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module       text NOT NULL,
  level_id     text NOT NULL,
  stars        int NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  completed_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, module, level_id)
);
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_owns" ON progress FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid()));

-- --------------------------------------------------------
-- inventory — Objets cabane possédés
-- --------------------------------------------------------
CREATE TABLE inventory (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id     text NOT NULL,
  quantity    int NOT NULL DEFAULT 1,
  acquired_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, item_id)
);
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_owns" ON inventory FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid()));

-- --------------------------------------------------------
-- card_collection — Album Panini
-- --------------------------------------------------------
CREATE TABLE card_collection (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id     text NOT NULL,
  quantity    int NOT NULL DEFAULT 1,
  acquired_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, card_id)
);
ALTER TABLE card_collection ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_owns" ON card_collection FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid()));

-- --------------------------------------------------------
-- words — Vocabulaire Doman
-- --------------------------------------------------------
CREATE TABLE words (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category     text NOT NULL,
  fr           text NOT NULL,
  en           text NOT NULL,
  he           text NOT NULL,
  image_url    text,
  audio_fr_url text,
  audio_en_url text,
  audio_he_url text
);
-- Lecture publique, pas de RLS restrictif
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON words FOR SELECT USING (true);

-- --------------------------------------------------------
-- stories — Histoires audio
-- --------------------------------------------------------
CREATE TABLE stories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title        text NOT NULL,
  language     text NOT NULL DEFAULT 'fr',
  text_content text NOT NULL,
  audio_url    text,
  characters   text[] DEFAULT '{}',
  child_name   text,
  is_template  boolean NOT NULL DEFAULT false,
  generated_at timestamptz DEFAULT now()
);
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_or_template" ON stories FOR SELECT
  USING (is_template = true OR
         profile_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid()));
CREATE POLICY "owner_insert" ON stories FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE parent_id = auth.uid()));

-- --------------------------------------------------------
-- story_nodes — Arbre de choix Lunii
-- --------------------------------------------------------
CREATE TABLE story_nodes (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character text NOT NULL,
  location  text NOT NULL,
  theme     text NOT NULL,
  language  text NOT NULL DEFAULT 'fr',
  story_id  uuid REFERENCES stories(id) ON DELETE SET NULL,
  UNIQUE (character, location, theme, language)
);
ALTER TABLE story_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON story_nodes FOR SELECT USING (true);
