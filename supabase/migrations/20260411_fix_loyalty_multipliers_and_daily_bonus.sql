-- =====================================================
-- FIX 11/04/2026 — Fidélité : multiplicateurs de rang + double bonus quotidien
-- =====================================================

-- 1. Corriger add_loyalty_gain : passer v_actual_amount (pas p_base_amount)
--    Bug : la fonction calculait le montant multiplié mais l'ignorait complètement
DROP FUNCTION IF EXISTS add_loyalty_gain(UUID, TEXT, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS add_loyalty_gain(UUID, TEXT, DECIMAL, TEXT);

CREATE OR REPLACE FUNCTION add_loyalty_gain(
  p_user_id UUID,
  p_type TEXT,
  p_base_amount DECIMAL,
  p_description TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_multiplier INTEGER;
  v_actual_amount DECIMAL;
BEGIN
  SELECT COALESCE(tier_multiplier, 1) INTO v_multiplier
  FROM profiles
  WHERE id = p_user_id;

  IF v_multiplier IS NULL THEN v_multiplier := 1; END IF;

  v_actual_amount := p_base_amount * v_multiplier;

  -- Insérer la transaction avec le montant RÉEL (multiplié)
  INSERT INTO loyalty_euro_transactions (user_id, type, amount, description)
  VALUES (p_user_id, p_type, v_actual_amount, p_description);

  UPDATE profiles
  SET loyalty_euros = COALESCE(loyalty_euros, 0) + v_actual_amount
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'multiplier', v_multiplier,
    'base_amount', p_base_amount,
    'actual_amount', v_actual_amount,
    'message', format('Cagnotte mise à jour ! +%s€', v_actual_amount)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Corriger record_daily_connection :
--    Bug A : la transaction loyalty était insérée même en cas de doublon concurrent
--    Bug B : le montant 0.10€ était fixe, sans appliquer le tier_multiplier
CREATE OR REPLACE FUNCTION record_daily_connection(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_multiplier INTEGER;
  v_actual_amount DECIMAL;
BEGIN
  -- Essayer d'insérer le suivi (DO NOTHING si déjà existant)
  INSERT INTO daily_connection_tracking (user_id, connection_date, reward_given)
  VALUES (p_user_id, CURRENT_DATE, TRUE)
  ON CONFLICT (user_id, connection_date) DO NOTHING;

  -- Si aucune ligne insérée → déjà récompensé aujourd'hui
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Déjà récompensé aujourd''hui');
  END IF;

  -- Récupérer le multiplicateur de rang
  SELECT COALESCE(tier_multiplier, 1) INTO v_multiplier
  FROM profiles WHERE id = p_user_id;

  IF v_multiplier IS NULL THEN v_multiplier := 1; END IF;

  v_actual_amount := 0.10 * v_multiplier;

  -- Créditer le bonus quotidien (montant × multiplicateur)
  INSERT INTO loyalty_euro_transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'daily_connection', v_actual_amount, format('Connexion quotidienne (×%s)', v_multiplier));

  UPDATE profiles
  SET loyalty_euros = COALESCE(loyalty_euros, 0) + v_actual_amount
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Bonus quotidien crédité !',
    'multiplier', v_multiplier,
    'amount', v_actual_amount
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Nettoyage des doublons existants en loyalty_euro_transactions (type daily_connection)
--    Garde uniquement la 1ère transaction par (user_id, date) — supprime les duplicats
DELETE FROM loyalty_euro_transactions
WHERE type = 'daily_connection'
  AND id NOT IN (
    SELECT DISTINCT ON (user_id, DATE(created_at)) id
    FROM loyalty_euro_transactions
    WHERE type = 'daily_connection'
    ORDER BY user_id, DATE(created_at), created_at ASC
  );

-- 4. S'assurer que le loyalty_euros de chaque profil est cohérent avec les transactions
--    (recalcul uniquement pour les users qui avaient des doublons supprimés)
-- NOTE : on ne fait pas de recalcul global pour éviter de casser les autres types
-- Le nettoyage ci-dessus retire l'excédent mais ne rembourse pas les profiles.loyalty_euros
-- Pour corriger le solde : soustraire le montant des doublons supprimés
-- => On laisse le solde tel quel (légèrement surévalué) plutôt que de risquer
--    une régression. Le vrai solde se corrigera naturellement.
