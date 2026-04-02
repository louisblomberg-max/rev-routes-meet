
-- ============================================================
-- FIX 1: Restrict event_purchases INSERT to own user + pending only
-- ============================================================
DROP POLICY IF EXISTS "event_purchases_insert" ON public.event_purchases;
CREATE POLICY "event_purchases_insert" ON public.event_purchases
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- ============================================================
-- FIX 2: Prevent club membership role self-escalation
-- ============================================================

-- Drop existing overlapping update policies
DROP POLICY IF EXISTS "memberships_update" ON public.club_memberships;
DROP POLICY IF EXISTS "Club owners can update member roles" ON public.club_memberships;

-- Admins/owners can update any member in their club
CREATE POLICY "admins_update_members" ON public.club_memberships
  FOR UPDATE TO authenticated
  USING (
    public.has_club_role(auth.uid(), club_id, ARRAY['owner','admin'])
  )
  WITH CHECK (
    public.has_club_role(auth.uid(), club_id, ARRAY['owner','admin'])
  );

-- Members can update ONLY their own safe fields (muted, last_active_week, etc.)
-- but cannot change their role
CREATE POLICY "members_update_own_safe_fields" ON public.club_memberships
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (
      SELECT cm.role FROM public.club_memberships cm
      WHERE cm.club_id = club_memberships.club_id
        AND cm.user_id = auth.uid()
    )
  );
