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
  show_garage_on_profile: boolean;
  events_attended: number;
  routes_shared: number;
  friends_count: number;
  clubs_joined: number;
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

export interface ProfileFriend {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [recentReviews, setRecentReviews] = useState<SOSReview[]>([]);
  const [friends, setFriends] = useState<ProfileFriend[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [profileRes, vehiclesRes, reviewsRes, eventsRes, routesRes, friendsCountRes, clubsCountRes, friendsListRes] = await Promise.all([
      supabase
        .from('profiles')
        .select(
          'id, display_name, username, avatar_url, bio, location, created_at, helper_rating, helper_count, specialties, phone_verified, email_verified, identity_verified, show_garage_on_profile',
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
      supabase
        .from('friends')
        .select('user_id', { count: 'exact', head: true })
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted'),
      supabase
        .from('club_memberships')
        .select('club_id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('friends')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')
        .limit(8),
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
        // Default to true if column is null — i.e. show garage publicly unless user opts into private
        show_garage_on_profile: p.show_garage_on_profile === null ? true : !!p.show_garage_on_profile,
        events_attended: eventsRes.count ?? 0,
        routes_shared: routesRes.count ?? 0,
        friends_count: friendsCountRes.count ?? 0,
        clubs_joined: clubsCountRes.count ?? 0,
      });
    } else {
      setProfile(null);
    }

    setVehicles((vehiclesRes.data ?? []) as unknown as UserVehicle[]);
    setRecentReviews((reviewsRes.data ?? []) as unknown as SOSReview[]);

    // Resolve friend profiles from the friends-pair rows
    const pairs = (friendsListRes.data ?? []) as Array<{ user_id: string; friend_id: string }>;
    const otherIds = pairs
      .map((row) => (row.user_id === user.id ? row.friend_id : row.user_id))
      .filter((id, i, arr) => id && arr.indexOf(id) === i)
      .slice(0, 4);
    if (otherIds.length > 0) {
      const { data: friendProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', otherIds);
      setFriends((friendProfiles ?? []) as ProfileFriend[]);
    } else {
      setFriends([]);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /** Persist a partial profile update + refresh local state. */
  const updateUserProfile = useCallback(
    async (patch: Partial<{ show_garage_on_profile: boolean }>) => {
      if (!user?.id) return { error: new Error('Not authenticated') };
      // Optimistic local merge
      setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id);
      if (error) {
        // Roll back on failure
        fetchProfile();
      }
      return { error };
    },
    [user?.id, fetchProfile],
  );

  return { profile, vehicles, recentReviews, friends, loading, refetch: fetchProfile, updateUserProfile };
}
