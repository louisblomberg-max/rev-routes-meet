import type { IMapRepository, ViewportBounds } from '@/repositories/interfaces';
import type { MapItem } from '@/models';

export class SupabaseMapRepository implements IMapRepository {
  getMapItems(_bounds: ViewportBounds, _categories: string[]): MapItem[] { throw new Error('Not implemented — connect Supabase'); }
  createMapItem(_item: Omit<MapItem, 'id' | 'createdAt'>): MapItem { throw new Error('Not implemented — connect Supabase'); }
}
