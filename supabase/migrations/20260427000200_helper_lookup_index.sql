-- ============================================================================
-- Performance: helper-lookup partial index
-- ============================================================================
-- HelpSheet's notification dispatch path queries:
--   SELECT id, quiet_hours_start, quiet_hours_end FROM profiles
--   WHERE available_to_help = true AND id <> <self>
-- This partial index keeps that query fast as the user count grows.
-- Note: not using CREATE INDEX CONCURRENTLY because Supabase migrations run
-- inside a transaction; CONCURRENTLY would fail to apply.
-- ============================================================================

create index if not exists idx_profiles_available_help_radius
  on public.profiles (available_to_help, help_radius_miles)
  where available_to_help = true;
