# SQL À EXÉCUTER SUR SUPABASE

À copier-coller dans le SQL Editor de Supabase (projet dckbrlxqmgfzaacxqiio).

```sql
-- =====================================================
-- 1. Colonne marketing_badge pour les produits
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'marketing_badge'
  ) THEN
    ALTER TABLE products ADD COLUMN marketing_badge TEXT DEFAULT NULL;
  END IF;
END $$;

-- =====================================================
-- 2. Colonnes tracking pour les commandes (si manquantes)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number TEXT DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tracking_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_url TEXT DEFAULT NULL;
  END IF;
END $$;

-- =====================================================
-- 3. Colonne composition pour les produits
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'composition'
  ) THEN
    ALTER TABLE products ADD COLUMN composition TEXT DEFAULT NULL;
  END IF;
END $$;

-- =====================================================
-- 4. Renommer "Paiement à la livraison" en "Paiement en boutique"
-- =====================================================
UPDATE payment_methods SET name = 'Paiement en boutique' WHERE provider = 'cash_on_delivery' OR code = 'cash_on_delivery';

-- =====================================================
-- 5. Table factures avec numérotation séquentielle
-- (copier depuis supabase/migrations/20260328_create_invoices_table.sql)
-- =====================================================
```
