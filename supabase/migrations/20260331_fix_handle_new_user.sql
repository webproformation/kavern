-- =====================================================
-- FIX : handle_new_user — colonne "blocked" -> "is_blocked"
-- La table profiles utilise "is_blocked", pas "blocked"
-- =====================================================

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
    is_admin, is_blocked, blocked_reason, blocked_at, cancelled_orders_count,
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
    RAISE WARNING '[handle_new_user] ERREUR user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- Réattacher le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
