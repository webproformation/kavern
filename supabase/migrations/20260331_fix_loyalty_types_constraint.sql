-- Fix: élargir le CHECK constraint sur transaction_type
-- Le code utilise 'review', 'order_cashback', 'daily_login' mais le constraint n'acceptait que 6 types

ALTER TABLE loyalty_euro_transactions DROP CONSTRAINT IF EXISTS loyalty_euro_transactions_transaction_type_check;

ALTER TABLE loyalty_euro_transactions ADD CONSTRAINT loyalty_euro_transactions_transaction_type_check
  CHECK (transaction_type IN (
    'daily_connection',
    'daily_login',
    'live_attendance',
    'order_reward',
    'order_cashback',
    'diamond_found',
    'review_posted',
    'review',
    'spent',
    'referral',
    'welcome_bonus'
  ));
