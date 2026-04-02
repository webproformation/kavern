-- ============================================================
-- Fix pages_seo: ajouter les colonnes manquantes
-- Bug André: "Could not find the 'canonical_url' column of 'pages_seo' in the schema cache"
-- ============================================================

-- 1. Ajouter les colonnes manquantes
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS robots_index BOOLEAN DEFAULT true;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS robots_follow BOOLEAN DEFAULT true;

-- 2. Renommer og_image_url → og_image si nécessaire (le code utilise og_image)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages_seo' AND column_name = 'og_image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages_seo' AND column_name = 'og_image'
  ) THEN
    ALTER TABLE pages_seo RENAME COLUMN og_image_url TO og_image;
  END IF;
END $$;

-- 3. Ajouter created_by et updated_by si manquants
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 4. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
