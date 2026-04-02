-- ============================================================
-- Fix handle_new_user trigger
-- Bug André: création de compte échoue silencieusement
-- Cause: le trigger et le code frontend utilisaient "blocked" mais la colonne
--        en prod s'appelle "is_blocked". On garde "is_blocked" (c'est la prod qui fait foi).
-- ============================================================

-- 1. Recréer la fonction avec le bon nom de colonne (is_blocked = nom réel en prod)
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
    FALSE,  -- is_blocked
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

-- 2. Réattacher le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 3. Fix les profils manquants (users dans auth.users mais pas dans profiles)
DO $$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE p.id IS NULL
  LOOP
    INSERT INTO public.profiles (
      id, email, full_name, first_name, last_name, phone,
      wallet_balance, loyalty_euros, current_tier, tier_multiplier,
      is_admin, is_blocked, cancelled_orders_count,
      created_at, updated_at
    ) VALUES (
      v_user.id,
      COALESCE(v_user.email, ''),
      TRIM(COALESCE(
        (v_user.raw_user_meta_data->>'first_name') || ' ' || (v_user.raw_user_meta_data->>'last_name'),
        v_user.email, ''
      )),
      COALESCE(v_user.raw_user_meta_data->>'first_name', ''),
      COALESCE(v_user.raw_user_meta_data->>'last_name', ''),
      COALESCE(v_user.raw_user_meta_data->>'phone', ''),
      5.00, 0.00, 1, 1,
      FALSE, FALSE, 0,
      NOW(), NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Profil créé pour user orphelin: % (%)', v_user.id, v_user.email;
  END LOOP;
END $$;
