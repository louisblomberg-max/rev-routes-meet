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
