import type { IServicesRepository } from '@/repositories/interfaces';
import type { RevService, DiscoveryStats } from '@/models';

export class SupabaseServicesRepository implements IServicesRepository {
  getAll(): RevService[] { throw new Error('Not implemented — connect Supabase'); }
  getById(_id: string): RevService | undefined { throw new Error('Not implemented — connect Supabase'); }
  create(_service: Omit<RevService, 'id' | 'createdAt'>): RevService { throw new Error('Not implemented — connect Supabase'); }
  update(_id: string, _updates: Partial<RevService>): RevService { throw new Error('Not implemented — connect Supabase'); }
  delete(_id: string): void { throw new Error('Not implemented — connect Supabase'); }
  saveService(_userId: string, _serviceId: string): void { throw new Error('Not implemented — connect Supabase'); }
  unsaveService(_userId: string, _serviceId: string): void { throw new Error('Not implemented — connect Supabase'); }
  getSavedServices(_userId: string): string[] { throw new Error('Not implemented — connect Supabase'); }
  getDiscoveryStats(): Pick<DiscoveryStats, 'servicesOpenNow'> { throw new Error('Not implemented — connect Supabase'); }
}
