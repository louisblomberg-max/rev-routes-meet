-- 1. Drop the overly permissive event_tickets INSERT policy
DROP POLICY IF EXISTS "Service role can insert tickets" ON event_tickets;

-- 2. Add restricted INSERT policy for event_tickets (only pending status allowed)
CREATE POLICY "Users can insert pending tickets"
  ON event_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 3. Protect sensitive profile columns from direct client writes
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role') != 'service_role' THEN
    NEW.plan := OLD.plan;
    NEW.event_credits := OLD.event_credits;
    NEW.route_credits := OLD.route_credits;
    NEW.free_event_credits := OLD.free_event_credits;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_sensitive_columns_trigger ON profiles;
CREATE TRIGGER protect_profile_sensitive_columns_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_sensitive_columns();

DROP TRIGGER IF EXISTS prevent_plan_update_trigger ON profiles;