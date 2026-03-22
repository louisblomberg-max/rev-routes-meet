import type { IRoutesRepository } from '@/repositories/interfaces';
import type { RevRoute, DiscoveryStats } from '@/models';

export class SupabaseRoutesRepository implements IRoutesRepository {
  getAll(): RevRoute[] { throw new Error('Not implemented — connect Supabase'); }
  getById(_id: string): RevRoute | undefined { throw new Error('Not implemented — connect Supabase'); }
  create(_route: Omit<RevRoute, 'id' | 'createdAt'>): RevRoute { throw new Error('Not implemented — connect Supabase'); }
  update(_id: string, _updates: Partial<RevRoute>): RevRoute { throw new Error('Not implemented — connect Supabase'); }
  delete(_id: string): void { throw new Error('Not implemented — connect Supabase'); }
  getUserRoutes(_userId: string): { saved: RevRoute[]; created: RevRoute[] } { throw new Error('Not implemented — connect Supabase'); }
  saveRoute(_userId: string, _routeId: string): void { throw new Error('Not implemented — connect Supabase'); }
  unsaveRoute(_userId: string, _routeId: string): void { throw new Error('Not implemented — connect Supabase'); }
  getDiscoveryStats(): Pick<DiscoveryStats, 'routesTrending'> { throw new Error('Not implemented — connect Supabase'); }
}
