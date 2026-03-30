-- Migration: Fix colonnes manquantes détectées en production (30 mars 2026)
-- P0-2: products.tva_rate manquant → empêchait la création de produits
ALTER TABLE products ADD COLUMN IF NOT EXISTS tva_rate NUMERIC DEFAULT 20;

-- P0-7: live_streams colonnes manquantes → empêchait la création de lives
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS stream_key TEXT;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS is_recorded BOOLEAN DEFAULT true;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS viewer_goal INTEGER DEFAULT 100;
ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS chest_unlocked BOOLEAN DEFAULT false;

-- P1-13: pages_seo colonnes manquantes → page SEO admin non fonctionnelle
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'static';
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS og_title TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS og_description TEXT;
ALTER TABLE pages_seo ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- P0-5: payment_methods colonnes manquantes → virement bancaire non affichable
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS processing_fee_percentage NUMERIC DEFAULT 0;
ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS processing_fee_fixed NUMERIC DEFAULT 0;
UPDATE payment_methods SET code = provider WHERE code IS NULL;
