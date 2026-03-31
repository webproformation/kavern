-- =====================================================
-- FIX: pages_seo — politique SELECT manquante (admin ne peut pas lire)
-- =====================================================
DROP POLICY IF EXISTS "Admins can read pages" ON pages_seo;
CREATE POLICY "Admins can read pages"
  ON pages_seo
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id::text = auth.uid()::text
      AND profiles.is_admin = true
    )
  );

-- Pages publiées visibles par tous (pour le site public)
DROP POLICY IF EXISTS "Published pages are public" ON pages_seo;
CREATE POLICY "Published pages are public"
  ON pages_seo
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- =====================================================
-- FIX: products — colonnes pack manquantes si pas encore créées
-- =====================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_pack') THEN
    ALTER TABLE products ADD COLUMN is_pack BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pack_slots') THEN
    ALTER TABLE products ADD COLUMN pack_slots INTEGER DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'pack_source_category_id') THEN
    ALTER TABLE products ADD COLUMN pack_source_category_id UUID DEFAULT NULL;
  END IF;
END $$;

-- =====================================================
-- FIX: orders — colonnes manquantes pour poids et type
-- =====================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_virtual_weight') THEN
    ALTER TABLE orders ADD COLUMN total_virtual_weight INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_type') THEN
    ALTER TABLE orders ADD COLUMN shipping_type TEXT DEFAULT 'immediate';
  END IF;
END $$;

-- Migration: Créer la fonction RPC add_loyalty_gain (wrapper de add_loyalty_transaction)
-- Raison: Le code frontend appelle add_loyalty_gain mais seule add_loyalty_transaction existait

CREATE OR REPLACE FUNCTION add_loyalty_gain(
  p_user_id UUID,
  p_type TEXT,
  p_base_amount DECIMAL,
  p_description TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_multiplier INTEGER;
  v_actual_amount DECIMAL;
  v_success BOOLEAN;
BEGIN
  -- Récupérer le multiplicateur actuel
  SELECT COALESCE(tier_multiplier, 1) INTO v_multiplier
  FROM profiles
  WHERE id = p_user_id;

  IF v_multiplier IS NULL THEN
    v_multiplier := 1;
  END IF;

  v_actual_amount := p_base_amount * v_multiplier;

  -- Appeler la fonction existante
  v_success := add_loyalty_transaction(p_user_id, p_type, p_base_amount, p_description, NULL);

  IF v_success THEN
    RETURN json_build_object(
      'success', true,
      'multiplier', v_multiplier,
      'base_amount', p_base_amount,
      'actual_amount', v_actual_amount,
      'message', format('Cagnotte mise à jour ! +%s€', v_actual_amount)
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Erreur lors de l''ajout de la récompense'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
