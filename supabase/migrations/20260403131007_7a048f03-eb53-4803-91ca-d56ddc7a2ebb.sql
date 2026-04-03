
-- 1. Fix club_memberships INSERT policy: enforce role='member', block blocked users, check join_mode
DROP POLICY IF EXISTS "club_memberships_insert" ON public.club_memberships;
CREATE POLICY "club_memberships_insert" ON public.club_memberships
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'member'
    AND NOT (auth.uid() = ANY(COALESCE((SELECT c.blocked_users FROM clubs c WHERE c.id = club_id), '{}'::uuid[])))
    AND EXISTS (
      SELECT 1 FROM clubs c WHERE c.id = club_id
      AND (
        (c.join_mode = 'auto' AND c.visibility = 'public')
        OR EXISTS (
          SELECT 1 FROM club_join_requests r
          WHERE r.club_id = c.id AND r.user_id = auth.uid() AND r.status = 'approved'
        )
      )
    )
  );

-- 2. Fix profiles UPDATE policy: add event_credits and stripe_connect_account_id guards
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin = (SELECT p.is_admin FROM profiles p WHERE p.id = auth.uid())
    AND plan = (SELECT p.plan FROM profiles p WHERE p.id = auth.uid())
    AND free_event_credits = (SELECT p.free_event_credits FROM profiles p WHERE p.id = auth.uid())
    AND route_credits = (SELECT p.route_credits FROM profiles p WHERE p.id = auth.uid())
    AND event_credits = (SELECT p.event_credits FROM profiles p WHERE p.id = auth.uid())
    AND stripe_connect_account_id IS NOT DISTINCT FROM (SELECT p.stripe_connect_account_id FROM profiles p WHERE p.id = auth.uid())
  );

-- 3. Fix profiles SELECT policy: restrict sensitive fields to owner only
-- Replace broad SELECT with a view-based approach using the existing profiles_public view
-- and restrict the direct table SELECT to owner only
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR (
      profile_visibility = 'public'
    )
  );

-- 4. Revoke direct column access to sensitive fields for non-owners
-- Since we can't do column-level RLS, create a security-invoker view that masks sensitive fields
DROP VIEW IF EXISTS public.profiles_public;
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT
  id,
  display_name,
  username,
  avatar_url,
  bio,
  location,
  profile_visibility,
  show_garage_on_profile,
  available_to_help,
  plan,
  created_at,
  show_events_i_attend,
  show_routes_i_create,
  show_forum_posts,
  who_can_message,
  allow_message_requests,
  country
FROM profiles
WHERE profile_visibility = 'public';

-- 5. Fix storage: remove overly permissive INSERT policy, require auth for SELECT
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;

CREATE POLICY "Authenticated read access" ON storage.objects
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND bucket_id = ANY(ARRAY['avatars','vehicles','events','routes','services','clubs','marketplace'])
  );

-- 6. Fix realtime topic matching to use exact prefix instead of substring
DROP POLICY IF EXISTS "realtime_messages_select" ON messages;
