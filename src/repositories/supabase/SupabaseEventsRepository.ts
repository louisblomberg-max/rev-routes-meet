import type { IEventsRepository } from '@/repositories/interfaces';
import type { RevEvent, DiscoveryStats } from '@/models';

export class SupabaseEventsRepository implements IEventsRepository {
  getAll(): RevEvent[] { throw new Error('Not implemented — connect Supabase'); }
  getById(_id: string): RevEvent | undefined { throw new Error('Not implemented — connect Supabase'); }
  create(_event: Omit<RevEvent, 'id' | 'createdAt'>): RevEvent { throw new Error('Not implemented — connect Supabase'); }
  update(_id: string, _updates: Partial<RevEvent>): RevEvent { throw new Error('Not implemented — connect Supabase'); }
  delete(_id: string): void { throw new Error('Not implemented — connect Supabase'); }
  getUserEvents(_userId: string): { upcoming: RevEvent[]; past: RevEvent[] } { throw new Error('Not implemented — connect Supabase'); }
  saveEvent(_userId: string, _eventId: string): void { throw new Error('Not implemented — connect Supabase'); }
  unsaveEvent(_userId: string, _eventId: string): void { throw new Error('Not implemented — connect Supabase'); }
  getSavedEvents(_userId: string): string[] { throw new Error('Not implemented — connect Supabase'); }
  getDiscoveryStats(): Pick<DiscoveryStats, 'eventsNearby'> { throw new Error('Not implemented — connect Supabase'); }
}
