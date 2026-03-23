-- Fix 1: Vehicle number plate privacy
-- Drop the existing public read policy
DROP POLICY IF EXISTS "Public vehicles viewable by everyone" ON public.vehicles;

-- Create owner-only read policy on the vehicles table
CREATE POLICY "Owners can read all their own vehicle data including number plate"
  ON public.vehicles FOR SELECT
  USING (auth.uid() = user_id);

-- Create a public view that excludes number_plate
CREATE OR REPLACE VIEW public.vehicles_public AS
  SELECT
    id, user_id, make, model, year, engine, transmission, drivetrain,
    colour, details, mods_text, photos, tags, visibility, is_primary,
    vehicle_type, created_at
  FROM public.vehicles
  WHERE visibility = 'public';

GRANT SELECT ON public.vehicles_public TO anon, authenticated;

-- Fix 2: Remove user-facing UPDATE policy on subscriptions
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;