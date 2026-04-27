-- ============================================================================
-- SOS Requests system — emergency roadside assistance
-- ============================================================================
-- This migration introduces a dedicated `sos_requests` table separate from the
-- legacy `help_requests` table. New SOS flows use this table; helper acceptance
-- can attach a conversation row for ongoing chat.
-- ============================================================================

-- ── Table ──
create table if not exists public.sos_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  lat numeric,
  lng numeric,
  status text not null default 'active' check (status in ('active', 'helping', 'resolved', 'cancelled')),
  helper_id uuid references public.profiles(id) on delete set null,
  urgency_level text not null default 'medium' check (urgency_level in ('low', 'medium', 'high', 'emergency')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Idempotent: add urgency_level if the table already existed without it
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'sos_requests' and column_name = 'urgency_level'
  ) then
    alter table public.sos_requests
      add column urgency_level text not null default 'medium' check (urgency_level in ('low', 'medium', 'high', 'emergency'));
  end if;
end$$;

-- ── Conversation linkage ──
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'conversations' and column_name = 'sos_request_id'
  ) then
    alter table public.conversations
      add column sos_request_id uuid references public.sos_requests(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'conversations' and column_name = 'conversation_type'
  ) then
    alter table public.conversations
      add column conversation_type text default 'chat' check (conversation_type in ('chat', 'sos'));
  end if;
end$$;

-- ── Indexes ──
create index if not exists sos_requests_active_idx
  on public.sos_requests (status, created_at)
  where status = 'active';

create index if not exists sos_requests_location_idx
  on public.sos_requests (lat, lng)
  where status = 'active';

create index if not exists sos_requests_user_idx
  on public.sos_requests (user_id, created_at desc);

create index if not exists sos_requests_helper_idx
  on public.sos_requests (helper_id, created_at desc)
  where helper_id is not null;

-- ── RLS ──
alter table public.sos_requests enable row level security;

drop policy if exists "Users can view nearby active SOS requests" on public.sos_requests;
create policy "Users can view nearby active SOS requests"
  on public.sos_requests
  for select
  to authenticated
  using (
    status = 'active'
    or user_id = auth.uid()
    or helper_id = auth.uid()
  );

drop policy if exists "Users can create SOS requests" on public.sos_requests;
create policy "Users can create SOS requests"
  on public.sos_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own SOS requests" on public.sos_requests;
create policy "Users can update own SOS requests"
  on public.sos_requests
  for update
  to authenticated
  using (
    auth.uid() = user_id
    or auth.uid() = helper_id
  );

-- ── Realtime ──
-- Make sure sos_requests is part of realtime publication so clients can subscribe
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.sos_requests;
  end if;
exception
  when duplicate_object then null;
end$$;
