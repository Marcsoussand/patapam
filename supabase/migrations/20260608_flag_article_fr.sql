-- ============================================================
-- Drapeaux — article français (de la / du / de l' / des / d')
-- ============================================================
--
-- Utilisé dans la consigne : « Quel est le drapeau {article_fr}{name_fr} ? »
-- ex. du Mexique, de l'Italie, d'Israël, des États-Unis

ALTER TABLE flag_countries
  ADD COLUMN IF NOT EXISTS article_fr text NOT NULL DEFAULT 'de ';

COMMENT ON COLUMN flag_countries.article_fr IS
  'Préposition + article elided si besoin : de la , du , de l'', des , d''';

UPDATE flag_countries SET article_fr = v.article
FROM (VALUES
  ('fr', 'de la '),
  ('il', 'd'''),
  ('us', 'des '),
  ('gb', 'du '),
  ('de', 'de l'''),
  ('es', 'de l'''),
  ('it', 'de l'''),
  ('ca', 'du '),
  ('lb', 'du '),
  ('ch', 'de la '),
  ('pt', 'du '),
  ('nl', 'des '),
  ('gr', 'de la '),
  ('tr', 'de la '),
  ('ma', 'du '),
  ('sa', 'de l'''),
  ('br', 'du '),
  ('jp', 'du '),
  ('au', 'de l'''),
  ('mx', 'du ')
) AS v(id, article)
WHERE flag_countries.id = v.id;
