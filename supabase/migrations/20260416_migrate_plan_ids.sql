-- Migrate old plan IDs to new plan IDs
-- Old: free, pro, club, organiser → New: free, enthusiast, business
UPDATE profiles SET plan = 'enthusiast' WHERE plan IN ('pro', 'club', 'organiser');
UPDATE subscriptions SET plan = 'enthusiast' WHERE plan IN ('pro', 'club', 'organiser');
UPDATE subscriptions SET pending_plan = 'enthusiast' WHERE pending_plan IN ('pro', 'club', 'organiser');
