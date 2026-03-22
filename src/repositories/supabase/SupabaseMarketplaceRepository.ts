import type { IMarketplaceRepository } from '@/repositories/interfaces';
import type { MarketplaceListing } from '@/models';

export class SupabaseMarketplaceRepository implements IMarketplaceRepository {
  getListings(): MarketplaceListing[] { throw new Error('Not implemented — connect Supabase'); }
  getById(_id: string): MarketplaceListing | undefined { throw new Error('Not implemented — connect Supabase'); }
  createListing(_listing: Omit<MarketplaceListing, 'id' | 'createdAt'>): MarketplaceListing { throw new Error('Not implemented — connect Supabase'); }
  getSavedListings(_userId: string): string[] { throw new Error('Not implemented — connect Supabase'); }
  saveListing(_userId: string, _listingId: string): void { throw new Error('Not implemented — connect Supabase'); }
  unsaveListing(_userId: string, _listingId: string): void { throw new Error('Not implemented — connect Supabase'); }
}
