// ============================
// Profile Data Hooks (Supabase-backed)
// ============================
import { useMemo, useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import { supabase } from '@/integrations/supabase/client';
import type { Friend, ClubMembership, Club, RevEvent, RevRoute, UserActivity, ForumPost } from '@/models';

function useSimulatedLoading(duration = 350) {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), duration);
    return () => clearTimeout(t);
  }, [duration]);
  return isLoading;
}

// ---- Current User ----
export function useCurrentUser() {
  const { user } = useAuth();
  return { user, isLoading: false };
}

// ---- User Stats ----
export function useUserStatsData() {
  const { state } = useData();
  const { user } = useAuth();
  const { vehicles: garageVehicles } = useGarage();
  const { friends, clubMemberships, userAttendingEvents, userHostedEvents, savedRoutes, savedEvents, savedServices, activities, events, routes } = state;
  const userId = user?.id;

  return useMemo(() => {
    const createdEventIds = userId ? events.filter(e => e.createdBy === userId).map(e => e.id) : [];
    const allEventIds = new Set([...userAttendingEvents, ...userHostedEvents, ...savedEvents, ...createdEventIds]);
    const createdRouteCount = userId ? routes.filter(r => r.createdBy === userId).length : 0;

    return {
      garageCount: garageVehicles.length,
      friendsCount: friends.filter((f: any) => f.status === 'accepted').length,
      clubsCount: clubMemberships.length,
      eventsCount: allEventIds.size,
      routesCount: savedRoutes.length + createdRouteCount,
      discussionsCount: activities.filter((a: any) => a.type === 'forum_post' || a.type === 'forum_reply').length,
      savedServicesCount: savedServices.length,
    };
  }, [garageVehicles, friends, clubMemberships, userAttendingEvents, userHostedEvents, savedRoutes, savedEvents, savedServices, activities, events, routes, userId]);
}

// ---- Garage ----
export function useUserGarage() {
  const { vehicles } = useGarage();
  const isLoading = useSimulatedLoading();
  return { vehicles, isLoading, error: null };
}

// ---- Friends ----
export function useUserFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setIsLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('friends')
        .select('*, friend:profiles!friends_friend_id_fkey(id, username, display_name, avatar_url)')
        .eq('user_id', user.id);

      if (data) {
        setFriends(data.map((f: any) => ({
          id: f.friend_id,
          userId: f.user_id,
          friendUserId: f.friend_id,
          username: f.friend?.username || '',
          displayName: f.friend?.display_name || '',
          avatar: f.friend?.avatar_url || null,
          mutualFriends: 0,
          status: f.status === 'accepted' ? 'accepted' : f.status === 'pending' ? 'pending_sent' : 'pending_received',
        })));
      }
      setIsLoading(false);
    })();
  }, [user?.id]);

  const accepted = useMemo(() => friends.filter(f => f.status === 'accepted'), [friends]);
  const pendingReceived = useMemo(() => friends.filter(f => f.status === 'pending_received'), [friends]);
  const pendingSent = useMemo(() => friends.filter(f => f.status === 'pending_sent'), [friends]);

  return { friends, accepted, pendingReceived, pendingSent, isLoading, error: null };
}

// ---- Clubs ----
export interface UserClubData {
  membership: ClubMembership;
  club: Club | undefined;
}

export function useUserClubs() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();

  const clubs = useMemo<UserClubData[]>(() => {
    return state.clubMemberships.map(m => ({
      membership: m,
      club: state.clubs.find(c => c.id === m.clubId),
    }));
  }, [state.clubMemberships, state.clubs]);

  const joined = useMemo(() => clubs.filter(c => c.membership.role === 'member'), [clubs]);
  const managed = useMemo(() => clubs.filter(c => c.membership.role === 'admin'), [clubs]);

  return { clubs, joined, managed, isLoading, error: null };
}

// ---- Events ----
export function useUserEvents() {
  const { state } = useData();
  const { user } = useAuth();
  const isLoading = useSimulatedLoading();
  const userId = user?.id;

  const upcoming = useMemo(() => {
    const attendingSet = new Set(state.userAttendingEvents);
    const hostingSet = new Set(state.userHostedEvents);
    return state.events
      .filter(e => attendingSet.has(e.id) || hostingSet.has(e.id) || e.createdBy === userId)
      .map(e => ({
        ...e,
        isHost: hostingSet.has(e.id) || e.createdBy === userId,
        status: attendingSet.has(e.id) ? 'attending' as const : 'interested' as const,
      }));
  }, [state.events, state.userAttendingEvents, state.userHostedEvents, userId]);

  const saved = useMemo(() => state.events.filter(e => state.savedEvents.includes(e.id)), [state.events, state.savedEvents]);
  const past = useMemo(() => [] as any[], []);

  return { upcoming, past, saved, isLoading, error: null };
}

// ---- Saved Services ----
export function useUserSavedServices() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();
  const saved = useMemo(() => state.services.filter(s => state.savedServices.includes(s.id)), [state.services, state.savedServices]);
  return { saved, isLoading };
}

// ---- Routes ----
export function useUserRoutes() {
  const { state } = useData();
  const { user } = useAuth();
  const isLoading = useSimulatedLoading();
  const userId = user?.id;

  const saved = useMemo(() => state.routes.filter(r => state.savedRoutes.includes(r.id)), [state.routes, state.savedRoutes]);
  const created = useMemo(() => userId ? state.routes.filter(r => r.createdBy === userId) : [], [state.routes, userId]);

  return { saved, created, isLoading, error: null };
}

// ---- Discussions ----
export function useUserDiscussions() {
  const { state } = useData();
  const { user } = useAuth();
  const isLoading = useSimulatedLoading();
  const userId = user?.id;

  const myPosts = useMemo(() => {
    if (!userId) return [];
    return state.forumPosts.filter(p => p.author === userId || p.author === user?.displayName);
  }, [state.forumPosts, userId, user]);

  const myReplies = useMemo(() => [] as any[], []);
  const savedPosts = useMemo(() => [] as ForumPost[], []);

  return { posts: myPosts, replies: myReplies, savedPosts, isLoading, error: null };
}
