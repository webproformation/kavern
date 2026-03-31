-- ============================================================
-- PHASE 1 CRITIQUES — Migration 31/03/2026
-- ============================================================

-- 1. SEQUENCE pour order_number (fix race condition)
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Initialiser la séquence au prochain numéro disponible
DO $$
DECLARE
  max_num bigint;
BEGIN
  -- Ignorer les fallback timestamp (> 6 chiffres) pour ne garder que les vrais séquentiels
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 5) AS bigint)
  ), 0) INTO max_num
  FROM orders
  WHERE order_number ~ '^CMD-[0-9]{1,6}$';

  IF max_num > 0 THEN
    PERFORM setval('order_number_seq', max_num);
  END IF;
END $$;

-- Fonction pour générer le numéro de commande automatiquement
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'CMD-' || LPAD(nextval('order_number_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur insert
DROP TRIGGER IF EXISTS trg_generate_order_number ON orders;
CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();


-- 2. ALTER TABLE order_items ADD COLUMN product_id
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE order_items ADD COLUMN product_id text;
  END IF;
END $$;


-- 3. FIX RLS: media_library, product_variations, product_images -> admin-only
-- ============================================================

-- media_library
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "media_library_select" ON media_library;
DROP POLICY IF EXISTS "media_library_insert" ON media_library;
DROP POLICY IF EXISTS "media_library_update" ON media_library;
DROP POLICY IF EXISTS "media_library_delete" ON media_library;
DROP POLICY IF EXISTS "media_library_admin_all" ON media_library;

CREATE POLICY "media_library_admin_all" ON media_library
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- product_variations
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_variations_select" ON product_variations;
DROP POLICY IF EXISTS "product_variations_insert" ON product_variations;
DROP POLICY IF EXISTS "product_variations_update" ON product_variations;
DROP POLICY IF EXISTS "product_variations_delete" ON product_variations;
DROP POLICY IF EXISTS "product_variations_public_read" ON product_variations;
DROP POLICY IF EXISTS "product_variations_admin_all" ON product_variations;

-- Les variations doivent être lisibles publiquement (affichage produit)
CREATE POLICY "product_variations_public_read" ON product_variations
  FOR SELECT USING (true);

CREATE POLICY "product_variations_admin_all" ON product_variations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_images_select" ON product_images;
DROP POLICY IF EXISTS "product_images_insert" ON product_images;
DROP POLICY IF EXISTS "product_images_update" ON product_images;
DROP POLICY IF EXISTS "product_images_delete" ON product_images;
DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
DROP POLICY IF EXISTS "product_images_admin_all" ON product_images;

-- Les images doivent être lisibles publiquement
CREATE POLICY "product_images_public_read" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "product_images_admin_all" ON product_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );


-- 4. FIX RLS: news_posts, return_requests, referral_uses -> admin check
-- ============================================================

-- news_posts: lecture publique, écriture admin
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "news_posts_select" ON news_posts;
DROP POLICY IF EXISTS "news_posts_public_read" ON news_posts;
DROP POLICY IF EXISTS "news_posts_admin_all" ON news_posts;

CREATE POLICY "news_posts_public_read" ON news_posts
  FOR SELECT USING (true);

CREATE POLICY "news_posts_admin_all" ON news_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- return_requests: user voit les siennes, admin voit tout
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "return_requests_select" ON return_requests;
DROP POLICY IF EXISTS "return_requests_insert" ON return_requests;
DROP POLICY IF EXISTS "return_requests_update" ON return_requests;
DROP POLICY IF EXISTS "return_requests_user_select" ON return_requests;
DROP POLICY IF EXISTS "return_requests_user_insert" ON return_requests;
DROP POLICY IF EXISTS "return_requests_admin_all" ON return_requests;

CREATE POLICY "return_requests_user_select" ON return_requests
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "return_requests_user_insert" ON return_requests
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "return_requests_admin_all" ON return_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- referral_uses: admin only (sauf lecture propre)
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "referral_uses_select" ON referral_uses;
DROP POLICY IF EXISTS "referral_uses_insert" ON referral_uses;
DROP POLICY IF EXISTS "referral_uses_user_read" ON referral_uses;
DROP POLICY IF EXISTS "referral_uses_admin_all" ON referral_uses;

CREATE POLICY "referral_uses_user_read" ON referral_uses
  FOR SELECT
  USING (referred_user_id = auth.uid() OR referrer_user_id = auth.uid());

CREATE POLICY "referral_uses_admin_all" ON referral_uses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
