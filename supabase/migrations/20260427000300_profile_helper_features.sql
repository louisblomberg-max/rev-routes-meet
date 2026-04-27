-- ============================================================================
-- Profile helper features: specialties + verification flags + sos_ratings
-- ============================================================================
-- All idempotent. Existing helper_rating / helper_count columns (added in
-- 20260427000100_helper_settings.sql) are not redefined.
-- ============================================================================

-- ── Profile additions ──
alter table public.profiles
  add column if not exists specialties        text[]  default '{}',
  add column if not exists phone_verified     boolean not null default false,
  add column if not exists email_verified     boolean not null default false,
  add column if not exists identity_verified  boolean not null default false;

-- ── sos_ratings: 1-5 star rating + optional feedback for a helper after SOS resolves ──
create table if not exists public.sos_ratings (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.sos_requests(id) on delete cascade,
  rater_id    uuid not null references public.profiles(id)     on delete cascade,
  helper_id   uuid not null references public.profiles(id)     on delete cascade,
  rating      int  not null check (rating between 1 and 5),
  feedback    text,
  created_at  timestamptz not null default now(),
  -- one rating per request per rater
  unique(request_id, rater_id)
);

create index if not exists idx_sos_ratings_helper_created
  on public.sos_ratings (helper_id, created_at desc);

-- ── RLS ──
alter table public.sos_ratings enable row level security;

drop policy if exists "Users can view ratings about themselves or that they wrote" on public.sos_ratings;
create policy "Users can view ratings about themselves or that they wrote"
  on public.sos_ratings
  for select
  to authenticated
  using (rater_id = auth.uid() or helper_id = auth.uid());

drop policy if exists "Users can rate helpers on their own SOS requests" on public.sos_ratings;
create policy "Users can rate helpers on their own SOS requests"
  on public.sos_ratings
  for insert
  to authenticated
  with check (
    rater_id = auth.uid()
    and exists (
      select 1 from public.sos_requests r
      where r.id = request_id
        and r.user_id = auth.uid()
        and r.helper_id = sos_ratings.helper_id
    )
  );

-- ── Trigger: keep profiles.helper_rating + helper_count in sync ──
create or replace function public.refresh_helper_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
     set helper_count  = (select count(*) from public.sos_ratings where helper_id = p.id),
         helper_rating = coalesce(
           (select round(avg(rating)::numeric, 1)::numeric(2,1)
              from public.sos_ratings where helper_id = p.id),
           0
         )
   where p.id = coalesce(new.helper_id, old.helper_id);
  return null;
end;
$$;

drop trigger if exists trg_sos_ratings_aggregate on public.sos_ratings;
create trigger trg_sos_ratings_aggregate
  after insert or update or delete on public.sos_ratings
  for each row execute function public.refresh_helper_rating();
