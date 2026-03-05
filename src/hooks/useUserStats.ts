// ============================
// User Stats Hook
// ============================
// Single source of truth for user counts.
// Backed by DataContext (mock) — swap internals for Supabase later.

import { useUserStatsData } from './useProfileData';

export interface UserStats {
  garageCount: number;
  friendsCount: number;
  clubsCount: number;
  eventsCount: number;
  routesCount: number;
  discussionsCount: number;
  savedServicesCount: number;
}

export const useUserStats = (_userId?: string): UserStats => {
  return useUserStatsData();
};
