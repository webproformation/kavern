-- Fix cart_items unique constraint pour ON CONFLICT
-- Problème : UNIQUE NULLS NOT DISTINCT requiert PG15+, pas garanti sur Supabase
-- Le code CartContext écrit déjà variation_id = variationId || 'default' (jamais NULL)
-- Solution : créer une contrainte UNIQUE standard compatible PG14+

-- 1. Normaliser les NULLs éventuels (cohérence avec le code qui écrit 'default')
UPDATE cart_items SET variation_id = 'default' WHERE variation_id IS NULL OR variation_id = '';

-- 2. Passer variation_id en NOT NULL avec default 'default'
ALTER TABLE cart_items
  ALTER COLUMN variation_id SET DEFAULT 'default',
  ALTER COLUMN variation_id SET NOT NULL;

-- 3. Remplacer la contrainte NULLS NOT DISTINCT par une contrainte standard PG14+
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS unique_cart_item;
ALTER TABLE cart_items
  ADD CONSTRAINT unique_cart_item UNIQUE (user_id, product_id, variation_id);
