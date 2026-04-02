-- Migration: ajouter product_id sur order_items
-- Cette colonne permet de lier chaque ligne de commande à son produit source
-- (nécessaire pour les statistiques, exports, et la cohérence référentielle)

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS product_id TEXT REFERENCES products(id) ON DELETE SET NULL;

-- Index pour les requêtes par produit
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Backfill : tenter de relier les order_items existants via product_slug
UPDATE order_items oi
SET product_id = p.id
FROM products p
WHERE oi.product_slug = p.slug
  AND oi.product_id IS NULL;
