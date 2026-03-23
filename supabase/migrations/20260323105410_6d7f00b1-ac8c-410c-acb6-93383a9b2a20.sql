-- Create security definer function to check club role without recursion
CREATE OR REPLACE FUNCTION public.has_club_role(_user_id uuid, _club_id uuid, _roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships
    WHERE user_id = _user_id
      AND club_id = _club_id
      AND role = ANY(_roles)
  )
$$;

-- Drop the potentially recursive policies and recreate using the function
DROP POLICY IF EXISTS "Club admins can view club memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Club owners can update member roles" ON public.club_memberships;

CREATE POLICY "Club admins can view club memberships"
  ON public.club_memberships FOR SELECT
  USING (public.has_club_role(auth.uid(), club_id, ARRAY['owner', 'admin']));

CREATE POLICY "Club owners can update member roles"
  ON public.club_memberships FOR UPDATE
  USING (public.has_club_role(auth.uid(), club_id, ARRAY['owner']));