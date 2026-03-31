-- ============================================================
-- PHASE 5 — Fixes André (TVA 5.5%, colis ouvert)
-- ============================================================

-- 1. Ajouter tva_rate à order_items pour stocker le taux TVA par produit
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'tva_rate'
  ) THEN
    ALTER TABLE order_items ADD COLUMN tva_rate text DEFAULT '20';
  END IF;
END $$;
