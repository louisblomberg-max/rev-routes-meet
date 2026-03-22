import type { IHelpRepository } from '@/repositories/interfaces';
import type { HelpRequest, StolenVehicleAlert } from '@/models';

export class SupabaseHelpRepository implements IHelpRepository {
  createHelpRequest(_request: Omit<HelpRequest, 'id' | 'createdAt'>): HelpRequest { throw new Error('Not implemented — connect Supabase'); }
  getActiveRequests(): HelpRequest[] { throw new Error('Not implemented — connect Supabase'); }
  resolveRequest(_id: string): void { throw new Error('Not implemented — connect Supabase'); }
  createStolenAlert(_alert: Omit<StolenVehicleAlert, 'id' | 'createdAt'>): StolenVehicleAlert { throw new Error('Not implemented — connect Supabase'); }
  getActiveStolenAlerts(): StolenVehicleAlert[] { throw new Error('Not implemented — connect Supabase'); }
}
