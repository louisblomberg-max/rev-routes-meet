
-- 1. profiles
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  location text,
  country text default 'GB',
  plan text default 'free' check (plan in ('free', 'pro', 'club')),
  onboarding_complete boolean default false,
  onboarding_step integer default 0,
  discovery_radius_miles integer default 25,
  route_credits integer default 0,
  event_credits integer default 0,
  available_to_help boolean default false,
  help_radius_miles integer default 10,
  profile_visibility text default 'public' check (profile_visibility in ('public', 'friends', 'private')),
  show_garage_on_profile boolean default true,
  allow_friends_view_vehicles boolean default true,
  allow_others_see_mods boolean default true,
  live_location_sharing boolean default false,
  who_can_message text default 'friends_and_clubs' check (who_can_message in ('friends', 'friends_and_clubs', 'anyone')),
  allow_message_requests boolean default true,
  show_events_i_attend boolean default true,
  show_routes_i_create boolean default true,
  show_forum_posts boolean default true,
  created_at timestamptz default now()
);

-- 2. subscriptions
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan text check (plan in ('free', 'pro', 'club')),
  status text check (status in ('active', 'inactive', 'cancelled')),
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')),
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz default now()
);

-- 3. user_preferences
create table public.user_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  theme text default 'system',
  map_style text default 'standard',
  distance_units text default 'miles',
  default_discovery_view text default 'last_used',
  voice_guidance boolean default true,
  route_recalculation boolean default true,
  show_traffic boolean default true,
  auto_refresh_map boolean default true,
  show_only_selected_categories boolean default true,
  driving_mode text default 'off' check (driving_mode in ('off', 'navigation', 'group_drive')),
  data_saver_mode boolean default false,
  vehicle_interests text[] default array['cars', 'motorbikes'],
  route_types_shown text[] default array['scenic', 'coastal', 'twisties', 'off_road', 'urban', 'track'],
  event_types_shown text[] default array['meets', 'shows', 'drive_outs', 'track_days'],
  push_notifications boolean default true,
  email_notifications boolean default false,
  notification_prefs jsonb default '{
    "new_friend_requests": true,
    "friend_accepts": true,
    "new_messages": true,
    "message_reactions": false,
    "mentions_in_discussions": true,
    "new_club_posts": false,
    "replies_to_club_posts": true,
    "new_forum_replies": true,
    "upvotes_on_posts": false,
    "new_members_joining_clubs": false,
    "event_invitations": true,
    "event_reminders": true,
    "event_changes": true,
    "group_drive_starting": true,
    "group_drive_updates": true,
    "event_reminder_timing": "2_hours",
    "breakdown_requests_nearby": true,
    "someone_responds_to_breakdown": true,
    "friend_shares_live_location": true,
    "group_drive_safety_alerts": true,
    "quiet_hours_enabled": false,
    "notification_digest": "off"
  }',
  updated_at timestamptz default now()
);

-- 4. vehicles
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  make text not null,
  model text,
  year text,
  engine text,
  transmission text,
  drivetrain text,
  colour text,
  number_plate text,
  details text,
  mods_text text,
  photos text[] default array[]::text[],
  tags text[] default array[]::text[],
  visibility text default 'public' check (visibility in ('public', 'friends', 'private')),
  is_primary boolean default false,
  vehicle_type text default 'car' check (vehicle_type in ('car', 'motorcycle')),
  created_at timestamptz default now()
);

-- 5. routes
create table public.routes (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  geometry jsonb,
  distance_meters numeric,
  duration_minutes integer,
  type text,
  vehicle_type text check (vehicle_type in ('car', 'bike', 'both')),
  difficulty text check (difficulty in ('easy', 'moderate', 'challenging', 'expert')),
  surface_type text check (surface_type in ('tarmac', 'gravel', 'dirt', 'mixed')),
  safety_tags text[] default array[]::text[],
  visibility text default 'public' check (visibility in ('public', 'friends', 'private')),
  rating numeric default 0,
  saves integer default 0,
  drives integer default 0,
  lat numeric,
  lng numeric,
  best_time text,
  tips text,
  photos text[] default array[]::text[],
  elevation_gain numeric,
  max_speed numeric,
  avg_speed numeric,
  created_at timestamptz default now()
);

-- 6. saved_routes
create table public.saved_routes (
  user_id uuid references public.profiles(id) on delete cascade,
  route_id uuid references public.routes(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (user_id, route_id)
);

-- 7. route_ratings
create table public.route_ratings (
  user_id uuid references public.profiles(id) on delete cascade,
  route_id uuid references public.routes(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  created_at timestamptz default now(),
  primary key (user_id, route_id)
);

-- 8. events
create table public.events (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  banner_url text,
  date_start timestamptz,
  date_end timestamptz,
  location text,
  lat numeric,
  lng numeric,
  type text,
  vehicle_types text[] default array[]::text[],
  vehicle_brands text[] default array[]::text[],
  vehicle_categories text[] default array[]::text[],
  vehicle_ages text[] default array[]::text[],
  max_attendees integer,
  is_first_come_first_serve boolean default true,
  entry_fee numeric default 0,
  is_free boolean default true,
  visibility text default 'public' check (visibility in ('public', 'friends', 'private', 'club')),
  club_id uuid,
  created_at timestamptz default now()
);

-- 9. event_attendees
create table public.event_attendees (
  user_id uuid references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  status text default 'attending' check (status in ('attending', 'maybe', 'declined')),
  joined_at timestamptz default now(),
  primary key (user_id, event_id)
);

-- 10. services
create table public.services (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete cascade,
  name text not null,
  tagline text,
  description text,
  cover_url text,
  types text[] default array[]::text[],
  lat numeric,
  lng numeric,
  address text,
  hide_exact_address boolean default false,
  service_type text check (service_type in ('fixed', 'mobile')),
  phone text,
  website text,
  is_24_7 boolean default false,
  is_emergency boolean default false,
  hours jsonb default '{}',
  rating numeric default 0,
  created_at timestamptz default now()
);

-- 11. service_reviews
create table public.service_reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  body text,
  created_at timestamptz default now()
);

-- 12. saved_services
create table public.saved_services (
  user_id uuid references public.profiles(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  saved_at timestamptz default now(),
  primary key (user_id, service_id)
);

-- 13. clubs
create table public.clubs (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete cascade,
  name text not null,
  handle text unique,
  description text,
  logo_url text,
  cover_url text,
  lat numeric,
  lng numeric,
  club_type text,
  tags text[] default array[]::text[],
  vehicle_focus text[] default array[]::text[],
  visibility text default 'public' check (visibility in ('public', 'members_only', 'invite_only', 'hidden')),
  join_mode text default 'auto' check (join_mode in ('auto', 'admin_approval')),
  posting_permissions text default 'any_member' check (posting_permissions in ('any_member', 'admins_only')),
  rules jsonb default '[]',
  social_links jsonb default '{}',
  member_count integer default 0,
  created_at timestamptz default now()
);

-- 14. club_memberships
create table public.club_memberships (
  user_id uuid references public.profiles(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete cascade,
  role text default 'member' check (role in ('member', 'admin', 'owner')),
  joined_at timestamptz default now(),
  primary key (user_id, club_id)
);

-- 15. club_posts
create table public.club_posts (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  photos text[] default array[]::text[],
  likes integer default 0,
  created_at timestamptz default now()
);

-- 16. club_events
create table public.club_events (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamptz default now()
);

-- 17. friends
create table public.friends (
  user_id uuid references public.profiles(id) on delete cascade,
  friend_id uuid references public.profiles(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);

-- 18. conversations
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  type text default 'direct' check (type in ('direct', 'group')),
  name text,
  created_at timestamptz default now()
);

-- 19. conversation_participants
create table public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

-- 20. messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete cascade,
  content text,
  photo_url text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- 21. forum_posts
create table public.forum_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  club_id uuid references public.clubs(id) on delete set null,
  type text check (type in ('question', 'advice', 'discussion')),
  title text not null,
  body text,
  category text,
  photos text[] default array[]::text[],
  upvotes integer default 0,
  created_at timestamptz default now()
);

-- 22. forum_comments
create table public.forum_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.forum_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  body text not null,
  upvotes integer default 0,
  created_at timestamptz default now()
);

-- 23. help_requests
create table public.help_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  issue_type text check (issue_type in ('electrical', 'flat_tyre', 'out_of_fuel', 'locked_out', 'mechanical', 'accident')),
  details text,
  lat numeric,
  lng numeric,
  help_source text check (help_source in ('nearby_members', 'recovery_services', 'both')),
  status text default 'active' check (status in ('active', 'resolved', 'cancelled')),
  created_at timestamptz default now()
);

-- 24. stolen_vehicle_alerts
create table public.stolen_vehicle_alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  description text,
  last_seen_lat numeric,
  last_seen_lng numeric,
  status text default 'active' check (status in ('active', 'resolved')),
  created_at timestamptz default now()
);

-- 25. navigation_sessions
create table public.navigation_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  destination_title text,
  dest_lat numeric,
  dest_lng numeric,
  started_at timestamptz default now(),
  ended_at timestamptz,
  distance_meters numeric,
  completed boolean default false
);

-- 26. marketplace_listings
create table public.marketplace_listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric,
  condition text check (condition in ('new', 'excellent', 'good', 'fair', 'spares')),
  category text,
  photos text[] default array[]::text[],
  status text default 'active' check (status in ('active', 'sold', 'removed')),
  lat numeric,
  lng numeric,
  created_at timestamptz default now()
);

-- ==============================
-- PART 2: TRIGGERS AND FUNCTIONS
-- ==============================

-- Auto-create profile, subscription and preferences when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.subscriptions (user_id, plan, status, billing_cycle)
  values (new.id, 'free', 'active', 'monthly');
  insert into public.user_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Map pins function
create or replace function get_pins_in_bounds(
  north numeric,
  south numeric,
  east numeric,
  west numeric,
  categories text[] default array['events','routes','services']
)
returns table(
  id uuid,
  type text,
  lat numeric,
  lng numeric,
  title text,
  data jsonb
)
language sql stable as $$
  select
    e.id, 'event'::text as type, e.lat, e.lng, e.title,
    jsonb_build_object('id', e.id, 'title', e.title, 'type', e.type, 'date_start', e.date_start, 'location', e.location, 'is_free', e.is_free, 'entry_fee', e.entry_fee, 'vehicle_types', e.vehicle_types, 'banner_url', e.banner_url, 'created_by', e.created_by) as data
  from public.events e
  where e.lat between south and north and e.lng between west and east and e.visibility = 'public' and 'events' = any(categories)
  union all
  select
    r.id, 'route'::text as type, r.lat, r.lng, r.name as title,
    jsonb_build_object('id', r.id, 'name', r.name, 'type', r.type, 'difficulty', r.difficulty, 'distance_meters', r.distance_meters, 'duration_minutes', r.duration_minutes, 'vehicle_type', r.vehicle_type, 'rating', r.rating, 'surface_type', r.surface_type, 'safety_tags', r.safety_tags, 'created_by', r.created_by) as data
  from public.routes r
  where r.lat between south and north and r.lng between west and east and r.visibility = 'public' and 'routes' = any(categories)
  union all
  select
    s.id, 'service'::text as type, s.lat, s.lng, s.name as title,
    jsonb_build_object('id', s.id, 'name', s.name, 'types', s.types, 'rating', s.rating, 'address', s.address, 'phone', s.phone, 'is_24_7', s.is_24_7, 'service_type', s.service_type, 'created_by', s.created_by) as data
  from public.services s
  where s.lat between south and north and s.lng between west and east and 'services' = any(categories);
$$;

-- Auto-update route rating average
create or replace function update_route_rating()
returns trigger as $$
begin
  update public.routes set rating = (select round(avg(rating)::numeric, 1) from public.route_ratings where route_id = new.route_id) where id = new.route_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_route_rated
  after insert or update on public.route_ratings
  for each row execute procedure update_route_rating();

-- Auto-update service rating average
create or replace function update_service_rating()
returns trigger as $$
begin
  update public.services set rating = (select round(avg(rating)::numeric, 1) from public.service_reviews where service_id = new.service_id) where id = new.service_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_service_reviewed
  after insert or update on public.service_reviews
  for each row execute procedure update_service_rating();

-- Auto-update club member count
create or replace function update_club_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.clubs set member_count = member_count + 1 where id = new.club_id;
  elsif TG_OP = 'DELETE' then
    update public.clubs set member_count = member_count - 1 where id = old.club_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_club_membership_change
  after insert or delete on public.club_memberships
  for each row execute procedure update_club_member_count();

-- Auto-update route saves count
create or replace function update_route_saves()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.routes set saves = saves + 1 where id = new.route_id;
  elsif TG_OP = 'DELETE' then
    update public.routes set saves = saves - 1 where id = old.route_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_route_saved
  after insert or delete on public.saved_routes
  for each row execute procedure update_route_saves();

-- ==============================
-- PART 3: ROW LEVEL SECURITY
-- ==============================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.vehicles enable row level security;
alter table public.routes enable row level security;
alter table public.saved_routes enable row level security;
alter table public.route_ratings enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.services enable row level security;
alter table public.service_reviews enable row level security;
alter table public.saved_services enable row level security;
alter table public.clubs enable row level security;
alter table public.club_memberships enable row level security;
alter table public.club_posts enable row level security;
alter table public.club_events enable row level security;
alter table public.friends enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.help_requests enable row level security;
alter table public.stolen_vehicle_alerts enable row level security;
alter table public.navigation_sessions enable row level security;
alter table public.marketplace_listings enable row level security;

-- PROFILES
create policy "Public profiles are viewable by everyone" on public.profiles for select using (profile_visibility = 'public' or auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- SUBSCRIPTIONS
create policy "Users can view their own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can update their own subscription" on public.subscriptions for update using (auth.uid() = user_id);

-- USER PREFERENCES
create policy "Users can view their own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert their own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update their own preferences" on public.user_preferences for update using (auth.uid() = user_id);

-- VEHICLES
create policy "Public vehicles viewable by everyone" on public.vehicles for select using (visibility = 'public' or auth.uid() = user_id);
create policy "Authenticated users can insert vehicles" on public.vehicles for insert with check (auth.uid() = user_id);
create policy "Users can update their own vehicles" on public.vehicles for update using (auth.uid() = user_id);
create policy "Users can delete their own vehicles" on public.vehicles for delete using (auth.uid() = user_id);

-- ROUTES
create policy "Public routes viewable by everyone" on public.routes for select using (visibility = 'public' or auth.uid() = created_by);
create policy "Authenticated users can create routes" on public.routes for insert with check (auth.uid() = created_by);
create policy "Users can update their own routes" on public.routes for update using (auth.uid() = created_by);
create policy "Users can delete their own routes" on public.routes for delete using (auth.uid() = created_by);

-- SAVED ROUTES
create policy "Users can view their own saved routes" on public.saved_routes for select using (auth.uid() = user_id);
create policy "Users can save routes" on public.saved_routes for insert with check (auth.uid() = user_id);
create policy "Users can unsave routes" on public.saved_routes for delete using (auth.uid() = user_id);

-- ROUTE RATINGS
create policy "Anyone can view route ratings" on public.route_ratings for select using (true);
create policy "Authenticated users can rate routes" on public.route_ratings for insert with check (auth.uid() = user_id);
create policy "Users can update their own ratings" on public.route_ratings for update using (auth.uid() = user_id);

-- EVENTS
create policy "Public events viewable by everyone" on public.events for select using (visibility = 'public' or auth.uid() = created_by);
create policy "Authenticated users can create events" on public.events for insert with check (auth.uid() = created_by);
create policy "Users can update their own events" on public.events for update using (auth.uid() = created_by);
create policy "Users can delete their own events" on public.events for delete using (auth.uid() = created_by);

-- EVENT ATTENDEES
create policy "Anyone can view event attendees" on public.event_attendees for select using (true);
create policy "Authenticated users can attend events" on public.event_attendees for insert with check (auth.uid() = user_id);
create policy "Users can update their attendance" on public.event_attendees for update using (auth.uid() = user_id);
create policy "Users can cancel attendance" on public.event_attendees for delete using (auth.uid() = user_id);

-- SERVICES
create policy "Services viewable by everyone" on public.services for select using (true);
create policy "Authenticated users can create services" on public.services for insert with check (auth.uid() = created_by);
create policy "Users can update their own services" on public.services for update using (auth.uid() = created_by);
create policy "Users can delete their own services" on public.services for delete using (auth.uid() = created_by);

-- SERVICE REVIEWS
create policy "Anyone can view service reviews" on public.service_reviews for select using (true);
create policy "Authenticated users can review services" on public.service_reviews for insert with check (auth.uid() = user_id);
create policy "Users can update their own reviews" on public.service_reviews for update using (auth.uid() = user_id);
create policy "Users can delete their own reviews" on public.service_reviews for delete using (auth.uid() = user_id);

-- SAVED SERVICES
create policy "Users can view their saved services" on public.saved_services for select using (auth.uid() = user_id);
create policy "Users can save services" on public.saved_services for insert with check (auth.uid() = user_id);
create policy "Users can unsave services" on public.saved_services for delete using (auth.uid() = user_id);

-- CLUBS
create policy "Public clubs viewable by everyone" on public.clubs for select using (visibility in ('public', 'members_only') or auth.uid() = created_by);
create policy "Authenticated users can create clubs" on public.clubs for insert with check (auth.uid() = created_by);
create policy "Club owners can update their clubs" on public.clubs for update using (auth.uid() = created_by);
create policy "Club owners can delete their clubs" on public.clubs for delete using (auth.uid() = created_by);

-- CLUB MEMBERSHIPS
create policy "Club memberships viewable by members" on public.club_memberships for select using (auth.uid() = user_id);
create policy "Users can join clubs" on public.club_memberships for insert with check (auth.uid() = user_id);
create policy "Users can leave clubs" on public.club_memberships for delete using (auth.uid() = user_id);

-- CLUB POSTS
create policy "Club posts viewable by authenticated users" on public.club_posts for select using (auth.uid() is not null);
create policy "Authenticated users can post in clubs" on public.club_posts for insert with check (auth.uid() = user_id);
create policy "Users can delete their own club posts" on public.club_posts for delete using (auth.uid() = user_id);

-- FRIENDS
create policy "Users can view their own friend rows" on public.friends for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users can send friend requests" on public.friends for insert with check (auth.uid() = user_id);
create policy "Users can update friend status" on public.friends for update using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Users can remove friends" on public.friends for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- CONVERSATIONS
create policy "Participants can view their conversations" on public.conversations for select using (exists (select 1 from public.conversation_participants where conversation_id = id and user_id = auth.uid()));
create policy "Authenticated users can create conversations" on public.conversations for insert with check (auth.uid() is not null);

-- CONVERSATION PARTICIPANTS
create policy "Users can view conversation participants" on public.conversation_participants for select using (exists (select 1 from public.conversation_participants cp where cp.conversation_id = conversation_participants.conversation_id and cp.user_id = auth.uid()));
create policy "Users can be added to conversations" on public.conversation_participants for insert with check (auth.uid() is not null);

-- MESSAGES
create policy "Participants can view messages" on public.messages for select using (exists (select 1 from public.conversation_participants where conversation_id = messages.conversation_id and user_id = auth.uid()));
create policy "Participants can send messages" on public.messages for insert with check (auth.uid() = sender_id and exists (select 1 from public.conversation_participants where conversation_id = messages.conversation_id and user_id = auth.uid()));

-- FORUM POSTS
create policy "Anyone can view forum posts" on public.forum_posts for select using (true);
create policy "Authenticated users can create forum posts" on public.forum_posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own forum posts" on public.forum_posts for update using (auth.uid() = user_id);
create policy "Users can delete their own forum posts" on public.forum_posts for delete using (auth.uid() = user_id);

-- FORUM COMMENTS
create policy "Anyone can view forum comments" on public.forum_comments for select using (true);
create policy "Authenticated users can comment" on public.forum_comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.forum_comments for delete using (auth.uid() = user_id);

-- HELP REQUESTS
create policy "Authenticated users can view help requests" on public.help_requests for select using (auth.uid() is not null);
create policy "Users can create help requests" on public.help_requests for insert with check (auth.uid() = user_id);
create policy "Users can update their own help requests" on public.help_requests for update using (auth.uid() = user_id);

-- STOLEN VEHICLE ALERTS
create policy "Authenticated users can view active stolen alerts" on public.stolen_vehicle_alerts for select using (auth.uid() is not null);
create policy "Users can report stolen vehicles" on public.stolen_vehicle_alerts for insert with check (auth.uid() = user_id);
create policy "Users can update their own alerts" on public.stolen_vehicle_alerts for update using (auth.uid() = user_id);

-- NAVIGATION SESSIONS
create policy "Users can view their own navigation sessions" on public.navigation_sessions for select using (auth.uid() = user_id);
create policy "Users can create navigation sessions" on public.navigation_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own navigation sessions" on public.navigation_sessions for update using (auth.uid() = user_id);

-- MARKETPLACE LISTINGS
create policy "Anyone can view active marketplace listings" on public.marketplace_listings for select using (status = 'active' or auth.uid() = user_id);
create policy "Authenticated users can create listings" on public.marketplace_listings for insert with check (auth.uid() = user_id);
create policy "Users can update their own listings" on public.marketplace_listings for update using (auth.uid() = user_id);
create policy "Users can delete their own listings" on public.marketplace_listings for delete using (auth.uid() = user_id);

-- ==============================
-- PART 4: STORAGE BUCKETS
-- ==============================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('vehicles', 'vehicles', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('events', 'events', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('routes', 'routes', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('services', 'services', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('clubs', 'clubs', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('marketplace', 'marketplace', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

-- Storage RLS: public read, authenticated upload
create policy "Public read access" on storage.objects for select using (bucket_id in ('avatars', 'vehicles', 'events', 'routes', 'services', 'clubs', 'marketplace'));
create policy "Authenticated users can upload" on storage.objects for insert with check (auth.uid() is not null and bucket_id in ('avatars', 'vehicles', 'events', 'routes', 'services', 'clubs', 'marketplace'));
create policy "Users can update their own files" on storage.objects for update using (auth.uid()::text = (storage.foldername(name))[1] and bucket_id in ('avatars', 'vehicles', 'events', 'routes', 'services', 'clubs', 'marketplace'));
create policy "Users can delete their own files" on storage.objects for delete using (auth.uid()::text = (storage.foldername(name))[1] and bucket_id in ('avatars', 'vehicles', 'events', 'routes', 'services', 'clubs', 'marketplace'));

-- ==============================
-- PART 5: ENABLE REALTIME
-- ==============================

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.help_requests;
alter publication supabase_realtime add table public.stolen_vehicle_alerts;
alter publication supabase_realtime add table public.event_attendees;
