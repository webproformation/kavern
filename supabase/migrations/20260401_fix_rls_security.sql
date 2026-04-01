-- =====================================================================
-- MIGRATION RLS COMPLETE — 01/04/2026
-- Supabase Security Alert: tables sans RLS + colonnes sensibles exposees
--
-- Cette migration:
--   1. Active RLS sur TOUTES les tables public (IF NOT EXISTS safe)
--   2. Ajoute des policies adaptees par categorie de table
--   3. Protege les colonnes sensibles (email, phone, tokens, etc.)
--
-- Categories:
--   PUBLIC READ  = SELECT pour tous, write pour service_role uniquement
--   USER-OWNED   = CRUD ses propres lignes, admin/service_role voit tout
--   ADMIN-ONLY   = service_role + admin authentifie uniquement
--   AUTH/SENSIBLE = pas d'acces public, service_role uniquement
-- =====================================================================

-- Helper: fonction pour verifier si un user est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- =====================================================================
-- 1. TABLES CATALOGUE / PUBLIQUES EN LECTURE
--    SELECT pour tous, INSERT/UPDATE/DELETE pour admin + service_role
-- =====================================================================

-- PRODUCTS (deja des policies SELECT publiques, mais pas de RLS actif)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_products_public_read" ON products;
CREATE POLICY "rls_products_public_read" ON products
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_products_admin_write" ON products;
CREATE POLICY "rls_products_admin_write" ON products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_products_service" ON products;
CREATE POLICY "rls_products_service" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- PRODUCT_VARIATIONS
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_product_variations_public_read" ON product_variations;
CREATE POLICY "rls_product_variations_public_read" ON product_variations
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_variations_admin_write" ON product_variations;
CREATE POLICY "rls_product_variations_admin_write" ON product_variations
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_product_variations_service" ON product_variations;
CREATE POLICY "rls_product_variations_service" ON product_variations
  FOR ALL USING (auth.role() = 'service_role');

-- CATEGORIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- Keep existing "Lecture publique categories" policy
DROP POLICY IF EXISTS "rls_categories_admin_write" ON categories;
CREATE POLICY "rls_categories_admin_write" ON categories
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_categories_service" ON categories;
CREATE POLICY "rls_categories_service" ON categories
  FOR ALL USING (auth.role() = 'service_role');

-- PRODUCT_ATTRIBUTES
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_product_attributes_public_read" ON product_attributes;
CREATE POLICY "rls_product_attributes_public_read" ON product_attributes
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_attributes_admin_write" ON product_attributes;
CREATE POLICY "rls_product_attributes_admin_write" ON product_attributes
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_product_attributes_service" ON product_attributes;
CREATE POLICY "rls_product_attributes_service" ON product_attributes
  FOR ALL USING (auth.role() = 'service_role');

-- PRODUCT_ATTRIBUTE_TERMS
ALTER TABLE product_attribute_terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_product_attribute_terms_public_read" ON product_attribute_terms;
CREATE POLICY "rls_product_attribute_terms_public_read" ON product_attribute_terms
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_attribute_terms_admin_write" ON product_attribute_terms;
CREATE POLICY "rls_product_attribute_terms_admin_write" ON product_attribute_terms
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_product_attribute_terms_service" ON product_attribute_terms;
CREATE POLICY "rls_product_attribute_terms_service" ON product_attribute_terms
  FOR ALL USING (auth.role() = 'service_role');

-- PRODUCT_ATTRIBUTE_VALUES
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_product_attribute_values_public_read" ON product_attribute_values;
CREATE POLICY "rls_product_attribute_values_public_read" ON product_attribute_values
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_attribute_values_admin_write" ON product_attribute_values;
CREATE POLICY "rls_product_attribute_values_admin_write" ON product_attribute_values
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_product_attribute_values_service" ON product_attribute_values;
CREATE POLICY "rls_product_attribute_values_service" ON product_attribute_values
  FOR ALL USING (auth.role() = 'service_role');

-- PRODUCT_CATEGORY_MAPPING
ALTER TABLE product_category_mapping ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_product_category_mapping_public_read" ON product_category_mapping;
CREATE POLICY "rls_product_category_mapping_public_read" ON product_category_mapping
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_product_category_mapping_admin_write" ON product_category_mapping;
CREATE POLICY "rls_product_category_mapping_admin_write" ON product_category_mapping
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_product_category_mapping_service" ON product_category_mapping;
CREATE POLICY "rls_product_category_mapping_service" ON product_category_mapping
  FOR ALL USING (auth.role() = 'service_role');

-- RELATED_PRODUCTS
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_related_products_public_read" ON related_products;
CREATE POLICY "rls_related_products_public_read" ON related_products
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_related_products_admin_write" ON related_products;
CREATE POLICY "rls_related_products_admin_write" ON related_products
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_related_products_service" ON related_products;
CREATE POLICY "rls_related_products_service" ON related_products
  FOR ALL USING (auth.role() = 'service_role');

-- FEATURED_PRODUCTS
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_featured_products_public_read" ON featured_products;
CREATE POLICY "rls_featured_products_public_read" ON featured_products
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_featured_products_admin_write" ON featured_products;
CREATE POLICY "rls_featured_products_admin_write" ON featured_products
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_featured_products_service" ON featured_products;
CREATE POLICY "rls_featured_products_service" ON featured_products
  FOR ALL USING (auth.role() = 'service_role');

-- PRODUCT_AVAILABILITY_NOTIFICATIONS (public insert for email alerts)
ALTER TABLE product_availability_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_product_notif_public_insert" ON product_availability_notifications;
CREATE POLICY "rls_product_notif_public_insert" ON product_availability_notifications
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "rls_product_notif_admin_read" ON product_availability_notifications;
CREATE POLICY "rls_product_notif_admin_read" ON product_availability_notifications
  FOR SELECT TO authenticated
  USING (public.is_admin());
DROP POLICY IF EXISTS "rls_product_notif_service" ON product_availability_notifications;
CREATE POLICY "rls_product_notif_service" ON product_availability_notifications
  FOR ALL USING (auth.role() = 'service_role');

-- LOOKS
ALTER TABLE looks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_looks_public_read" ON looks;
CREATE POLICY "rls_looks_public_read" ON looks
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_looks_admin_write" ON looks;
CREATE POLICY "rls_looks_admin_write" ON looks
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_looks_service" ON looks;
CREATE POLICY "rls_looks_service" ON looks
  FOR ALL USING (auth.role() = 'service_role');

-- LOOK_PRODUCTS
ALTER TABLE look_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_look_products_public_read" ON look_products;
CREATE POLICY "rls_look_products_public_read" ON look_products
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_look_products_admin_write" ON look_products;
CREATE POLICY "rls_look_products_admin_write" ON look_products
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_look_products_service" ON look_products;
CREATE POLICY "rls_look_products_service" ON look_products
  FOR ALL USING (auth.role() = 'service_role');

-- SLIDES
  FOR SELECT USING (true);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- HOME_SLIDES
ALTER TABLE home_slides ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_home_slides_public_read" ON home_slides;
CREATE POLICY "rls_home_slides_public_read" ON home_slides
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_home_slides_admin_write" ON home_slides;
CREATE POLICY "rls_home_slides_admin_write" ON home_slides
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_home_slides_service" ON home_slides;
CREATE POLICY "rls_home_slides_service" ON home_slides
  FOR ALL USING (auth.role() = 'service_role');

-- HOME_CATEGORIES
ALTER TABLE home_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_home_categories_public_read" ON home_categories;
CREATE POLICY "rls_home_categories_public_read" ON home_categories
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_home_categories_admin_write" ON home_categories;
CREATE POLICY "rls_home_categories_admin_write" ON home_categories
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_home_categories_service" ON home_categories;
CREATE POLICY "rls_home_categories_service" ON home_categories
  FOR ALL USING (auth.role() = 'service_role');

-- MEDIA
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_media_public_read" ON media;
CREATE POLICY "rls_media_public_read" ON media
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_media_admin_write" ON media;
CREATE POLICY "rls_media_admin_write" ON media
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_media_service" ON media;
CREATE POLICY "rls_media_service" ON media
  FOR ALL USING (auth.role() = 'service_role');

-- MEDIA_LIBRARY
  FOR SELECT USING (true);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- SHIPPING_METHODS
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_shipping_methods_public_read" ON shipping_methods;
CREATE POLICY "rls_shipping_methods_public_read" ON shipping_methods
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_shipping_methods_admin_write" ON shipping_methods;
CREATE POLICY "rls_shipping_methods_admin_write" ON shipping_methods
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_shipping_methods_service" ON shipping_methods;
CREATE POLICY "rls_shipping_methods_service" ON shipping_methods
  FOR ALL USING (auth.role() = 'service_role');

-- SHIPPING_RATES
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_shipping_rates_public_read" ON shipping_rates;
CREATE POLICY "rls_shipping_rates_public_read" ON shipping_rates
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_shipping_rates_admin_write" ON shipping_rates;
CREATE POLICY "rls_shipping_rates_admin_write" ON shipping_rates
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_shipping_rates_service" ON shipping_rates;
CREATE POLICY "rls_shipping_rates_service" ON shipping_rates
  FOR ALL USING (auth.role() = 'service_role');

-- PAYMENT_METHODS (config publique pour checkout)
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_payment_methods_public_read" ON payment_methods;
CREATE POLICY "rls_payment_methods_public_read" ON payment_methods
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_payment_methods_admin_write" ON payment_methods;
CREATE POLICY "rls_payment_methods_admin_write" ON payment_methods
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_payment_methods_service" ON payment_methods;
CREATE POLICY "rls_payment_methods_service" ON payment_methods
  FOR ALL USING (auth.role() = 'service_role');

-- SEO_METADATA
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_seo_metadata_public_read" ON seo_metadata;
CREATE POLICY "rls_seo_metadata_public_read" ON seo_metadata
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_seo_metadata_admin_write" ON seo_metadata;
CREATE POLICY "rls_seo_metadata_admin_write" ON seo_metadata
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_seo_metadata_service" ON seo_metadata;
CREATE POLICY "rls_seo_metadata_service" ON seo_metadata
  FOR ALL USING (auth.role() = 'service_role');

-- LOYALTY_TIERS (public reference data)
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_loyalty_tiers_public_read" ON loyalty_tiers;
CREATE POLICY "rls_loyalty_tiers_public_read" ON loyalty_tiers
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_loyalty_tiers_admin_write" ON loyalty_tiers;
CREATE POLICY "rls_loyalty_tiers_admin_write" ON loyalty_tiers
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_loyalty_tiers_service" ON loyalty_tiers;
CREATE POLICY "rls_loyalty_tiers_service" ON loyalty_tiers
  FOR ALL USING (auth.role() = 'service_role');

-- CUSTOMER_REVIEWS (public read for published reviews)
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
-- Already has "Lecture publique customer_reviews" SELECT policy
DROP POLICY IF EXISTS "rls_customer_reviews_insert_own" ON customer_reviews;
CREATE POLICY "rls_customer_reviews_insert_own" ON customer_reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_customer_reviews_admin_write" ON customer_reviews;
CREATE POLICY "rls_customer_reviews_admin_write" ON customer_reviews
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_customer_reviews_service" ON customer_reviews;
CREATE POLICY "rls_customer_reviews_service" ON customer_reviews
  FOR ALL USING (auth.role() = 'service_role');

-- WOOCOMMERCE_CACHE (public product data cache)
  FOR SELECT USING (true);
  FOR ALL USING (auth.role() = 'service_role');

-- WOOCOMMERCE_CATEGORIES_CACHE
  FOR SELECT USING (true);
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- 2. LIVE STREAMING — Public read, authenticated interact, admin manage
-- =====================================================================

-- LIVE_SESSIONS
  FOR SELECT USING (true);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- LIVE_CHAPTERS
  FOR SELECT USING (true);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- LIVE_SHARED_PRODUCTS
ALTER TABLE live_shared_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_live_shared_products_public_read" ON live_shared_products;
CREATE POLICY "rls_live_shared_products_public_read" ON live_shared_products
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_shared_products_admin_write" ON live_shared_products;
CREATE POLICY "rls_live_shared_products_admin_write" ON live_shared_products
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_live_shared_products_service" ON live_shared_products;
CREATE POLICY "rls_live_shared_products_service" ON live_shared_products
  FOR ALL USING (auth.role() = 'service_role');

-- LIVE_CHAT_MESSAGES (public read, authenticated insert own)
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_live_chat_messages_public_read" ON live_chat_messages;
CREATE POLICY "rls_live_chat_messages_public_read" ON live_chat_messages
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_chat_messages_insert_own" ON live_chat_messages;
CREATE POLICY "rls_live_chat_messages_insert_own" ON live_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_live_chat_messages_admin_write" ON live_chat_messages;
CREATE POLICY "rls_live_chat_messages_admin_write" ON live_chat_messages
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_live_chat_messages_service" ON live_chat_messages;
CREATE POLICY "rls_live_chat_messages_service" ON live_chat_messages
  FOR ALL USING (auth.role() = 'service_role');

-- LIVE_EMOTIONS (public read, authenticated insert own)
ALTER TABLE live_emotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_live_emotions_public_read" ON live_emotions;
CREATE POLICY "rls_live_emotions_public_read" ON live_emotions
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_emotions_insert_own" ON live_emotions;
CREATE POLICY "rls_live_emotions_insert_own" ON live_emotions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_live_emotions_service" ON live_emotions;
CREATE POLICY "rls_live_emotions_service" ON live_emotions
  FOR ALL USING (auth.role() = 'service_role');

-- LIVE_VIEWERS (authenticated can manage own presence)
ALTER TABLE live_viewers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_live_viewers_public_read" ON live_viewers;
CREATE POLICY "rls_live_viewers_public_read" ON live_viewers
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_live_viewers_manage_own" ON live_viewers;
CREATE POLICY "rls_live_viewers_manage_own" ON live_viewers
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_live_viewers_service" ON live_viewers;
CREATE POLICY "rls_live_viewers_service" ON live_viewers
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- 3. USER-OWNED TABLES — user voit/modifie ses propres lignes
-- =====================================================================

-- PROFILES (deja des policies SELECT/UPDATE mais pas de RLS actif dans le dump)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Existing policies: "Users can read own profile", "Users can update own profile"
DROP POLICY IF EXISTS "rls_profiles_admin_read" ON profiles;
CREATE POLICY "rls_profiles_admin_read" ON profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());
DROP POLICY IF EXISTS "rls_profiles_admin_write" ON profiles;
CREATE POLICY "rls_profiles_admin_write" ON profiles
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_profiles_service" ON profiles;
CREATE POLICY "rls_profiles_service" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- USER_PROFILES (SENSIBLE: contient email, phone, wallet_balance, is_admin)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_user_profiles_read_own" ON user_profiles;
CREATE POLICY "rls_user_profiles_read_own" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "rls_user_profiles_update_own" ON user_profiles;
CREATE POLICY "rls_user_profiles_update_own" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "rls_user_profiles_admin" ON user_profiles;
CREATE POLICY "rls_user_profiles_admin" ON user_profiles
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_user_profiles_service" ON user_profiles;
CREATE POLICY "rls_user_profiles_service" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- USER_ROLES (SENSIBLE: controle les roles admin/customer)
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- ORDERS (a user_id — deja des policies dans migration precedente)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_orders_admin" ON orders;
CREATE POLICY "rls_orders_admin" ON orders
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_orders_service" ON orders;
CREATE POLICY "rls_orders_service" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- ORDER_ITEMS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_order_items_admin" ON order_items;
CREATE POLICY "rls_order_items_admin" ON order_items
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_order_items_service" ON order_items;
CREATE POLICY "rls_order_items_service" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- INVOICES (via order_id — deja policy dans migration precedente)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_invoices_admin" ON invoices;
CREATE POLICY "rls_invoices_admin" ON invoices
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_invoices_service" ON invoices;
CREATE POLICY "rls_invoices_service" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

-- CART_ITEMS (a user_id)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
-- Already has "Users can manage own cart" policy from previous migration
DROP POLICY IF EXISTS "rls_cart_items_service" ON cart_items;
CREATE POLICY "rls_cart_items_service" ON cart_items
  FOR ALL USING (auth.role() = 'service_role');

-- WISHLISTS (a user_id)
-- Already has policies from previous migration

-- WISHLIST_ITEMS (session-based)
-- Already has policies from previous migration

-- WALLET_CREDITS (SENSIBLE: solde financier)
-- Already has policies from previous migration
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- WALLET_TRANSACTIONS (SENSIBLE: historique financier)
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
-- Already has policies from previous migration
DROP POLICY IF EXISTS "rls_wallet_transactions_admin" ON wallet_transactions;
CREATE POLICY "rls_wallet_transactions_admin" ON wallet_transactions
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STORE_CREDITS (SENSIBLE: a user_id + balance)
ALTER TABLE store_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_store_credits_read_own" ON store_credits;
CREATE POLICY "rls_store_credits_read_own" ON store_credits
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_store_credits_admin" ON store_credits;
CREATE POLICY "rls_store_credits_admin" ON store_credits
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_store_credits_service" ON store_credits;
CREATE POLICY "rls_store_credits_service" ON store_credits
  FOR ALL USING (auth.role() = 'service_role');

-- STORE_CREDIT_TRANSACTIONS (SENSIBLE: a user_id)
ALTER TABLE store_credit_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_store_credit_transactions_read_own" ON store_credit_transactions;
CREATE POLICY "rls_store_credit_transactions_read_own" ON store_credit_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_store_credit_transactions_admin" ON store_credit_transactions;
CREATE POLICY "rls_store_credit_transactions_admin" ON store_credit_transactions
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_store_credit_transactions_service" ON store_credit_transactions;
CREATE POLICY "rls_store_credit_transactions_service" ON store_credit_transactions
  FOR ALL USING (auth.role() = 'service_role');

-- LOYALTY_POINTS (a user_id)
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
-- Already has policies from previous migration

-- CUSTOMER_MEASUREMENTS (SENSIBLE: donnees corporelles, a user_id)
ALTER TABLE customer_measurements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_customer_measurements_read_own" ON customer_measurements;
CREATE POLICY "rls_customer_measurements_read_own" ON customer_measurements
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_customer_measurements_manage_own" ON customer_measurements;
CREATE POLICY "rls_customer_measurements_manage_own" ON customer_measurements
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_customer_measurements_admin" ON customer_measurements;
CREATE POLICY "rls_customer_measurements_admin" ON customer_measurements
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_customer_measurements_service" ON customer_measurements;
CREATE POLICY "rls_customer_measurements_service" ON customer_measurements
  FOR ALL USING (auth.role() = 'service_role');

-- RETURN_REQUESTS (a user_id)
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_return_requests_read_own" ON return_requests;
CREATE POLICY "rls_return_requests_read_own" ON return_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_return_requests_insert_own" ON return_requests;
CREATE POLICY "rls_return_requests_insert_own" ON return_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_return_requests_admin" ON return_requests;
CREATE POLICY "rls_return_requests_admin" ON return_requests
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_return_requests_service" ON return_requests;
CREATE POLICY "rls_return_requests_service" ON return_requests
  FOR ALL USING (auth.role() = 'service_role');

-- RETURN_ITEMS (via return_requests)
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_return_items_read_own" ON return_items;
CREATE POLICY "rls_return_items_read_own" ON return_items
  FOR SELECT TO authenticated
  USING (return_id IN (SELECT id FROM return_requests WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "rls_return_items_insert_own" ON return_items;
CREATE POLICY "rls_return_items_insert_own" ON return_items
  FOR INSERT TO authenticated
  WITH CHECK (return_id IN (SELECT id FROM return_requests WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "rls_return_items_admin" ON return_items;
CREATE POLICY "rls_return_items_admin" ON return_items
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_return_items_service" ON return_items;
CREATE POLICY "rls_return_items_service" ON return_items
  FOR ALL USING (auth.role() = 'service_role');

-- SHIPMENTS (via order_id)
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_shipments_read_own" ON shipments;
CREATE POLICY "rls_shipments_read_own" ON shipments
  FOR SELECT TO authenticated
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "rls_shipments_admin" ON shipments;
CREATE POLICY "rls_shipments_admin" ON shipments
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_shipments_service" ON shipments;
CREATE POLICY "rls_shipments_service" ON shipments
  FOR ALL USING (auth.role() = 'service_role');

-- DELIVERY_BATCHES (a user_id)
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- OPEN_PACKAGES (a user_id)
ALTER TABLE open_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_open_packages_read_own" ON open_packages;
CREATE POLICY "rls_open_packages_read_own" ON open_packages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_open_packages_manage_own" ON open_packages;
CREATE POLICY "rls_open_packages_manage_own" ON open_packages
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_open_packages_admin" ON open_packages;
CREATE POLICY "rls_open_packages_admin" ON open_packages
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_open_packages_service" ON open_packages;
CREATE POLICY "rls_open_packages_service" ON open_packages
  FOR ALL USING (auth.role() = 'service_role');

-- OPEN_PACKAGE_ORDERS (via open_packages)
ALTER TABLE open_package_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_open_package_orders_read_own" ON open_package_orders;
CREATE POLICY "rls_open_package_orders_read_own" ON open_package_orders
  FOR SELECT TO authenticated
  USING (open_package_id IN (SELECT id FROM open_packages WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "rls_open_package_orders_admin" ON open_package_orders;
CREATE POLICY "rls_open_package_orders_admin" ON open_package_orders
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_open_package_orders_service" ON open_package_orders;
CREATE POLICY "rls_open_package_orders_service" ON open_package_orders
  FOR ALL USING (auth.role() = 'service_role');

-- REFERRAL_CODES (a user_id)
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_referral_codes_read_own" ON referral_codes;
CREATE POLICY "rls_referral_codes_read_own" ON referral_codes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_referral_codes_manage_own" ON referral_codes;
CREATE POLICY "rls_referral_codes_manage_own" ON referral_codes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_referral_codes_admin" ON referral_codes;
CREATE POLICY "rls_referral_codes_admin" ON referral_codes
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_referral_codes_service" ON referral_codes;
CREATE POLICY "rls_referral_codes_service" ON referral_codes
  FOR ALL USING (auth.role() = 'service_role');

-- REFERRAL_USES (a sponsor_id + referred_user_id)
ALTER TABLE referral_uses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_referral_uses_read_own" ON referral_uses;
CREATE POLICY "rls_referral_uses_read_own" ON referral_uses
  FOR SELECT TO authenticated
  USING (auth.uid() = sponsor_id OR auth.uid() = referred_user_id);
DROP POLICY IF EXISTS "rls_referral_uses_admin" ON referral_uses;
CREATE POLICY "rls_referral_uses_admin" ON referral_uses
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_referral_uses_service" ON referral_uses;
CREATE POLICY "rls_referral_uses_service" ON referral_uses
  FOR ALL USING (auth.role() = 'service_role');

-- REFERRALS (a referrer_id + referred_id)
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_referrals_read_own" ON referrals;
CREATE POLICY "rls_referrals_read_own" ON referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
DROP POLICY IF EXISTS "rls_referrals_admin" ON referrals;
CREATE POLICY "rls_referrals_admin" ON referrals
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_referrals_service" ON referrals;
CREATE POLICY "rls_referrals_service" ON referrals
  FOR ALL USING (auth.role() = 'service_role');

-- AMBASSADOR_APPLICATIONS (a user_id)
ALTER TABLE ambassador_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_ambassador_read_own" ON ambassador_applications;
CREATE POLICY "rls_ambassador_read_own" ON ambassador_applications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_ambassador_insert_own" ON ambassador_applications;
CREATE POLICY "rls_ambassador_insert_own" ON ambassador_applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_ambassador_admin" ON ambassador_applications;
CREATE POLICY "rls_ambassador_admin" ON ambassador_applications
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_ambassador_service" ON ambassador_applications;
CREATE POLICY "rls_ambassador_service" ON ambassador_applications
  FOR ALL USING (auth.role() = 'service_role');

-- BIRTHDAY_VOUCHERS (SENSIBLE: a user_id + code coupon)
ALTER TABLE birthday_vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_birthday_vouchers_read_own" ON birthday_vouchers;
CREATE POLICY "rls_birthday_vouchers_read_own" ON birthday_vouchers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_birthday_vouchers_admin" ON birthday_vouchers;
CREATE POLICY "rls_birthday_vouchers_admin" ON birthday_vouchers
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_birthday_vouchers_service" ON birthday_vouchers;
CREATE POLICY "rls_birthday_vouchers_service" ON birthday_vouchers
  FOR ALL USING (auth.role() = 'service_role');

-- PENDING_PRIZES (SENSIBLE: a user_id + email + prize data)
ALTER TABLE pending_prizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_pending_prizes_read_own" ON pending_prizes;
CREATE POLICY "rls_pending_prizes_read_own" ON pending_prizes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_pending_prizes_admin" ON pending_prizes;
CREATE POLICY "rls_pending_prizes_admin" ON pending_prizes
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_pending_prizes_service" ON pending_prizes;
CREATE POLICY "rls_pending_prizes_service" ON pending_prizes
  FOR ALL USING (auth.role() = 'service_role');

-- DAILY_CONNECTION_TRACKING (a user_id)
ALTER TABLE daily_connection_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_daily_connection_read_own" ON daily_connection_tracking;
CREATE POLICY "rls_daily_connection_read_own" ON daily_connection_tracking
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_daily_connection_insert_own" ON daily_connection_tracking;
CREATE POLICY "rls_daily_connection_insert_own" ON daily_connection_tracking
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_daily_connection_admin" ON daily_connection_tracking;
CREATE POLICY "rls_daily_connection_admin" ON daily_connection_tracking
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_daily_connection_service" ON daily_connection_tracking;
CREATE POLICY "rls_daily_connection_service" ON daily_connection_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- PUSH_SUBSCRIPTIONS (a user_id — SENSIBLE: subscription_data contient push tokens)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_push_subscriptions_manage_own" ON push_subscriptions;
CREATE POLICY "rls_push_subscriptions_manage_own" ON push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "rls_push_subscriptions_admin" ON push_subscriptions;
CREATE POLICY "rls_push_subscriptions_admin" ON push_subscriptions
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_push_subscriptions_service" ON push_subscriptions;
CREATE POLICY "rls_push_subscriptions_service" ON push_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- LIVRE_DOR (guestbook — public read, authenticated insert)
  FOR SELECT USING (true);
  FOR INSERT TO authenticated
  WITH CHECK (true);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- 4. GAMES — Public read settings/prizes, authenticated play
-- =====================================================================

-- CARD_FLIP_ITEMS (public read for game display)
ALTER TABLE card_flip_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_card_flip_items_public_read" ON card_flip_items;
CREATE POLICY "rls_card_flip_items_public_read" ON card_flip_items
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_card_flip_items_admin" ON card_flip_items;
CREATE POLICY "rls_card_flip_items_admin" ON card_flip_items
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_card_flip_items_service" ON card_flip_items;
CREATE POLICY "rls_card_flip_items_service" ON card_flip_items
  FOR ALL USING (auth.role() = 'service_role');

-- SCRATCH_CARD_GAMES
ALTER TABLE scratch_card_games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_scratch_card_games_public_read" ON scratch_card_games;
CREATE POLICY "rls_scratch_card_games_public_read" ON scratch_card_games
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_scratch_card_games_admin" ON scratch_card_games;
CREATE POLICY "rls_scratch_card_games_admin" ON scratch_card_games
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_scratch_card_games_service" ON scratch_card_games;
CREATE POLICY "rls_scratch_card_games_service" ON scratch_card_games
  FOR ALL USING (auth.role() = 'service_role');

-- SCRATCH_GAME_PRIZES
ALTER TABLE scratch_game_prizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_scratch_game_prizes_public_read" ON scratch_game_prizes;
CREATE POLICY "rls_scratch_game_prizes_public_read" ON scratch_game_prizes
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_scratch_game_prizes_admin" ON scratch_game_prizes;
CREATE POLICY "rls_scratch_game_prizes_admin" ON scratch_game_prizes
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_scratch_game_prizes_service" ON scratch_game_prizes;
CREATE POLICY "rls_scratch_game_prizes_service" ON scratch_game_prizes
  FOR ALL USING (auth.role() = 'service_role');

-- SCRATCH_GAME_SETTINGS
ALTER TABLE scratch_game_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_scratch_game_settings_public_read" ON scratch_game_settings;
CREATE POLICY "rls_scratch_game_settings_public_read" ON scratch_game_settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_scratch_game_settings_admin" ON scratch_game_settings;
CREATE POLICY "rls_scratch_game_settings_admin" ON scratch_game_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_scratch_game_settings_service" ON scratch_game_settings;
CREATE POLICY "rls_scratch_game_settings_service" ON scratch_game_settings
  FOR ALL USING (auth.role() = 'service_role');

-- WHEEL_GAMES
ALTER TABLE wheel_games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_wheel_games_public_read" ON wheel_games;
CREATE POLICY "rls_wheel_games_public_read" ON wheel_games
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_wheel_games_admin" ON wheel_games;
CREATE POLICY "rls_wheel_games_admin" ON wheel_games
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_wheel_games_service" ON wheel_games;
CREATE POLICY "rls_wheel_games_service" ON wheel_games
  FOR ALL USING (auth.role() = 'service_role');

-- WHEEL_GAME_PRIZES
ALTER TABLE wheel_game_prizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_wheel_game_prizes_public_read" ON wheel_game_prizes;
CREATE POLICY "rls_wheel_game_prizes_public_read" ON wheel_game_prizes
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_wheel_game_prizes_admin" ON wheel_game_prizes;
CREATE POLICY "rls_wheel_game_prizes_admin" ON wheel_game_prizes
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_wheel_game_prizes_service" ON wheel_game_prizes;
CREATE POLICY "rls_wheel_game_prizes_service" ON wheel_game_prizes
  FOR ALL USING (auth.role() = 'service_role');

-- WHEEL_GAME_SETTINGS
ALTER TABLE wheel_game_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_wheel_game_settings_public_read" ON wheel_game_settings;
CREATE POLICY "rls_wheel_game_settings_public_read" ON wheel_game_settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "rls_wheel_game_settings_admin" ON wheel_game_settings;
CREATE POLICY "rls_wheel_game_settings_admin" ON wheel_game_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_wheel_game_settings_service" ON wheel_game_settings;
CREATE POLICY "rls_wheel_game_settings_service" ON wheel_game_settings
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- 5. ADMIN-ONLY TABLES — service_role + admin uniquement
-- =====================================================================

-- SITE_SETTINGS (admin config)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_site_settings_public_read" ON site_settings;
CREATE POLICY "rls_site_settings_public_read" ON site_settings
  FOR SELECT USING (true);  -- Top bar text needs public read
DROP POLICY IF EXISTS "rls_site_settings_admin_write" ON site_settings;
CREATE POLICY "rls_site_settings_admin_write" ON site_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_site_settings_service" ON site_settings;
CREATE POLICY "rls_site_settings_service" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- SHIPPING_SETTINGS (admin config)
ALTER TABLE shipping_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_shipping_settings_public_read" ON shipping_settings;
CREATE POLICY "rls_shipping_settings_public_read" ON shipping_settings
  FOR SELECT USING (true);  -- Needed for checkout
DROP POLICY IF EXISTS "rls_shipping_settings_admin_write" ON shipping_settings;
CREATE POLICY "rls_shipping_settings_admin_write" ON shipping_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_shipping_settings_service" ON shipping_settings;
CREATE POLICY "rls_shipping_settings_service" ON shipping_settings
  FOR ALL USING (auth.role() = 'service_role');

-- SYSTEM_LOGS (admin only — ZERO public access)
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_system_logs_admin" ON system_logs;
CREATE POLICY "rls_system_logs_admin" ON system_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());
DROP POLICY IF EXISTS "rls_system_logs_service" ON system_logs;
CREATE POLICY "rls_system_logs_service" ON system_logs
  FOR ALL USING (auth.role() = 'service_role');

-- PUSH_NOTIFICATIONS (admin only)
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_push_notifications_admin" ON push_notifications;
CREATE POLICY "rls_push_notifications_admin" ON push_notifications
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_push_notifications_service" ON push_notifications;
CREATE POLICY "rls_push_notifications_service" ON push_notifications
  FOR ALL USING (auth.role() = 'service_role');

-- OBS_SETTINGS (SENSIBLE: contient stream_key — admin only)
ALTER TABLE obs_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_obs_settings_admin" ON obs_settings;
CREATE POLICY "rls_obs_settings_admin" ON obs_settings
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_obs_settings_service" ON obs_settings;
CREATE POLICY "rls_obs_settings_service" ON obs_settings
  FOR ALL USING (auth.role() = 'service_role');

-- LIVE_STREAM_ANALYTICS (admin only)
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- ANALYTICS_SESSIONS (admin only — contient user tracking data)
  FOR SELECT TO authenticated
  USING (public.is_admin());
  FOR INSERT WITH CHECK (true);  -- Allow tracking insert from anon
  FOR ALL USING (auth.role() = 'service_role');

-- PAGE_VISITS (admin only — contient user tracking data)
  FOR SELECT TO authenticated
  USING (public.is_admin());
  FOR INSERT WITH CHECK (true);  -- Allow tracking insert from anon
  FOR ALL USING (auth.role() = 'service_role');

-- EMAIL_LOGS (admin only — contient historique emails)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_email_logs_admin" ON email_logs;
CREATE POLICY "rls_email_logs_admin" ON email_logs
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_email_logs_service" ON email_logs;
CREATE POLICY "rls_email_logs_service" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================================
-- 6. SENSITIVE DATA TABLES — strict access
-- =====================================================================

-- CONTACT_MESSAGES (SENSIBLE: contient email + nom + message)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_contact_messages_public_insert" ON contact_messages;
CREATE POLICY "rls_contact_messages_public_insert" ON contact_messages
  FOR INSERT WITH CHECK (true);  -- Anyone can submit contact form
DROP POLICY IF EXISTS "rls_contact_messages_admin" ON contact_messages;
CREATE POLICY "rls_contact_messages_admin" ON contact_messages
  FOR SELECT TO authenticated
  USING (public.is_admin());
DROP POLICY IF EXISTS "rls_contact_messages_admin_manage" ON contact_messages;
CREATE POLICY "rls_contact_messages_admin_manage" ON contact_messages
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_contact_messages_service" ON contact_messages;
CREATE POLICY "rls_contact_messages_service" ON contact_messages
  FOR ALL USING (auth.role() = 'service_role');

-- NEWSLETTER_SUBSCRIPTIONS (SENSIBLE: contient emails)
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rls_newsletter_public_insert" ON newsletter_subscriptions;
CREATE POLICY "rls_newsletter_public_insert" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);  -- Anyone can subscribe
DROP POLICY IF EXISTS "rls_newsletter_admin" ON newsletter_subscriptions;
CREATE POLICY "rls_newsletter_admin" ON newsletter_subscriptions
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "rls_newsletter_service" ON newsletter_subscriptions;
CREATE POLICY "rls_newsletter_service" ON newsletter_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- COOKIE_CONSENT_LOGS (SENSIBLE: contient user tracking + consent data)
  FOR INSERT WITH CHECK (true);  -- Anyone can log consent
  FOR SELECT TO authenticated
  USING (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- USER_SESSIONS (SENSIBLE: contient session tracking)
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
  FOR ALL USING (auth.role() = 'service_role');

-- GIFT_CARDS (re-enable — already has RLS + policies from previous migration)
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 7. TABLES DEJA COUVERTES PAR MIGRATIONS PRECEDENTES
--    On s'assure juste que ENABLE RLS est bien actif
-- =====================================================================

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_flip_game_plays ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_flip_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE "livre-dor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_euro_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- VERIFICATION: Lister les tables qui n'auraient PAS RLS apres cette migration
-- (a executer separement pour debug)
-- =====================================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND rowsecurity = false
-- ORDER BY tablename;
