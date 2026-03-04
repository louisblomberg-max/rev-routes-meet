/**
 * Mock Navigation Repository — stores in localStorage.
 */

import type { INavigationRepository, RecentDestination, NavigationSession } from '../interfaces/navigationRepo';

const STORAGE_KEY_RECENT = 'revnet_recent_destinations';
const STORAGE_KEY_SESSIONS = 'revnet_nav_sessions';

export class MockNavigationRepository implements INavigationRepository {
  private getRecents(): RecentDestination[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]');
    } catch { return []; }
  }

  private getSessions(): NavigationSession[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '[]');
    } catch { return []; }
  }

  getRecentDestinations(userId: string): RecentDestination[] {
    return this.getRecents().filter(d => d.userId === userId).slice(0, 10);
  }

  saveRecentDestination(userId: string, destination: Omit<RecentDestination, 'id' | 'userId' | 'visitedAt'>): RecentDestination {
    const recents = this.getRecents();
    const entry: RecentDestination = {
      ...destination,
      id: crypto.randomUUID(),
      userId,
      visitedAt: new Date().toISOString(),
    };
    recents.unshift(entry);
    localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recents.slice(0, 50)));
    return entry;
  }

  saveNavigationSessionStart(userId: string, destination: { title: string; lat: number; lng: number }): NavigationSession {
    const sessions = this.getSessions();
    const session: NavigationSession = {
      id: crypto.randomUUID(),
      userId,
      destinationTitle: destination.title,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
      startedAt: new Date().toISOString(),
      completed: false,
    };
    sessions.unshift(session);
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions.slice(0, 100)));
    return session;
  }

  saveNavigationSessionEnd(sessionId: string, stats: { distanceMeters: number; durationSeconds: number; completed: boolean }): NavigationSession {
    const sessions = this.getSessions();
    const idx = sessions.findIndex(s => s.id === sessionId);
    if (idx >= 0) {
      sessions[idx] = {
        ...sessions[idx],
        endedAt: new Date().toISOString(),
        ...stats,
      };
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      return sessions[idx];
    }
    throw new Error('Session not found');
  }
}
