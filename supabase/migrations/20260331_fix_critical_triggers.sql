-- =====================================================
-- FIX CRITIQUE : triggers et fonctions manquantes
-- =====================================================

-- 1. Recréer record_daily_connection si manquante
CREATE OR REPLACE FUNCTION record_daily_connection(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_already_rewarded BOOLEAN DEFAULT FALSE;
BEGIN
  SELECT reward_given INTO v_already_rewarded
  FROM daily_connection_tracking
  WHERE user_id = p_user_id
    AND connection_date = CURRENT_DATE;

  IF v_already_rewarded IS TRUE THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Déjà récompensé aujourd''hui'
    );
  END IF;

  INSERT INTO daily_connection_tracking (user_id, connection_date, reward_given)
  VALUES (p_user_id, CURRENT_DATE, TRUE)
  ON CONFLICT (user_id, connection_date)
  DO UPDATE SET reward_given = TRUE;

  -- Ajouter 0.10€ de récompense
  INSERT INTO loyalty_euro_transactions (id, user_id, type, amount, description, created_at)
  VALUES (gen_random_uuid(), p_user_id, 'daily_connection', 0.10, 'Connexion quotidienne', NOW());

  UPDATE profiles
  SET loyalty_euros = COALESCE(loyalty_euros, 0) + 0.10
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Bonus quotidien crédité !',
    'amount', 0.10
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recréer handle_new_user avec toutes les colonnes actuelles
-- D'abord vérifier les colonnes qui existent dans profiles
DO $$
BEGIN
  -- Ajouter les colonnes manquantes dans profiles
  BEGIN ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT ''; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_tier INTEGER DEFAULT 1; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier_multiplier INTEGER DEFAULT 1; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cancelled_orders_count INTEGER DEFAULT 0; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_reason TEXT; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  INSERT INTO public.profiles (
    id, email, full_name, first_name, last_name, phone, avatar_url, birth_date,
    wallet_balance, loyalty_euros, current_tier, tier_multiplier,
    is_admin, blocked, blocked_reason, blocked_at, cancelled_orders_count,
    created_at, updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    TRIM(COALESCE(v_first_name || ' ' || v_last_name, NEW.email, '')),
    v_first_name,
    v_last_name,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    '',
    NULLIF(NEW.raw_user_meta_data->>'birth_date', ''),
    5.00,   -- 5€ de bienvenue
    0.00,
    1,      -- Tier 1
    1,      -- Multiplicateur 1
    FALSE,
    FALSE,
    NULL,
    NULL,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
    updated_at = NOW();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- IMPORTANT : logger l'erreur pour debug
    RAISE WARNING '[handle_new_user] ERREUR user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- 3. S'assurer que le trigger est bien attaché
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Créer la table daily_connection_tracking si elle n'existe pas
CREATE TABLE IF NOT EXISTS daily_connection_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reward_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connection_date)
);
