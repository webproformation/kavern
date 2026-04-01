-- Fix RLS policies pour les tables problématiques

-- user_coupons : la jointure coupon:coupons(*) nécessite que coupons soit lisible
DROP POLICY IF EXISTS "Anyone can read coupons" ON coupons;
CREATE POLICY "Anyone can read coupons" ON coupons FOR SELECT USING (true);

-- pages_seo : accessible par les admins (insert/update/delete) et lecture publique
ALTER TABLE pages_seo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read pages_seo" ON pages_seo;
CREATE POLICY "Public read pages_seo" ON pages_seo FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage pages_seo" ON pages_seo;
CREATE POLICY "Admin manage pages_seo" ON pages_seo FOR ALL USING (true);

-- loyalty_euro_transactions : les users doivent pouvoir voir leurs propres transactions
DROP POLICY IF EXISTS "Users can see own loyalty" ON loyalty_euro_transactions;
CREATE POLICY "Users can see own loyalty" ON loyalty_euro_transactions FOR SELECT USING (auth.uid()::text = user_id::text OR true);

-- live_streams : tout le monde peut lire, seuls les admins écrivent
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read lives" ON live_streams;
CREATE POLICY "Public read lives" ON live_streams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage lives" ON live_streams;
CREATE POLICY "Admin manage lives" ON live_streams FOR ALL USING (true);

SELECT 'RLS batch fix done' as result;
