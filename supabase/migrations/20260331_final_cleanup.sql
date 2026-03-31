-- ============================================================
-- FINAL CLEANUP — 31/03/2026
-- Tout le reste : tva_rate, cascade, orphelins, live André
-- ============================================================

-- 1. Ajouter tva_rate à order_items
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'tva_rate'
  ) THEN
    ALTER TABLE order_items ADD COLUMN tva_rate text DEFAULT '20';
  END IF;
END $$;


-- 2. Cascade delete orders -> order_items
-- ============================================================
DO $$
BEGIN
  -- Supprimer l'ancienne FK si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'order_items_order_id_fkey'
    AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items DROP CONSTRAINT order_items_order_id_fkey;
  END IF;

  -- Recréer avec CASCADE
  ALTER TABLE order_items
    ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'FK cascade setup skipped: %', SQLERRM;
END $$;


-- 3. Supprimer les tables orphelines (vraiment mortes)
-- ============================================================
-- Tables dupliquées / legacy / jamais utilisées dans le code

DROP TABLE IF EXISTS livre_dor CASCADE;
DROP TABLE IF EXISTS woocommerce_cache CASCADE;
DROP TABLE IF EXISTS woocommerce_categories_cache CASCADE;
DROP TABLE IF EXISTS slides CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS wallet_credits CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS cookie_consent_logs CASCADE;
DROP TABLE IF EXISTS delivery_batches CASCADE;
DROP TABLE IF EXISTS live_chapters CASCADE;
DROP TABLE IF EXISTS live_sessions CASCADE;
DROP TABLE IF EXISTS live_stream_analytics CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS page_visits CASCADE;
DROP TABLE IF EXISTS media_library CASCADE;


-- 4. Insérer le live YouTube d'André
-- ============================================================
INSERT INTO live_streams (id, title, description, status, playback_url, scheduled_start, chat_enabled, products_enabled, is_recorded, stream_key, viewer_goal)
VALUES (
  'live_andre_youtube_1',
  'Live Shopping KAVERN',
  'Retrouvez André en direct pour découvrir les dernières pépites !',
  'scheduled',
  'https://www.youtube.com/watch?v=BoxnRX8X_DY',
  now() + interval '1 day',
  true,
  true,
  true,
  'a6u7-mqvs-b00a-yj26-7r3t',
  100
)
ON CONFLICT (id) DO UPDATE SET
  playback_url = EXCLUDED.playback_url,
  stream_key = EXCLUDED.stream_key;
