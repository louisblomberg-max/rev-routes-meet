
-- Add is_admin column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unblock"
  ON public.blocked_users FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create delete_user RPC
CREATE OR REPLACE FUNCTION public.delete_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the caller is the user being deleted
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  DELETE FROM public.vehicles WHERE user_id = p_user_id;
  DELETE FROM public.events WHERE created_by = p_user_id;
  DELETE FROM public.routes WHERE created_by = p_user_id;
  DELETE FROM public.club_memberships WHERE user_id = p_user_id;
  DELETE FROM public.friends WHERE user_id = p_user_id OR friend_id = p_user_id;
  DELETE FROM public.notifications WHERE user_id = p_user_id;
  DELETE FROM public.user_preferences WHERE user_id = p_user_id;
  DELETE FROM public.subscriptions WHERE user_id = p_user_id;
  DELETE FROM public.blocked_users WHERE user_id = p_user_id OR blocked_user_id = p_user_id;
  DELETE FROM public.live_location_sessions WHERE user_id = p_user_id;
  DELETE FROM public.navigation_sessions WHERE user_id = p_user_id;
  DELETE FROM public.saved_events WHERE user_id = p_user_id;
  DELETE FROM public.saved_routes WHERE user_id = p_user_id;
  DELETE FROM public.saved_services WHERE user_id = p_user_id;
  DELETE FROM public.profiles WHERE id = p_user_id;
END;
$$;
