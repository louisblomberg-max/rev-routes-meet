-- Add variant column to vehicles table
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS variant text;

-- Create live_location_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.live_location_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_lat numeric,
  last_lng numeric,
  last_heading numeric DEFAULT 0,
  bearing numeric DEFAULT 0,
  current_speed_mph numeric DEFAULT 0,
  shared_with uuid[] DEFAULT '{}',
  is_navigating boolean DEFAULT false,
  destination_title text,
  dest_lat numeric,
  dest_lng numeric,
  is_active boolean DEFAULT true,
  session_type text DEFAULT 'navigation',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.live_location_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for live_location_sessions
CREATE POLICY "Users can manage own location sessions"
  ON public.live_location_sessions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view sessions shared with them"
  ON public.live_location_sessions FOR SELECT TO authenticated
  USING (auth.uid() = ANY(shared_with) AND is_active = true);

-- Add missing columns to profiles if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Add missing columns to clubs if they don't exist
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS leaderboard_enabled boolean DEFAULT true;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Create club_leaderboard table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.club_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL,
  user_id uuid NOT NULL,
  points integer DEFAULT 0,
  events_attended integer DEFAULT 0,
  posts_made integer DEFAULT 0,
  routes_shared integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.club_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view club leaderboards"
  ON public.club_leaderboard FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own leaderboard entries"
  ON public.club_leaderboard FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add missing columns to user_preferences
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS who_can_message text DEFAULT 'everyone';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS who_can_see_garage text DEFAULT 'everyone';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS map_style text DEFAULT 'standard';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS distance_units text DEFAULT 'miles';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS meet_style_preferences text[] DEFAULT '{}';

-- Enable realtime on live_location_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_location_sessions;
