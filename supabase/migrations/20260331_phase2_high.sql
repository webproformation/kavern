-- ============================================================
-- PHASE 2 HIGH — Migration 31/03/2026
-- ============================================================

-- 1. Table categories existe déjà en prod — skip VIEW
-- ============================================================


-- 2. user_coupons UPDATE policy (marquer les coupons utilisés)
-- ============================================================
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_coupons_user_select" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_user_update" ON user_coupons;
DROP POLICY IF EXISTS "user_coupons_admin_all" ON user_coupons;

CREATE POLICY "user_coupons_user_select" ON user_coupons
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_coupons_user_update" ON user_coupons
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_coupons_admin_all" ON user_coupons
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));


-- 3. Fix products.id TEXT vs stock functions cast ::uuid
-- ============================================================
-- Les fonctions stock existantes castent product_id::uuid, mais products.id est TEXT
-- On crée un wrapper safe qui gère les deux cas
CREATE OR REPLACE FUNCTION safe_uuid_cast(val text)
RETURNS uuid AS $$
BEGIN
  RETURN val::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 4. Tables fantômes (référencées dans le code mais inexistantes)
-- ============================================================

-- referral_codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_codes_user_read" ON referral_codes
  FOR SELECT USING (user_id = auth.uid() OR is_active = true);

CREATE POLICY "referral_codes_admin_all" ON referral_codes
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- newsletter_subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletter_admin_all" ON newsletter_subscriptions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- push_subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  keys jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "push_user_own" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_admin_write" ON site_settings
  FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));


-- 5. profiles admin SELECT/UPDATE policy
-- ============================================================
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;

CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );

CREATE POLICY "profiles_admin_update" ON profiles
  FOR UPDATE
  USING (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
  );


-- 6. RPC atomique pour débit carte cadeau (fix race condition)
-- ============================================================
CREATE OR REPLACE FUNCTION debit_gift_card(
  p_gift_card_id uuid,
  p_amount numeric,
  p_order_id uuid
) RETURNS void AS $$
BEGIN
  -- Débit atomique avec vérification solde
  UPDATE gift_cards
  SET current_balance = GREATEST(0, current_balance - p_amount)
  WHERE id = p_gift_card_id
    AND current_balance >= p_amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solde carte cadeau insuffisant';
  END IF;

  -- Enregistrer la transaction
  INSERT INTO gift_card_transactions (gift_card_id, order_id, amount, type)
  VALUES (p_gift_card_id, p_order_id, p_amount, 'usage');
END;
$$ LANGUAGE plpgsql;
