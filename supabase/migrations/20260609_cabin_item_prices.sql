-- Prix marché pour les objets cabane (achat = vente, à l'infini)

ALTER TABLE cabin_items
  ADD COLUMN IF NOT EXISTS price_coins int NOT NULL DEFAULT 0
  CHECK (price_coins >= 0);

UPDATE cabin_items SET price_coins = 5  WHERE id = 'test_lantern';
UPDATE cabin_items SET price_coins = 20 WHERE id = 'lit_patapam';
UPDATE cabin_items SET price_coins = 8  WHERE id = 'table_nuit';
