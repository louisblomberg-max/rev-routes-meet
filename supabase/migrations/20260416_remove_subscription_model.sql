-- Remove subscription model — RevNet is now completely free
-- Only revenue: 5% event ticket commission via Stripe Connect

UPDATE profiles SET plan = 'free' WHERE plan != 'free';
UPDATE subscriptions SET plan = 'free', status = 'active', pending_plan = NULL WHERE plan != 'free';
