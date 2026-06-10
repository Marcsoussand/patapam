-- Prénoms famille (hardcodés côté app pour l’instant ; slot_type profile pour plus tard)
INSERT INTO carton_words (id, category, slot_type, label_fr, label_en, label_he, slug, age_group, sort_order) VALUES
  ('famille_aaron', 'famille', 'profile', 'aaron', 'aaron', 'אהרון', 'aaron', 'young', 3),
  ('famille_naor',  'famille', 'profile', 'naor',  'naor',  'נאור',  'naor',  'young', 4),
  ('famille_elon',  'famille', 'profile', 'elon',  'elon',  'אלון',  'elon',  'young', 5)
ON CONFLICT (id) DO UPDATE SET
  label_fr   = EXCLUDED.label_fr,
  label_en   = EXCLUDED.label_en,
  label_he   = EXCLUDED.label_he,
  sort_order = EXCLUDED.sort_order,
  is_active  = true;
