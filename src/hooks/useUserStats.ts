import { useMemo } from 'react';
import { mockUserProfile, mockFriends, mockActivities } from '@/data/profileData';

export interface UserStats {
  garageCount: number;
  friendsCount: number;
  clubsCount: number;
  eventsCount: number;
  routesCount: number;
  discussionsCount: number;
}

/**
 * Single source of truth for user stats.
 * Currently backed by mock data — swap internals for real API/DB later.
 */
export const useUserStats = (_userId?: string): UserStats => {
  return useMemo(() => ({
    garageCount: mockUserProfile.garage.length,
    friendsCount: mockFriends.filter(f => f.status === 'accepted').length,
    clubsCount: mockUserProfile.stats.clubsJoined,
    eventsCount: mockUserProfile.stats.eventsAttended,
    routesCount: mockUserProfile.stats.routesSaved,
    discussionsCount: mockActivities.filter(a => a.type === 'forum_post' || a.type === 'forum_reply').length,
  }), []);
};
