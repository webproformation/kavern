-- ============================================================
-- Recréer la table wishlist (supprimée par erreur dans 20260331_final_cleanup.sql)
-- Bug André: "Erreur lors de la mise à jour de la wishlist"
-- Le code WishlistContext.tsx utilise supabase.from('wishlist') pour les users connectés
-- ============================================================

-- 1. Recréer la table wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 2. Index pour performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

-- 3. RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can add to their wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can remove from their wishlist" ON wishlist;

-- Policies simples et fonctionnelles
CREATE POLICY "Users can view their own wishlist"
  ON wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
  ON wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist"
  ON wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- 4. GRANT permissions aux rôles Supabase (obligatoire en plus du RLS)
GRANT SELECT, INSERT, DELETE ON wishlist TO authenticated;
GRANT SELECT ON wishlist TO anon;

-- 5. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
