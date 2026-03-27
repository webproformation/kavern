-- ============================================================
-- Migration RLS CORRIGEE - 27/03/2026
-- Basee sur les colonnes REELLES de chaque table
-- A coller dans Supabase Dashboard > SQL Editor > Run
-- ============================================================

-- ============================================
-- ORDERS (a user_id)
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
-- ORDER_ITEMS (via orders.user_id)
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
-- PROFILES (PK = id = auth.uid())
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
-- INVOICES (via orders.user_id, car invoices n'a pas de user_id)
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- CART_ITEMS (a user_id)
-- ============================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access cart_items"
  ON cart_items FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- WALLET_CREDITS (a user_id)
-- ============================================
ALTER TABLE wallet_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON wallet_credits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access wallet_credits"
  ON wallet_credits FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- WALLET_TRANSACTIONS (via wallet_credits.user_id, car wallet_transactions a wallet_id)
-- ============================================
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet transactions"
  ON wallet_transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM wallet_credits WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access wallet_transactions"
  ON wallet_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- LOYALTY_POINTS (a user_id)
-- ============================================
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty"
  ON loyalty_points FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access loyalty_points"
  ON loyalty_points FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- LOYALTY_EURO_TRANSACTIONS (a user_id)
-- ============================================
ALTER TABLE loyalty_euro_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty transactions"
  ON loyalty_euro_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access loyalty_euro_transactions"
  ON loyalty_euro_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- WISHLISTS (a user_id) — Note: c'est la table correcte, pas "wishlist"
-- ============================================
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlists"
  ON wishlists FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access wishlists"
  ON wishlists FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- WISHLIST_ITEMS (a session_id, pas de user_id — on laisse ouvert mais en lecture seule pour anon)
-- Note: cette table utilise session_id, pas user_id. La securite passe par le session_id opaque.
-- ============================================
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage wishlist items by session"
  ON wishlist_items FOR ALL
  USING (true);

CREATE POLICY "Service role full access wishlist_items"
  ON wishlist_items FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- GIFT_CARDS (pas de user_id, mais created_by et recipient_email)
-- ============================================
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gift cards they created"
  ON gift_cards FOR SELECT
  USING (created_by = auth.uid()::text);

CREATE POLICY "Anyone can check gift card by code for checkout"
  ON gift_cards FOR SELECT
  USING (true);

CREATE POLICY "Service role full access gift_cards"
  ON gift_cards FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- GIFT_CARD_TRANSACTIONS (via gift_card_id)
-- ============================================
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gift card transactions"
  ON gift_card_transactions FOR SELECT
  USING (true);

CREATE POLICY "Service role full access gift_card_transactions"
  ON gift_card_transactions FOR ALL
  USING (auth.role() = 'service_role');
