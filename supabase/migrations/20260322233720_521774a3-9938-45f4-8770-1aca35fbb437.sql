
-- Fix function search_path for all security definer functions
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
$$ language plpgsql security definer set search_path = public;

create or replace function public.update_route_rating()
returns trigger as $$
begin
  update public.routes set rating = (select round(avg(rating)::numeric, 1) from public.route_ratings where route_id = new.route_id) where id = new.route_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.update_service_rating()
returns trigger as $$
begin
  update public.services set rating = (select round(avg(rating)::numeric, 1) from public.service_reviews where service_id = new.service_id) where id = new.service_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.update_club_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.clubs set member_count = member_count + 1 where id = new.club_id;
  elsif TG_OP = 'DELETE' then
    update public.clubs set member_count = member_count - 1 where id = old.club_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.update_route_saves()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.routes set saves = saves + 1 where id = new.route_id;
  elsif TG_OP = 'DELETE' then
    update public.routes set saves = saves - 1 where id = old.route_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

create or replace function get_pins_in_bounds(
  north numeric, south numeric, east numeric, west numeric,
  categories text[] default array['events','routes','services']
)
returns table(id uuid, type text, lat numeric, lng numeric, title text, data jsonb)
language sql stable security invoker set search_path = public as $$
  select e.id, 'event'::text, e.lat, e.lng, e.title,
    jsonb_build_object('id', e.id, 'title', e.title, 'type', e.type, 'date_start', e.date_start, 'location', e.location, 'is_free', e.is_free, 'entry_fee', e.entry_fee, 'vehicle_types', e.vehicle_types, 'banner_url', e.banner_url, 'created_by', e.created_by)
  from public.events e where e.lat between south and north and e.lng between west and east and e.visibility = 'public' and 'events' = any(categories)
  union all
  select r.id, 'route'::text, r.lat, r.lng, r.name,
    jsonb_build_object('id', r.id, 'name', r.name, 'type', r.type, 'difficulty', r.difficulty, 'distance_meters', r.distance_meters, 'duration_minutes', r.duration_minutes, 'vehicle_type', r.vehicle_type, 'rating', r.rating, 'surface_type', r.surface_type, 'safety_tags', r.safety_tags, 'created_by', r.created_by)
  from public.routes r where r.lat between south and north and r.lng between west and east and r.visibility = 'public' and 'routes' = any(categories)
  union all
  select s.id, 'service'::text, s.lat, s.lng, s.name,
    jsonb_build_object('id', s.id, 'name', s.name, 'types', s.types, 'rating', s.rating, 'address', s.address, 'phone', s.phone, 'is_24_7', s.is_24_7, 'service_type', s.service_type, 'created_by', s.created_by)
  from public.services s where s.lat between south and north and s.lng between west and east and 'services' = any(categories);
$$;
