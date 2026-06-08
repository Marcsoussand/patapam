-- Corriger storage_path : .png → .svg et flags/xx.svg → xx.svg (racine du bucket)
UPDATE flag_countries
SET storage_path = regexp_replace(
  regexp_replace(storage_path, '\.png$', '.svg'),
  '^flags/',
  ''
)
WHERE storage_path LIKE '%.png' OR storage_path LIKE 'flags/%';
