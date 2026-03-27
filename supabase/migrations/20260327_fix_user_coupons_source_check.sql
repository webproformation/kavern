-- Fix: élargir le CHECK constraint sur user_coupons.source
-- pour accepter tous les types de jeux + card_flip_game
ALTER TABLE user_coupons DROP CONSTRAINT IF EXISTS user_coupons_source_check;
ALTER TABLE user_coupons ADD CONSTRAINT user_coupons_source_check
  CHECK (source IN ('wheel', 'scratch', 'card_flip_game', 'referral', 'admin', 'welcome'));
