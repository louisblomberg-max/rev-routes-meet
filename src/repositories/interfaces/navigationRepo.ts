/**
 * Navigation Repository Interface — Supabase-ready stubs.
 * Swap MockNavigationRepository for SupabaseNavigationRepository later.
 */

export interface RecentDestination {
  id: string;
  userId: string;
  title: string;
  lat: number;
  lng: number;
  type: 'event' | 'route' | 'service' | 'club';
  visitedAt: string;
}

export interface NavigationSession {
  id: string;
  userId: string;
  destinationTitle: string;
  destinationLat: number;
  destinationLng: number;
  startedAt: string;
  endedAt?: string;
  distanceMeters?: number;
  durationSeconds?: number;
  completed: boolean;
}

export interface INavigationRepository {
  getRecentDestinations(userId: string): RecentDestination[];
  saveRecentDestination(userId: string, destination: Omit<RecentDestination, 'id' | 'userId' | 'visitedAt'>): RecentDestination;
  saveNavigationSessionStart(userId: string, destination: { title: string; lat: number; lng: number }): NavigationSession;
  saveNavigationSessionEnd(sessionId: string, stats: { distanceMeters: number; durationSeconds: number; completed: boolean }): NavigationSession;
}
