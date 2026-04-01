-- ============================================================
-- FIX URGENTS ANDRÉ 01/04/2026
-- 1. pages_seo : policy INSERT/UPDATE/DELETE supprimée par erreur (20260331)
-- 2. live_streams : s'assurer que admin peut start/stop
-- ============================================================

-- Fonction is_admin() (idempotente)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $func$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$func$;

-- ========================
-- pages_seo : recréer les policies d'écriture
-- ========================
DROP POLICY IF EXISTS "rls_pages_seo_read" ON pages_seo;
DROP POLICY IF EXISTS "rls_pages_seo_admin" ON pages_seo;
DROP POLICY IF EXISTS "Only admins can create pages" ON pages_seo;
DROP POLICY IF EXISTS "Only admins can update pages" ON pages_seo;
DROP POLICY IF EXISTS "Only admins can delete pages" ON pages_seo;
DROP POLICY IF EXISTS "Admin manage pages_seo" ON pages_seo;

ALTER TABLE pages_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rls_pages_seo_read"
  ON pages_seo FOR SELECT USING (true);

CREATE POLICY "rls_pages_seo_admin"
  ON pages_seo FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ========================
-- live_streams : s'assurer admin ALL policy existe
-- ========================
DROP POLICY IF EXISTS "Admin manage lives" ON live_streams;
DROP POLICY IF EXISTS "rls_live_streams_admin" ON live_streams;

CREATE POLICY "rls_live_streams_admin"
  ON live_streams FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- NOTE: table wishlist (singulier) a été supprimée lors du cleanup 20260331.
-- La wishlist fonctionne désormais via localStorage uniquement (WishlistContext.tsx).
