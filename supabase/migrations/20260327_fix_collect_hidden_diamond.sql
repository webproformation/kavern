-- =====================================================
-- FIX: Ajouter la colonne tier_multiplier si manquante
-- + Recréer la fonction collect_hidden_diamond
-- =====================================================

-- 1. S'assurer que la colonne tier_multiplier existe dans profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tier_multiplier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tier_multiplier INTEGER DEFAULT 1 NOT NULL;
  END IF;
END $$;

-- 2. Recréer la fonction collect_hidden_diamond
--    Note: la table loyalty_euro_transactions peut avoir "type" ou "transaction_type"
--    selon la version de la DB. On détecte dynamiquement.
CREATE OR REPLACE FUNCTION collect_hidden_diamond(
  p_product_id TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_multiplier INTEGER;
  v_base_amount DECIMAL := 0.10;
  v_actual_amount DECIMAL;
  v_already_found BOOLEAN;
  v_type_col TEXT;
BEGIN
  -- Récupérer l'utilisateur courant
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  -- Détecter le nom de la colonne type
  SELECT column_name INTO v_type_col
  FROM information_schema.columns
  WHERE table_name = 'loyalty_euro_transactions'
    AND column_name IN ('type', 'transaction_type')
  LIMIT 1;

  IF v_type_col IS NULL THEN
    v_type_col := 'type';
  END IF;

  -- Vérifier si le diamant a déjà été trouvé
  EXECUTE format(
    'SELECT EXISTS(SELECT 1 FROM loyalty_euro_transactions WHERE user_id = $1 AND %I = $2 AND description = $3)',
    v_type_col
  ) INTO v_already_found USING v_user_id, 'diamond_found', p_description;

  IF v_already_found THEN
    RETURN jsonb_build_object('success', false, 'message', 'Diamant déjà collecté');
  END IF;

  -- Récupérer le multiplicateur du profil (fallback à 1)
  SELECT COALESCE(tier_multiplier, 1) INTO v_multiplier
  FROM profiles
  WHERE id = v_user_id;

  IF v_multiplier IS NULL THEN
    v_multiplier := 1;
  END IF;

  -- Calculer le montant avec multiplicateur
  v_actual_amount := v_base_amount * v_multiplier;

  -- Insérer la transaction
  EXECUTE format(
    'INSERT INTO loyalty_euro_transactions (user_id, %I, amount, multiplier_applied, actual_amount, description) VALUES ($1, $2, $3, $4, $5, $6)',
    v_type_col
  ) USING v_user_id, 'diamond_found', v_base_amount, v_multiplier, v_actual_amount, p_description;

  -- Mettre à jour le total loyalty_euros du profil
  UPDATE profiles
  SET loyalty_euros = COALESCE(loyalty_euros, 0) + v_actual_amount
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'multiplier', v_multiplier,
    'amount', v_actual_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
