// ============================
// Profile Data Hooks
// ============================
// All user-specific data access goes through these hooks.
// Currently backed by DataContext (mock). When Supabase is connected,
// only these hook implementations change — UI stays the same.

import { useMemo, useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Vehicle, Friend, ClubMembership, Club, RevEvent, RevRoute, UserActivity, ForumPost } from '@/models';

// ---- Simulated loading (remove when real API is connected) ----
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
  const { state } = useData();
  const { user: authUser } = useAuth();
  
  // Merge auth user data with DataContext user for a complete picture
  const user = useMemo(() => {
    if (!state.currentUser && !authUser) return null;
    return state.currentUser ? {
      ...state.currentUser,
      displayName: authUser?.displayName || state.currentUser.displayName,
      username: authUser?.username || state.currentUser.username,
      avatar: authUser?.avatar || state.currentUser.avatar,
      bio: authUser?.bio || state.currentUser.bio,
      location: authUser?.location || state.currentUser.location,
    } : null;
  }, [state.currentUser, authUser]);

  return { user, isLoading: false };
}

// ---- User Stats (aggregate counts) ----
export function useUserStatsData() {
  const { state } = useData();
  const { vehicles, friends, clubMemberships, userAttendingEvents, userHostedEvents, savedRoutes, savedEvents, savedServices, activities, events, routes } = state;
  const userId = state.currentUser?.id;

  return useMemo(() => {
    // Deduplicate events: attending + hosted + saved + created
    const createdEventIds = userId ? events.filter(e => e.createdBy === userId).map(e => e.id) : [];
    const allEventIds = new Set([...userAttendingEvents, ...userHostedEvents, ...savedEvents, ...createdEventIds]);
    
    const createdRouteCount = userId ? routes.filter(r => r.createdBy === userId).length : 0;
    
    return {
      garageCount: vehicles.length,
      friendsCount: friends.filter(f => f.status === 'accepted').length,
      clubsCount: clubMemberships.length,
      eventsCount: allEventIds.size,
      routesCount: savedRoutes.length + createdRouteCount,
      discussionsCount: activities.filter(a => a.type === 'forum_post' || a.type === 'forum_reply').length,
      savedServicesCount: savedServices.length,
    };
  }, [vehicles, friends, clubMemberships, userAttendingEvents, userHostedEvents, savedRoutes, savedEvents, savedServices, activities, events, routes, userId]);
}

// ---- Garage (Vehicles) ----
export function useUserGarage() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();
  return { vehicles: state.vehicles, isLoading, error: null };
}

// ---- Friends ----
export function useUserFriends() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();

  const accepted = useMemo(() => state.friends.filter(f => f.status === 'accepted'), [state.friends]);
  const pendingReceived = useMemo(() => state.friends.filter(f => f.status === 'pending_received'), [state.friends]);
  const pendingSent = useMemo(() => state.friends.filter(f => f.status === 'pending_sent'), [state.friends]);

  return { friends: state.friends, accepted, pendingReceived, pendingSent, isLoading, error: null };
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
  const isLoading = useSimulatedLoading();
  const userId = state.currentUser?.id;

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

  const saved = useMemo(() => {
    return state.events.filter(e => state.savedEvents.includes(e.id));
  }, [state.events, state.savedEvents]);

  // Past events — empty until we have real date logic
  const past = useMemo(() => [] as any[], []);

  return { upcoming, past, saved, isLoading, error: null };
}

// ---- Saved Services ----
export function useUserSavedServices() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();

  const saved = useMemo(() => {
    return state.services.filter(s => state.savedServices.includes(s.id));
  }, [state.services, state.savedServices]);

  return { saved, isLoading };
}

// ---- Routes ----
export function useUserRoutes() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();
  const userId = state.currentUser?.id;

  const saved = useMemo(() => {
    return state.routes.filter(r => state.savedRoutes.includes(r.id));
  }, [state.routes, state.savedRoutes]);

  const created = useMemo(() => {
    if (!userId) return [];
    return state.routes.filter(r => r.createdBy === userId);
  }, [state.routes, userId]);

  return { saved, created, isLoading, error: null };
}

// ---- Discussions ----
export function useUserDiscussions() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();
  const userId = state.currentUser?.id;

  const myPosts = useMemo(() => {
    if (!userId) return [];
    return state.forumPosts.filter(p => p.author === userId || p.author === state.currentUser?.displayName);
  }, [state.forumPosts, userId, state.currentUser]);

  const myReplies = useMemo(() => [] as any[], []);

  const savedPosts = useMemo(() => [] as ForumPost[], []);

  return { posts: myPosts, replies: myReplies, savedPosts, isLoading, error: null };
}
