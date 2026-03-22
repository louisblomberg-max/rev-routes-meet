import type { IUserRepository } from '@/repositories/interfaces';
import type { User, UserStats, Achievement, UserActivity } from '@/models';

export class SupabaseUserRepository implements IUserRepository {
  getCurrentUser(): User | null {
    throw new Error('Not implemented — connect Supabase');
  }
  updateUser(_updates: Partial<User>): User {
    throw new Error('Not implemented — connect Supabase');
  }
  getUserStats(_userId: string): UserStats {
    throw new Error('Not implemented — connect Supabase');
  }
  getAchievements(_userId: string): Achievement[] {
    throw new Error('Not implemented — connect Supabase');
  }
  getActivities(_userId: string): UserActivity[] {
    throw new Error('Not implemented — connect Supabase');
  }
  useEventCredit(_userId: string): boolean {
    throw new Error('Not implemented — connect Supabase');
  }
  useRouteCredit(_userId: string): boolean {
    throw new Error('Not implemented — connect Supabase');
  }
}
