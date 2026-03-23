-- Fix security definer view issue by recreating as security invoker
CREATE OR REPLACE VIEW public.vehicles_public
WITH (security_invoker = true) AS
  SELECT
    id, user_id, make, model, year, engine, transmission, drivetrain,
    colour, details, mods_text, photos, tags, visibility, is_primary,
    vehicle_type, created_at
  FROM public.vehicles
  WHERE visibility = 'public';