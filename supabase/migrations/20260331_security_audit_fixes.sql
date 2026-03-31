-- =====================================================
-- MIGRATION AUDIT SÉCURITÉ 31/03/2026
-- =====================================================

-- =====================================================
-- 1. TRIGGER DÉCRÉMENTATION STOCK (CRITIQUE)
-- Quand une commande passe à 'processing', on décrémente le stock
-- =====================================================

CREATE OR REPLACE FUNCTION decrement_order_stock()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  item RECORD;
BEGIN
  -- Ne déclencher que quand le status passe à 'processing'
  IF NEW.status = 'processing' AND (OLD.status IS NULL OR OLD.status != 'processing') THEN
    -- Parcourir les items de la commande
    FOR item IN
      SELECT oi.product_id, oi.quantity, oi.variation_data
      FROM order_items oi
      WHERE oi.order_id = NEW.id
    LOOP
      -- Décrémenter le stock produit principal
      UPDATE products
      SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - item.quantity)
      WHERE id = item.product_id::uuid
        AND manage_stock = true;

      -- Décrémenter le stock variation si applicable
      IF item.variation_data IS NOT NULL AND item.variation_data->>'variation_id' IS NOT NULL THEN
        UPDATE product_variations
        SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - item.quantity)
        WHERE id = (item.variation_data->>'variation_id')::uuid;
      END IF;
    END LOOP;

    -- Mettre à jour stock_status pour les produits en rupture
    UPDATE products
    SET stock_status = 'outofstock'
    WHERE manage_stock = true
      AND stock_quantity <= 0
      AND stock_status != 'outofstock';
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erreur decrement_order_stock pour order %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_order_stock_reduction ON orders;
CREATE TRIGGER tr_order_stock_reduction
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'processing' AND OLD.status IS DISTINCT FROM 'processing')
  EXECUTE FUNCTION decrement_order_stock();

-- =====================================================
-- 2. FONCTION ATOMIQUE POUR WALLET/LOYALTY (CRITIQUE)
-- Empêche les soldes négatifs et les race conditions
-- =====================================================

CREATE OR REPLACE FUNCTION deduct_wallet_and_loyalty(
  p_user_id UUID,
  p_wallet_amount NUMERIC DEFAULT 0,
  p_loyalty_amount NUMERIC DEFAULT 0
) RETURNS JSON
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  v_wallet NUMERIC;
  v_loyalty NUMERIC;
BEGIN
  -- Verrouiller la ligne pour éviter les race conditions
  SELECT wallet_balance, loyalty_euros
  INTO v_wallet, v_loyalty
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Vérifier les soldes suffisants
  IF v_wallet < p_wallet_amount THEN
    RETURN json_build_object('success', false, 'error', 'Solde portefeuille insuffisant');
  END IF;

  IF v_loyalty < p_loyalty_amount THEN
    RETURN json_build_object('success', false, 'error', 'Solde fidélité insuffisant');
  END IF;

  -- Déduire atomiquement
  UPDATE profiles
  SET
    wallet_balance = wallet_balance - p_wallet_amount,
    loyalty_euros = loyalty_euros - p_loyalty_amount,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'wallet_deducted', p_wallet_amount,
    'loyalty_deducted', p_loyalty_amount,
    'new_wallet', v_wallet - p_wallet_amount,
    'new_loyalty', v_loyalty - p_loyalty_amount
  );
END;
$$;

-- =====================================================
-- 3. FONCTION ATOMIQUE POUR GIFT CARD (CRITIQUE)
-- =====================================================

CREATE OR REPLACE FUNCTION redeem_gift_card(
  p_card_id UUID,
  p_amount NUMERIC
) RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE gift_cards
  SET current_balance = current_balance - p_amount,
      updated_at = NOW()
  WHERE id = p_card_id
    AND current_balance >= p_amount
    AND is_active = true;

  RETURN FOUND;
END;
$$;

-- =====================================================
-- 4. CONTRAINTES CHECK pour empêcher soldes négatifs
-- =====================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'check_wallet_positive'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT check_wallet_positive CHECK (wallet_balance >= 0);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not add check_wallet_positive: %', SQLERRM;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'check_loyalty_positive'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT check_loyalty_positive CHECK (loyalty_euros >= 0);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not add check_loyalty_positive: %', SQLERRM;
END $$;

-- =====================================================
-- 5. INDEX MANQUANTS (PERFORMANCE)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_coupons_is_used ON user_coupons(is_used);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_category_mapping_product ON product_category_mapping(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_mapping_category ON product_category_mapping(category_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_euro_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- =====================================================
-- 6. FIX RLS POLICIES — remplacer USING(true) par admin check
-- =====================================================

-- pages_seo : admin seulement pour écriture (lecture déjà fixée dans migration précédente)
DROP POLICY IF EXISTS "Admin manage pages_seo" ON pages_seo;

-- live_streams : admin seulement
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admin manage lives" ON live_streams;
  CREATE POLICY "Admin manage lives"
    ON live_streams
    FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
    WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not fix live_streams RLS: %', SQLERRM;
END $$;

-- =====================================================
-- 7. TABLE AUDIT LOG pour traçabilité financière
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent lire l'audit log
DROP POLICY IF EXISTS "Admins read audit log" ON audit_log;
CREATE POLICY "Admins read audit log"
  ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Tout le monde peut insérer (pour le logging côté serveur)
DROP POLICY IF EXISTS "Insert audit log" ON audit_log;
CREATE POLICY "Insert audit log"
  ON audit_log
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
