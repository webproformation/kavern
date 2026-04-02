-- ============================================================
-- Créer les tables manquantes détectées par QA Engine V2
-- 23 tables fantômes dans le code, corrections ici
-- ============================================================

-- 1. guestbook_hearts (likes sur les entrées du livre d'or)
CREATE TABLE IF NOT EXISTS guestbook_hearts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entry_id, user_id)
);
ALTER TABLE guestbook_hearts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own hearts" ON guestbook_hearts FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anyone can read hearts" ON guestbook_hearts FOR SELECT USING (true);
GRANT SELECT, INSERT, DELETE ON guestbook_hearts TO authenticated;
GRANT SELECT ON guestbook_hearts TO anon;

-- 2. guestbook_settings (paramètres du livre d'or)
CREATE TABLE IF NOT EXISTS guestbook_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active BOOLEAN DEFAULT true,
  moderation_enabled BOOLEAN DEFAULT true,
  min_order_amount NUMERIC DEFAULT 0,
  cashback_amount NUMERIC DEFAULT 0.20,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE guestbook_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON guestbook_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON guestbook_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
GRANT SELECT ON guestbook_settings TO authenticated;
GRANT SELECT ON guestbook_settings TO anon;

-- 3. game_plays (historique des jeux: roue, grattage, card flip)
CREATE TABLE IF NOT EXISTS game_plays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  game_type TEXT NOT NULL,
  game_id UUID,
  has_won BOOLEAN DEFAULT false,
  prize_label TEXT,
  prize_value NUMERIC,
  coupon_code TEXT,
  played_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE game_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own plays" ON game_plays FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can create plays" ON game_plays FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT ON game_plays TO authenticated;

-- 4. dashboard_stats (stats admin pré-calculées)
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date DATE DEFAULT CURRENT_DATE,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  orders_today INTEGER DEFAULT 0,
  revenue_today NUMERIC DEFAULT 0,
  new_customers_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(stat_date)
);
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read stats" ON dashboard_stats FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins can manage stats" ON dashboard_stats FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
GRANT SELECT, INSERT, UPDATE ON dashboard_stats TO authenticated;

-- 5. live_timestamps (chapitres des replays live)
CREATE TABLE IF NOT EXISTS live_timestamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  live_stream_id TEXT REFERENCES live_streams(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE live_timestamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read timestamps" ON live_timestamps FOR SELECT USING (true);
CREATE POLICY "Admins can manage timestamps" ON live_timestamps FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
GRANT SELECT ON live_timestamps TO authenticated;
GRANT SELECT ON live_timestamps TO anon;

-- 6. Notify PostgREST
NOTIFY pgrst, 'reload schema';
