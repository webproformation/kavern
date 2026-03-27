-- Ajouter la colonne marketing_badge aux produits si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'marketing_badge'
  ) THEN
    ALTER TABLE products ADD COLUMN marketing_badge TEXT DEFAULT NULL;
  END IF;
END $$;
