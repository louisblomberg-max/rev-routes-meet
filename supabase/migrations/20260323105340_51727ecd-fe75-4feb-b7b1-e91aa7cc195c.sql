-- Fix 1: Restrict notifications INSERT to own user_id only
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fix 2: Restrict club_events INSERT and DELETE to club admins/owners
DROP POLICY IF EXISTS "Authenticated users can link club events" ON public.club_events;
DROP POLICY IF EXISTS "Authenticated users can unlink club events" ON public.club_events;

CREATE POLICY "Club owners can link club events"
  ON public.club_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_memberships
      WHERE club_memberships.club_id = club_events.club_id
        AND club_memberships.user_id = auth.uid()
        AND club_memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Club owners can unlink club events"
  ON public.club_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships
      WHERE club_memberships.club_id = club_events.club_id
        AND club_memberships.user_id = auth.uid()
        AND club_memberships.role IN ('owner', 'admin')
    )
  );

-- Fix 3: Allow club admins/owners to see their club's memberships
CREATE POLICY "Club admins can view club memberships"
  ON public.club_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );

-- Fix 4: Allow club owners to update member roles
CREATE POLICY "Club owners can update member roles"
  ON public.club_memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'owner'
    )
  );

-- Fix 5: Add INSERT policy for subscriptions (service role only via edge function, but need basic policy)
-- Subscriptions are created by the handle_new_user trigger using SECURITY DEFINER
-- No client INSERT or UPDATE needed