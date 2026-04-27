-- ============================================================================
-- Helper settings — quiet hours + helper reputation columns
-- ============================================================================
-- profiles.available_to_help and profiles.help_radius_miles already exist.
-- This migration adds quiet hours window + helper rating/count fields.
-- All idempotent.
-- ============================================================================

alter table public.profiles
  add column if not exists quiet_hours_start time without time zone default '22:00',
  add column if not exists quiet_hours_end   time without time zone default '07:00',
  add column if not exists helper_rating     numeric(2,1) not null default 0.0,
  add column if not exists helper_count      integer      not null default 0;
