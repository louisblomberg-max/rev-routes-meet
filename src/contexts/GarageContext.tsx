// ============================
// GarageProvider — Garage + Preferences data layer
// ============================
// Backed by localStorage (mock). Swap to Supabase by changing USE_SUPABASE flag.

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import type { GarageVehicle, UserPreferences, IGarageRepository } from '@/models/garage';
import { DEFAULT_PREFERENCES } from '@/models/garage';
import { LocalStorageGarageRepository } from '@/repositories/mock/LocalStorageGarageRepository';
import { useAuth } from '@/contexts/AuthContext';

interface GarageContextType {
  vehicles: GarageVehicle[];
  preferences: UserPreferences;
  primaryVehicle: GarageVehicle | null;
  addVehicle: (vehicle: Omit<GarageVehicle, 'id' | 'createdAt'>) => GarageVehicle;
  updateVehicle: (vehicleId: string, patch: Partial<GarageVehicle>) => void;
  deleteVehicle: (vehicleId: string) => void;
  setPrimaryVehicle: (vehicleId: string) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  isLoading: boolean;
}

const GarageContext = createContext<GarageContextType | undefined>(undefined);

// Singleton repo instance
const repo: IGarageRepository & { subscribe?: (fn: () => void) => () => void } = new LocalStorageGarageRepository();

export const GarageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({ ...DEFAULT_PREFERENCES, userId });
  const [isLoading, setIsLoading] = useState(true);

  // Load from repo
  const reload = useCallback(() => {
    if (!userId) { setVehicles([]); setPreferences({ ...DEFAULT_PREFERENCES, userId: '' }); return; }
    setVehicles(repo.getVehicles(userId));
    setPreferences(repo.getUserPreferences(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  // Subscribe to repo changes
  useEffect(() => {
    if ((repo as any).subscribe) {
      return (repo as any).subscribe(reload);
    }
  }, [reload]);

  const addVehicle = useCallback((vehicle: Omit<GarageVehicle, 'id' | 'createdAt'>) => {
    const v = repo.addVehicle({ ...vehicle, userId });
    reload();
    return v;
  }, [userId, reload]);

  const updateVehicle = useCallback((vehicleId: string, patch: Partial<GarageVehicle>) => {
    repo.updateVehicle(vehicleId, { ...patch, userId });
    reload();
  }, [userId, reload]);

  const deleteVehicle = useCallback((vehicleId: string) => {
    repo.deleteVehicle(vehicleId);
    reload();
  }, [reload]);

  const setPrimary = useCallback((vehicleId: string) => {
    repo.setPrimaryVehicle(vehicleId, userId);
    reload();
  }, [userId, reload]);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    repo.updateUserPreferences(userId, patch);
    reload();
  }, [userId, reload]);

  const primaryVehicle = useMemo(() => vehicles.find(v => v.isPrimary) || vehicles[0] || null, [vehicles]);

  return (
    <GarageContext.Provider value={{
      vehicles, preferences, primaryVehicle,
      addVehicle, updateVehicle, deleteVehicle,
      setPrimaryVehicle: setPrimary, updatePreferences, isLoading,
    }}>
      {children}
    </GarageContext.Provider>
  );
};

export const useGarage = () => {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error('useGarage must be used within GarageProvider');
  return ctx;
};

export const useUserPreferences = () => {
  const ctx = useContext(GarageContext);
  if (!ctx) throw new Error('useUserPreferences must be used within GarageProvider');
  return { preferences: ctx.preferences, updatePreferences: ctx.updatePreferences };
};
