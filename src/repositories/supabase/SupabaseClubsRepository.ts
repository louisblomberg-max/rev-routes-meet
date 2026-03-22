import type { IClubsRepository } from '@/repositories/interfaces';
import type { Club, ClubMembership, ClubPost, ClubEvent } from '@/models';

export class SupabaseClubsRepository implements IClubsRepository {
  getAll(): Club[] { throw new Error('Not implemented — connect Supabase'); }
  getById(_id: string): Club | undefined { throw new Error('Not implemented — connect Supabase'); }
  create(_club: Omit<Club, 'id' | 'createdAt'>): Club { throw new Error('Not implemented — connect Supabase'); }
  update(_id: string, _updates: Partial<Club>): Club { throw new Error('Not implemented — connect Supabase'); }
  isHandleAvailable(_handle: string): boolean { throw new Error('Not implemented — connect Supabase'); }
  getMemberships(_userId: string): ClubMembership[] { throw new Error('Not implemented — connect Supabase'); }
  join(_userId: string, _clubId: string): ClubMembership { throw new Error('Not implemented — connect Supabase'); }
  leave(_userId: string, _clubId: string): void { throw new Error('Not implemented — connect Supabase'); }
  getClubPosts(_clubId: string): ClubPost[] { throw new Error('Not implemented — connect Supabase'); }
  createClubPost(_post: Omit<ClubPost, 'id'>): ClubPost { throw new Error('Not implemented — connect Supabase'); }
  getClubEvents(_clubId: string): ClubEvent[] { throw new Error('Not implemented — connect Supabase'); }
}
