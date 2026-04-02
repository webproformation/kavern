-- ============================================================
-- Créer les tables manquantes restantes (détectées par QA Engine V2)
-- ============================================================

-- 1. ambassador_weekly (stats hebdo ambassadeurs livre d'or)
CREATE TABLE IF NOT EXISTS ambassador_weekly (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  reviews_count INTEGER DEFAULT 0,
  cashback_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);
ALTER TABLE ambassador_weekly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stats" ON ambassador_weekly FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "System can manage" ON ambassador_weekly FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
GRANT SELECT ON ambassador_weekly TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ambassador_weekly TO service_role;

-- 2. color_family_mappings (correspondance couleurs / familles pour les swatches)
CREATE TABLE IF NOT EXISTS color_family_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  color_value TEXT NOT NULL,
  family_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(color_value)
);
ALTER TABLE color_family_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read colors" ON color_family_mappings FOR SELECT USING (true);
CREATE POLICY "Admins can manage colors" ON color_family_mappings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
GRANT SELECT ON color_family_mappings TO authenticated;
GRANT SELECT ON color_family_mappings TO anon;

-- 3. deployment_logs (logs des déploiements Vercel webhook)
CREATE TABLE IF NOT EXISTS deployment_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deployment_id TEXT,
  project TEXT,
  status TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read logs" ON deployment_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
GRANT SELECT, INSERT ON deployment_logs TO authenticated;
GRANT INSERT ON deployment_logs TO service_role;

-- 4. Notify PostgREST
NOTIFY pgrst, 'reload schema';
