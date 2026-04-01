-- ============================================================
-- FIX RLS SECURITY — 01/04/2026
-- Active RLS sur toutes les tables et ajoute des policies
-- Safe: ne plante pas si une table n'existe pas
-- ============================================================

-- Helper function
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

-- products
DO $$ BEGIN
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_products_read" ON products;
CREATE POLICY "rls_products_read" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_products_admin" ON products;
CREATE POLICY "rls_products_admin" ON products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- product_variations
DO $$ BEGIN
  ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_product_variations_read" ON product_variations;
CREATE POLICY "rls_product_variations_read" ON product_variations FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_variations_admin" ON product_variations;
CREATE POLICY "rls_product_variations_admin" ON product_variations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- product_images
DO $$ BEGIN
  ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_product_images_read" ON product_images;
CREATE POLICY "rls_product_images_read" ON product_images FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_images_admin" ON product_images;
CREATE POLICY "rls_product_images_admin" ON product_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- product_attributes
DO $$ BEGIN
  ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_product_attributes_read" ON product_attributes;
CREATE POLICY "rls_product_attributes_read" ON product_attributes FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_attributes_admin" ON product_attributes;
CREATE POLICY "rls_product_attributes_admin" ON product_attributes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- product_attribute_values
DO $$ BEGIN
  ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_product_attribute_values_read" ON product_attribute_values;
CREATE POLICY "rls_product_attribute_values_read" ON product_attribute_values FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_attribute_values_admin" ON product_attribute_values;
CREATE POLICY "rls_product_attribute_values_admin" ON product_attribute_values FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- product_attribute_terms
DO $$ BEGIN
  ALTER TABLE product_attribute_terms ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_product_attribute_terms_read" ON product_attribute_terms;
CREATE POLICY "rls_product_attribute_terms_read" ON product_attribute_terms FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_attribute_terms_admin" ON product_attribute_terms;
CREATE POLICY "rls_product_attribute_terms_admin" ON product_attribute_terms FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- product_category_mapping
DO $$ BEGIN
  ALTER TABLE product_category_mapping ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_product_category_mapping_read" ON product_category_mapping;
CREATE POLICY "rls_product_category_mapping_read" ON product_category_mapping FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_category_mapping_admin" ON product_category_mapping;
CREATE POLICY "rls_product_category_mapping_admin" ON product_category_mapping FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- product_availability_notifications
DO $$ BEGIN
  ALTER TABLE product_availability_notifications ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_product_availability_notifications_insert" ON product_availability_notifications;
CREATE POLICY "rls_product_availability_notifications_insert" ON product_availability_notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "rls_product_availability_notifications_admin" ON product_availability_notifications;
CREATE POLICY "rls_product_availability_notifications_admin" ON product_availability_notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- featured_products
DO $$ BEGIN
  ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_featured_products_read" ON featured_products;
CREATE POLICY "rls_featured_products_read" ON featured_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_featured_products_admin" ON featured_products;
CREATE POLICY "rls_featured_products_admin" ON featured_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- categories
DO $$ BEGIN
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_categories_read" ON categories;
CREATE POLICY "rls_categories_read" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_categories_admin" ON categories;
CREATE POLICY "rls_categories_admin" ON categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- home_categories
DO $$ BEGIN
  ALTER TABLE home_categories ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_home_categories_read" ON home_categories;
CREATE POLICY "rls_home_categories_read" ON home_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_home_categories_admin" ON home_categories;
CREATE POLICY "rls_home_categories_admin" ON home_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- home_slides
DO $$ BEGIN
  ALTER TABLE home_slides ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_home_slides_read" ON home_slides;
CREATE POLICY "rls_home_slides_read" ON home_slides FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_home_slides_admin" ON home_slides;
CREATE POLICY "rls_home_slides_admin" ON home_slides FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- pages_seo
DO $$ BEGIN
  ALTER TABLE pages_seo ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_pages_seo_read" ON pages_seo;
CREATE POLICY "rls_pages_seo_read" ON pages_seo FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_pages_seo_admin" ON pages_seo;
CREATE POLICY "rls_pages_seo_admin" ON pages_seo FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- looks
DO $$ BEGIN
  ALTER TABLE looks ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_looks_read" ON looks;
CREATE POLICY "rls_looks_read" ON looks FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_looks_admin" ON looks;
CREATE POLICY "rls_looks_admin" ON looks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- look_products
DO $$ BEGIN
  ALTER TABLE look_products ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_look_products_read" ON look_products;
CREATE POLICY "rls_look_products_read" ON look_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_look_products_admin" ON look_products;
CREATE POLICY "rls_look_products_admin" ON look_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- news_posts
DO $$ BEGIN
  ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_news_posts_read" ON news_posts;
CREATE POLICY "rls_news_posts_read" ON news_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_news_posts_admin" ON news_posts;
CREATE POLICY "rls_news_posts_admin" ON news_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- news_categories
DO $$ BEGIN
  ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_news_categories_read" ON news_categories;
CREATE POLICY "rls_news_categories_read" ON news_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_news_categories_admin" ON news_categories;
CREATE POLICY "rls_news_categories_admin" ON news_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- news_post_categories
DO $$ BEGIN
  ALTER TABLE news_post_categories ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_news_post_categories_read" ON news_post_categories;
CREATE POLICY "rls_news_post_categories_read" ON news_post_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_news_post_categories_admin" ON news_post_categories;
CREATE POLICY "rls_news_post_categories_admin" ON news_post_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- media
DO $$ BEGIN
  ALTER TABLE media ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_media_read" ON media;
CREATE POLICY "rls_media_read" ON media FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_media_admin" ON media;
CREATE POLICY "rls_media_admin" ON media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- live_streams
DO $$ BEGIN
  ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_live_streams_read" ON live_streams;
CREATE POLICY "rls_live_streams_read" ON live_streams FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_streams_admin" ON live_streams;
CREATE POLICY "rls_live_streams_admin" ON live_streams FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- live_chat_messages
DO $$ BEGIN
  ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_live_chat_messages_read" ON live_chat_messages;
CREATE POLICY "rls_live_chat_messages_read" ON live_chat_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_chat_messages_admin" ON live_chat_messages;
CREATE POLICY "rls_live_chat_messages_admin" ON live_chat_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- live_emotions
DO $$ BEGIN
  ALTER TABLE live_emotions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_live_emotions_read" ON live_emotions;
CREATE POLICY "rls_live_emotions_read" ON live_emotions FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_emotions_admin" ON live_emotions;
CREATE POLICY "rls_live_emotions_admin" ON live_emotions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- live_shared_products
DO $$ BEGIN
  ALTER TABLE live_shared_products ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_live_shared_products_read" ON live_shared_products;
CREATE POLICY "rls_live_shared_products_read" ON live_shared_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_shared_products_admin" ON live_shared_products;
CREATE POLICY "rls_live_shared_products_admin" ON live_shared_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- live_viewers
DO $$ BEGIN
  ALTER TABLE live_viewers ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_live_viewers_read" ON live_viewers;
CREATE POLICY "rls_live_viewers_read" ON live_viewers FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_viewers_admin" ON live_viewers;
CREATE POLICY "rls_live_viewers_admin" ON live_viewers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- obs_settings
DO $$ BEGIN
  ALTER TABLE obs_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_obs_settings_admin" ON obs_settings;
CREATE POLICY "rls_obs_settings_admin" ON obs_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- coupons
DO $$ BEGIN
  ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_coupons_read" ON coupons;
CREATE POLICY "rls_coupons_read" ON coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_coupons_admin" ON coupons;
CREATE POLICY "rls_coupons_admin" ON coupons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- coupon_usage
DO $$ BEGIN
  ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_coupon_usage_own" ON coupon_usage;
CREATE POLICY "rls_coupon_usage_own" ON coupon_usage FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- gift_cards
DO $$ BEGIN
  ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_gift_cards_own" ON gift_cards;
CREATE POLICY "rls_gift_cards_own" ON gift_cards FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- gift_card_transactions
DO $$ BEGIN
  ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_gift_card_transactions_own" ON gift_card_transactions;
CREATE POLICY "rls_gift_card_transactions_own" ON gift_card_transactions FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- shipping_methods
DO $$ BEGIN
  ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_shipping_methods_read" ON shipping_methods;
CREATE POLICY "rls_shipping_methods_read" ON shipping_methods FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_shipping_methods_admin" ON shipping_methods;
CREATE POLICY "rls_shipping_methods_admin" ON shipping_methods FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- shipping_rates
DO $$ BEGIN
  ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_shipping_rates_read" ON shipping_rates;
CREATE POLICY "rls_shipping_rates_read" ON shipping_rates FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_shipping_rates_admin" ON shipping_rates;
CREATE POLICY "rls_shipping_rates_admin" ON shipping_rates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- shipping_settings
DO $$ BEGIN
  ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_shipping_settings_read" ON shipping_settings;
CREATE POLICY "rls_shipping_settings_read" ON shipping_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_shipping_settings_admin" ON shipping_settings;
CREATE POLICY "rls_shipping_settings_admin" ON shipping_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- payment_methods
DO $$ BEGIN
  ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_payment_methods_read" ON payment_methods;
CREATE POLICY "rls_payment_methods_read" ON payment_methods FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_payment_methods_admin" ON payment_methods;
CREATE POLICY "rls_payment_methods_admin" ON payment_methods FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- loyalty_tiers
DO $$ BEGIN
  ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_loyalty_tiers_read" ON loyalty_tiers;
CREATE POLICY "rls_loyalty_tiers_read" ON loyalty_tiers FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_loyalty_tiers_admin" ON loyalty_tiers;
CREATE POLICY "rls_loyalty_tiers_admin" ON loyalty_tiers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- loyalty_points
DO $$ BEGIN
  ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_loyalty_points_own" ON loyalty_points;
CREATE POLICY "rls_loyalty_points_own" ON loyalty_points FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- loyalty_euro_transactions
DO $$ BEGIN
  ALTER TABLE loyalty_euro_transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_loyalty_euro_transactions_own" ON loyalty_euro_transactions;
CREATE POLICY "rls_loyalty_euro_transactions_own" ON loyalty_euro_transactions FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- card_flip_games
DO $$ BEGIN
  ALTER TABLE card_flip_games ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_card_flip_games_read" ON card_flip_games;
CREATE POLICY "rls_card_flip_games_read" ON card_flip_games FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_card_flip_games_admin" ON card_flip_games;
CREATE POLICY "rls_card_flip_games_admin" ON card_flip_games FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- card_flip_game_plays
DO $$ BEGIN
  ALTER TABLE card_flip_game_plays ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_card_flip_game_plays_own" ON card_flip_game_plays;
CREATE POLICY "rls_card_flip_game_plays_own" ON card_flip_game_plays FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- card_flip_items
DO $$ BEGIN
  ALTER TABLE card_flip_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_card_flip_items_read" ON card_flip_items;
CREATE POLICY "rls_card_flip_items_read" ON card_flip_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_card_flip_items_admin" ON card_flip_items;
CREATE POLICY "rls_card_flip_items_admin" ON card_flip_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- scratch_card_games
DO $$ BEGIN
  ALTER TABLE scratch_card_games ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_scratch_card_games_read" ON scratch_card_games;
CREATE POLICY "rls_scratch_card_games_read" ON scratch_card_games FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_scratch_card_games_admin" ON scratch_card_games;
CREATE POLICY "rls_scratch_card_games_admin" ON scratch_card_games FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- scratch_game_prizes
DO $$ BEGIN
  ALTER TABLE scratch_game_prizes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_scratch_game_prizes_read" ON scratch_game_prizes;
CREATE POLICY "rls_scratch_game_prizes_read" ON scratch_game_prizes FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_scratch_game_prizes_admin" ON scratch_game_prizes;
CREATE POLICY "rls_scratch_game_prizes_admin" ON scratch_game_prizes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- scratch_game_settings
DO $$ BEGIN
  ALTER TABLE scratch_game_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_scratch_game_settings_read" ON scratch_game_settings;
CREATE POLICY "rls_scratch_game_settings_read" ON scratch_game_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_scratch_game_settings_admin" ON scratch_game_settings;
CREATE POLICY "rls_scratch_game_settings_admin" ON scratch_game_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- wheel_games
DO $$ BEGIN
  ALTER TABLE wheel_games ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_wheel_games_read" ON wheel_games;
CREATE POLICY "rls_wheel_games_read" ON wheel_games FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_wheel_games_admin" ON wheel_games;
CREATE POLICY "rls_wheel_games_admin" ON wheel_games FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- wheel_game_prizes
DO $$ BEGIN
  ALTER TABLE wheel_game_prizes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_wheel_game_prizes_read" ON wheel_game_prizes;
CREATE POLICY "rls_wheel_game_prizes_read" ON wheel_game_prizes FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_wheel_game_prizes_admin" ON wheel_game_prizes;
CREATE POLICY "rls_wheel_game_prizes_admin" ON wheel_game_prizes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- wheel_game_settings
DO $$ BEGIN
  ALTER TABLE wheel_game_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_wheel_game_settings_read" ON wheel_game_settings;
CREATE POLICY "rls_wheel_game_settings_read" ON wheel_game_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_wheel_game_settings_admin" ON wheel_game_settings;
CREATE POLICY "rls_wheel_game_settings_admin" ON wheel_game_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- pending_prizes
DO $$ BEGIN
  ALTER TABLE pending_prizes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_pending_prizes_own" ON pending_prizes;
CREATE POLICY "rls_pending_prizes_own" ON pending_prizes FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- profiles
DO $$ BEGIN
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_profiles_own" ON profiles;
CREATE POLICY "rls_profiles_own" ON profiles FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- addresses
DO $$ BEGIN
  ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_addresses_own" ON addresses;
CREATE POLICY "rls_addresses_own" ON addresses FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- orders
DO $$ BEGIN
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_orders_own" ON orders;
CREATE POLICY "rls_orders_own" ON orders FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- order_items
DO $$ BEGIN
  ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_order_items_own" ON order_items;
CREATE POLICY "rls_order_items_own" ON order_items FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- invoices
DO $$ BEGIN
  ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_invoices_own" ON invoices;
CREATE POLICY "rls_invoices_own" ON invoices FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- cart_items
DO $$ BEGIN
  ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_cart_items_own" ON cart_items;
CREATE POLICY "rls_cart_items_own" ON cart_items FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- open_packages
DO $$ BEGIN
  ALTER TABLE open_packages ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_open_packages_own" ON open_packages;
CREATE POLICY "rls_open_packages_own" ON open_packages FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- open_package_orders
DO $$ BEGIN
  ALTER TABLE open_package_orders ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_open_package_orders_own" ON open_package_orders;
CREATE POLICY "rls_open_package_orders_own" ON open_package_orders FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- return_requests
DO $$ BEGIN
  ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_return_requests_own" ON return_requests;
CREATE POLICY "rls_return_requests_own" ON return_requests FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- shipments
DO $$ BEGIN
  ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_shipments_own" ON shipments;
CREATE POLICY "rls_shipments_own" ON shipments FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- referral_codes
DO $$ BEGIN
  ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_referral_codes_own" ON referral_codes;
CREATE POLICY "rls_referral_codes_own" ON referral_codes FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- referral_uses
DO $$ BEGIN
  ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_referral_uses_own" ON referral_uses;
CREATE POLICY "rls_referral_uses_own" ON referral_uses FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- referrals
DO $$ BEGIN
  ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_referrals_own" ON referrals;
CREATE POLICY "rls_referrals_own" ON referrals FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- customer_reviews
DO $$ BEGIN
  ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_customer_reviews_own" ON customer_reviews;
CREATE POLICY "rls_customer_reviews_own" ON customer_reviews FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- customer_measurements
DO $$ BEGIN
  ALTER TABLE customer_measurements ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_customer_measurements_own" ON customer_measurements;
CREATE POLICY "rls_customer_measurements_own" ON customer_measurements FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- guestbook_entries
DO $$ BEGIN
  ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_guestbook_entries_own" ON guestbook_entries;
CREATE POLICY "rls_guestbook_entries_own" ON guestbook_entries FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- guestbook_hearts
DO $$ BEGIN
  ALTER TABLE guestbook_hearts ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_guestbook_hearts_own" ON guestbook_hearts;
CREATE POLICY "rls_guestbook_hearts_own" ON guestbook_hearts FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ambassador_weekly
DO $$ BEGIN
  ALTER TABLE ambassador_weekly ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_ambassador_weekly_own" ON ambassador_weekly;
CREATE POLICY "rls_ambassador_weekly_own" ON ambassador_weekly FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ambassador_applications
DO $$ BEGIN
  ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_ambassador_applications_own" ON ambassador_applications;
CREATE POLICY "rls_ambassador_applications_own" ON ambassador_applications FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- birthday_vouchers
DO $$ BEGIN
  ALTER TABLE birthday_vouchers ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_birthday_vouchers_own" ON birthday_vouchers;
CREATE POLICY "rls_birthday_vouchers_own" ON birthday_vouchers FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- daily_connection_tracking
DO $$ BEGIN
  ALTER TABLE daily_connection_tracking ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_daily_connection_tracking_own" ON daily_connection_tracking;
CREATE POLICY "rls_daily_connection_tracking_own" ON daily_connection_tracking FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- push_subscriptions
DO $$ BEGIN
  ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_push_subscriptions_own" ON push_subscriptions;
CREATE POLICY "rls_push_subscriptions_own" ON push_subscriptions FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- newsletter_subscriptions
DO $$ BEGIN
  ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_newsletter_subscriptions_insert" ON newsletter_subscriptions;
CREATE POLICY "rls_newsletter_subscriptions_insert" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "rls_newsletter_subscriptions_admin" ON newsletter_subscriptions;
CREATE POLICY "rls_newsletter_subscriptions_admin" ON newsletter_subscriptions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- contact_messages
DO $$ BEGIN
  ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_contact_messages_insert" ON contact_messages;
CREATE POLICY "rls_contact_messages_insert" ON contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "rls_contact_messages_admin" ON contact_messages;
CREATE POLICY "rls_contact_messages_admin" ON contact_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- email_logs
DO $$ BEGIN
  ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_email_logs_admin" ON email_logs;
CREATE POLICY "rls_email_logs_admin" ON email_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- audit_log
DO $$ BEGIN
  ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_audit_log_admin" ON audit_log;
CREATE POLICY "rls_audit_log_admin" ON audit_log FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- system_logs
DO $$ BEGIN
  ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_system_logs_admin" ON system_logs;
CREATE POLICY "rls_system_logs_admin" ON system_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- site_settings
DO $$ BEGIN
  ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_site_settings_read" ON site_settings;
CREATE POLICY "rls_site_settings_read" ON site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_site_settings_admin" ON site_settings;
CREATE POLICY "rls_site_settings_admin" ON site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- related_products
DO $$ BEGIN
  ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_related_products_read" ON related_products;
CREATE POLICY "rls_related_products_read" ON related_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_related_products_admin" ON related_products;
CREATE POLICY "rls_related_products_admin" ON related_products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- store_credit_transactions
DO $$ BEGIN
  ALTER TABLE store_credit_transactions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP POLICY IF EXISTS "rls_store_credit_transactions_own" ON store_credit_transactions;
CREATE POLICY "rls_store_credit_transactions_own" ON store_credit_transactions FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_admin()) WITH CHECK (user_id = auth.uid() OR public.is_admin());

