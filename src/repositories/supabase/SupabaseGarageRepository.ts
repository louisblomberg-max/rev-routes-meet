// ============================
// Supabase Garage Repository (Placeholder)
// ============================
// TODO: Implement when Supabase is connected.
// This file mirrors IGarageRepository from @/models/garage.
// Replace LocalStorageGarageRepository with this class in GarageContext.

import type { IGarageRepository, GarageVehicle, UserPreferences } from '@/models/garage';

export class SupabaseGarageRepository implements IGarageRepository {
  // TODO: Inject supabase client via constructor
  // constructor(private supabase: SupabaseClient) {}

  getVehicles(_userId: string): GarageVehicle[] {
    // TODO: SELECT * FROM vehicles WHERE user_id = _userId ORDER BY is_primary DESC, created_at DESC
    throw new Error('Not implemented — use LocalStorageGarageRepository');
  }

  addVehicle(_vehicle: Omit<GarageVehicle, 'id' | 'createdAt'>): GarageVehicle {
    // TODO: INSERT INTO vehicles (...) VALUES (...) RETURNING *
    throw new Error('Not implemented');
  }

  updateVehicle(_vehicleId: string, _patch: Partial<GarageVehicle>): GarageVehicle {
    // TODO: UPDATE vehicles SET ... WHERE id = _vehicleId RETURNING *
    throw new Error('Not implemented');
  }

  deleteVehicle(_vehicleId: string): void {
    // TODO: DELETE FROM vehicles WHERE id = _vehicleId
    throw new Error('Not implemented');
  }

  setPrimaryVehicle(_vehicleId: string, _userId: string): void {
    // TODO: Transaction — UPDATE vehicles SET is_primary = false WHERE user_id = _userId;
    //       UPDATE vehicles SET is_primary = true WHERE id = _vehicleId;
    throw new Error('Not implemented');
  }

  getUserPreferences(_userId: string): UserPreferences {
    // TODO: SELECT * FROM user_preferences WHERE user_id = _userId
    throw new Error('Not implemented');
  }

  updateUserPreferences(_userId: string, _patch: Partial<UserPreferences>): UserPreferences {
    // TODO: UPSERT INTO user_preferences (...) VALUES (...)
    throw new Error('Not implemented');
  }
}
