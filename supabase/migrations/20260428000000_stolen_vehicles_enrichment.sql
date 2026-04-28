-- ============================================================================
-- Stolen vehicles enrichment — add structured fields, search/nearby RPCs
-- ============================================================================
-- Existing stolen_vehicle_alerts has only: id, user_id, vehicle_id, description,
-- last_seen_lat/lng, status, created_at. This migration adds the structured
-- fields the new community StolenVehicles UI needs (reg, make, model, year,
-- colour, police_reference, date_stolen, reward, contact phone, photos).
-- All idempotent (add column if not exists).
-- ============================================================================

-- ── Columns ──
alter table public.stolen_vehicle_alerts
  add column if not exists registration_plate text,
  add column if not exists make               text,
  add column if not exists model              text,
  add column if not exists year               integer,
  add column if not exists colour             text,
  add column if not exists police_reference   text,
  add column if not exists date_stolen        timestamptz,
  add column if not exists reward_amount      integer not null default 0,
  add column if not exists contact_phone      text,
  add column if not exists photos             text[] default '{}';

-- ── Indexes ──
create index if not exists idx_stolen_vehicle_alerts_active_created
  on public.stolen_vehicle_alerts (created_at desc)
  where status = 'active';

create index if not exists idx_stolen_vehicle_alerts_reg_lower
  on public.stolen_vehicle_alerts (lower(registration_plate))
  where status = 'active';

-- ── RLS: ensure public can read active alerts ──
-- Community alerts are intentionally public so anyone can spot a vehicle.
-- Phone numbers are exposed only via direct row read; the nearby RPC excludes them.
alter table public.stolen_vehicle_alerts enable row level security;

drop policy if exists "Public can read active stolen vehicle alerts" on public.stolen_vehicle_alerts;
create policy "Public can read active stolen vehicle alerts"
  on public.stolen_vehicle_alerts
  for select
  to authenticated
  using (status = 'active' or user_id = auth.uid());

drop policy if exists "Users can insert their own stolen vehicle alerts" on public.stolen_vehicle_alerts;
create policy "Users can insert their own stolen vehicle alerts"
  on public.stolen_vehicle_alerts
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own stolen vehicle alerts" on public.stolen_vehicle_alerts;
create policy "Users can update their own stolen vehicle alerts"
  on public.stolen_vehicle_alerts
  for update
  to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- RPC: get_stolen_vehicles_nearby
-- Returns active stolen vehicle alerts within max_distance_km of a coordinate,
-- ordered by distance ascending. Excludes phone (privacy).
-- ============================================================================
create or replace function public.get_stolen_vehicles_nearby(
  user_lat numeric,
  user_lng numeric,
  max_distance_km numeric default 50
)
returns table (
  alert_id            uuid,
  registration_plate  text,
  make                text,
  model               text,
  year                integer,
  colour              text,
  description         text,
  police_reference    text,
  date_stolen         timestamptz,
  reward_amount       integer,
  photos              text[],
  reported_by_name    text,
  distance_km         numeric,
  created_at          timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with d as (
    select
      a.*,
      6371 * acos(
        greatest(-1, least(1,
          cos(radians(user_lat)) * cos(radians(a.last_seen_lat))
          * cos(radians(a.last_seen_lng) - radians(user_lng))
          + sin(radians(user_lat)) * sin(radians(a.last_seen_lat))
        ))
      ) as distance_km
    from public.stolen_vehicle_alerts a
    where a.status = 'active'
      and a.last_seen_lat is not null
      and a.last_seen_lng is not null
  )
  select
    d.id                                   as alert_id,
    d.registration_plate,
    d.make,
    d.model,
    d.year,
    d.colour,
    d.description,
    d.police_reference,
    d.date_stolen,
    coalesce(d.reward_amount, 0)::integer  as reward_amount,
    coalesce(d.photos, array[]::text[])    as photos,
    coalesce(p.display_name, 'Anonymous')  as reported_by_name,
    round(d.distance_km::numeric, 1)       as distance_km,
    d.created_at
  from d
  left join public.profiles p on p.id = d.user_id
  where d.distance_km <= max_distance_km
  order by d.distance_km asc, d.created_at desc
  limit 100;
$$;

-- ============================================================================
-- RPC: search_stolen_vehicles
-- Free-text-ish search over registration / make / model / colour. Any combination
-- of optional filters; null/empty params are ignored.
-- ============================================================================
create or replace function public.search_stolen_vehicles(
  search_reg_plate text default null,
  search_make      text default null,
  search_model     text default null,
  search_colour    text default null
)
returns table (
  alert_id            uuid,
  registration_plate  text,
  make                text,
  model               text,
  year                integer,
  colour              text,
  description         text,
  police_reference    text,
  date_stolen         timestamptz,
  reward_amount       integer,
  photos              text[],
  reported_by_name    text,
  distance_km         numeric,
  created_at          timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.id                                   as alert_id,
    a.registration_plate,
    a.make,
    a.model,
    a.year,
    a.colour,
    a.description,
    a.police_reference,
    a.date_stolen,
    coalesce(a.reward_amount, 0)::integer  as reward_amount,
    coalesce(a.photos, array[]::text[])    as photos,
    coalesce(p.display_name, 'Anonymous')  as reported_by_name,
    null::numeric                          as distance_km,
    a.created_at
  from public.stolen_vehicle_alerts a
  left join public.profiles p on p.id = a.user_id
  where a.status = 'active'
    and (search_reg_plate is null or search_reg_plate = '' or a.registration_plate ilike '%' || search_reg_plate || '%')
    and (search_make      is null or search_make      = '' or a.make               ilike '%' || search_make      || '%')
    and (search_model     is null or search_model     = '' or a.model              ilike '%' || search_model     || '%')
    and (search_colour    is null or search_colour    = '' or a.colour             ilike '%' || search_colour    || '%')
  order by a.created_at desc
  limit 50;
$$;

-- Grant execute to authenticated users so the JS client can call them via .rpc()
grant execute on function public.get_stolen_vehicles_nearby(numeric, numeric, numeric) to authenticated;
grant execute on function public.search_stolen_vehicles(text, text, text, text) to authenticated;
