-- Migration : Activer RLS sur les tables critiques
-- Date : 26/03/2026
-- Contexte : Audit securite KAVERN — tables sans RLS exposent les donnees entre utilisateurs

-- ============================================
-- ORDERS — Un utilisateur ne voit que ses commandes
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- ORDER_ITEMS — Liees aux commandes de l'utilisateur
-- ============================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access order_items"
  ON order_items FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- PROFILES — Un utilisateur ne voit/modifie que son profil
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- INVOICES — Un utilisateur ne voit que ses factures
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- CART_ITEMS — Un utilisateur ne voit que son panier
-- ============================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access cart_items"
  ON cart_items FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- WALLET_CREDITS + WALLET_TRANSACTIONS — Donnees financieres privees
-- ============================================
ALTER TABLE wallet_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON wallet_credits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access wallet_credits"
  ON wallet_credits FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access wallet_transactions"
  ON wallet_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- LOYALTY_POINTS + LOYALTY_EURO_TRANSACTIONS
-- ============================================
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty"
  ON loyalty_points FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access loyalty_points"
  ON loyalty_points FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE loyalty_euro_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty transactions"
  ON loyalty_euro_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access loyalty_euro_transactions"
  ON loyalty_euro_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- WISHLISTS + WISHLIST_ITEMS
-- ============================================
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlists"
  ON wishlists FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access wishlists"
  ON wishlists FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist items"
  ON wishlist_items FOR ALL
  USING (wishlist_id IN (SELECT id FROM wishlists WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access wishlist_items"
  ON wishlist_items FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- GIFT_CARDS — Visibles par acheteur ou destinataire
-- ============================================
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gift cards"
  ON gift_cards FOR SELECT
  USING (purchaser_id = auth.uid() OR recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Service role full access gift_cards"
  ON gift_cards FOR ALL
  USING (auth.role() = 'service_role');

ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gift card transactions"
  ON gift_card_transactions FOR SELECT
  USING (gift_card_id IN (SELECT id FROM gift_cards WHERE purchaser_id = auth.uid()));

CREATE POLICY "Service role full access gift_card_transactions"
  ON gift_card_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- TABLES PUBLIQUES EN LECTURE (pas de RLS necessaire pour SELECT)
-- products, categories, shipping_rates, shipping_methods, coupons, site_settings
-- home_slides, home_categories, featured_products, news_posts
-- Ces tables restent lisibles par tous (anon + authenticated)
-- ============================================
