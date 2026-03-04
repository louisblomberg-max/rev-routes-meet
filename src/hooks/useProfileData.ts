// ============================
// Profile Data Hooks
// ============================
// All user-specific data access goes through these hooks.
// Currently backed by DataContext (mock). When Supabase is connected,
// only these hook implementations change — UI stays the same.

import { useMemo, useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
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
  return { user: state.currentUser, isLoading: false };
}

// ---- User Stats (aggregate counts) ----
export function useUserStatsData() {
  const { state } = useData();
  const { vehicles, friends, clubMemberships, userAttendingEvents, userHostedEvents, savedRoutes, activities } = state;

  return useMemo(() => ({
    garageCount: vehicles.length,
    friendsCount: friends.filter(f => f.status === 'accepted').length,
    clubsCount: clubMemberships.length,
    eventsCount: userAttendingEvents.length + userHostedEvents.length,
    routesCount: savedRoutes.length,
    discussionsCount: activities.filter(a => a.type === 'forum_post' || a.type === 'forum_reply').length,
  }), [vehicles, friends, clubMemberships, userAttendingEvents, userHostedEvents, savedRoutes, activities]);
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

  const upcoming = useMemo(() => {
    const ids = new Set([...state.userAttendingEvents, ...state.userHostedEvents]);
    return state.events
      .filter(e => ids.has(e.id) || e.createdBy === state.currentUser?.id)
      .map(e => ({
        ...e,
        isHost: state.userHostedEvents.includes(e.id) || e.createdBy === state.currentUser?.id,
        status: state.userAttendingEvents.includes(e.id) ? 'attending' as const : 'interested' as const,
      }));
  }, [state.events, state.userAttendingEvents, state.userHostedEvents, state.currentUser]);

  const saved = useMemo(() => {
    return state.events.filter(e => state.savedEvents.includes(e.id));
  }, [state.events, state.savedEvents]);

  // Mock past events (in real app, filtered by date)
  const past = useMemo(() => [
    { id: 'past1', title: 'BMW Sunday Cruise', date: 'Sun, Jan 28 • 10:00 AM', location: 'Ace Cafe, London', vehicleType: 'BMW Only', eventType: 'Group Drive', attendees: 34, isHost: true, status: 'attended' as const, createdBy: 'user-1', createdAt: '2024-01-20' },
    { id: 'past2', title: 'New Year Meet 2024', date: 'Mon, Jan 1 • 12:00 PM', location: 'Caffeine & Machine', vehicleType: 'All Welcome', eventType: 'Meets', attendees: 156, isHost: false, status: 'attended' as const, createdBy: 'user-seed', createdAt: '2023-12-20' },
  ], []);

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

  const saved = useMemo(() => {
    return state.routes.filter(r => state.savedRoutes.includes(r.id));
  }, [state.routes, state.savedRoutes]);

  const created = useMemo(() => {
    return state.routes.filter(r => r.createdBy === state.currentUser?.id);
  }, [state.routes, state.currentUser]);

  // Mock created routes for demo
  const createdWithMeta = useMemo(() => [
    { id: 'cr1', name: 'South Downs Sunrise Run', distance: '42 miles', type: 'Scenic', vehicleType: 'both' as const, rating: 4.8, saves: 156, drives: 89, createdBy: 'user-1', createdAt: '3 weeks ago' },
    { id: 'cr2', name: 'Kent Coastal Loop', distance: '58 miles', type: 'Coastal', vehicleType: 'car' as const, rating: 4.6, saves: 78, drives: 45, createdBy: 'user-1', createdAt: '1 month ago' },
  ], []);

  return { saved, created: createdWithMeta, isLoading, error: null };
}

// ---- Discussions ----
export function useUserDiscussions() {
  const { state } = useData();
  const isLoading = useSimulatedLoading();

  // In real app, filtered by currentUser. For demo, return specific posts.
  const myPosts = useMemo(() => {
    return state.forumPosts.slice(0, 2); // first 2 as "mine"
  }, [state.forumPosts]);

  const myReplies = useMemo(() => [
    { id: 'reply1', postId: 'fp3', postTitle: 'GTI vs Golf R for a daily driver', content: 'Had both. The R is worth it if you live somewhere with winter weather.', createdAt: '2024-02-13T18:30:00Z', upvotes: 24 },
    { id: 'reply2', postId: 'fp2', postTitle: 'My experience with ceramic coating after 2 years', content: 'Great write-up! What products do you use for maintenance?', createdAt: '2024-02-14T09:00:00Z', upvotes: 8 },
    { id: 'reply3', postId: 'fp6', postTitle: 'Modified car insurance - who are you with?', content: 'Adrian Flux has been decent for my mapped ST. About £650/year.', createdAt: '2024-02-12T15:45:00Z', upvotes: 45 },
  ], []);

  const savedPosts = useMemo(() => {
    return state.forumPosts.slice(3, 5); // posts 4-5 as "saved"
  }, [state.forumPosts]);

  return { posts: myPosts, replies: myReplies, savedPosts, isLoading, error: null };
}
