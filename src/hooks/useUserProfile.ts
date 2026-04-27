import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfileData {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  created_at: string | null;
  helper_rating: number;
  helper_count: number;
  specialties: string[];
  phone_verified: boolean;
  email_verified: boolean;
  identity_verified: boolean;
  events_attended: number;
  routes_shared: number;
}

export interface UserVehicle {
  id: string;
  make: string | null;
  model: string | null;
  year: string | null;
  colour: string | null;
  transmission: string | null;
  vehicle_type: string | null;
  is_primary: boolean | null;
}

export interface SOSReview {
  id: string;
  rating: number;
  feedback: string | null;
  created_at: string;
  rater: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [recentReviews, setRecentReviews] = useState<SOSReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [profileRes, vehiclesRes, reviewsRes, eventsRes, routesRes] = await Promise.all([
      supabase
        .from('profiles')
        .select(
          'id, display_name, username, avatar_url, bio, location, created_at, helper_rating, helper_count, specialties, phone_verified, email_verified, identity_verified',
        )
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('vehicles')
        .select('id, make, model, year, colour, transmission, vehicle_type, is_primary')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false }),
      supabase
        .from('sos_ratings')
        .select('id, rating, feedback, created_at, rater:rater_id(display_name, avatar_url)')
        .eq('helper_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('event_attendees')
        .select('event_id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('routes')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id),
    ]);

    if (profileRes.data) {
      const p = profileRes.data as any;
      setProfile({
        id: p.id,
        display_name: p.display_name,
        username: p.username,
        avatar_url: p.avatar_url,
        bio: p.bio,
        location: p.location,
        created_at: p.created_at,
        helper_rating: Number(p.helper_rating ?? 0),
        helper_count: Number(p.helper_count ?? 0),
        specialties: (p.specialties as string[] | null) ?? [],
        phone_verified: !!p.phone_verified,
        email_verified: !!p.email_verified,
        identity_verified: !!p.identity_verified,
        events_attended: eventsRes.count ?? 0,
        routes_shared: routesRes.count ?? 0,
      });
    } else {
      setProfile(null);
    }

    setVehicles((vehiclesRes.data ?? []) as unknown as UserVehicle[]);
    setRecentReviews((reviewsRes.data ?? []) as unknown as SOSReview[]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, vehicles, recentReviews, loading, refetch: fetchProfile };
}
