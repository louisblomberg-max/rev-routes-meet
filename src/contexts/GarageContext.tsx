import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import type { GarageVehicle, UserPreferences } from '@/models/garage';
import { DEFAULT_PREFERENCES } from '@/models/garage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const GarageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [vehicles, setVehicles] = useState<GarageVehicle[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({ ...DEFAULT_PREFERENCES, userId });
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles and preferences from Supabase
  const reload = useCallback(async () => {
    if (!userId) {
      setVehicles([]);
      setPreferences({ ...DEFAULT_PREFERENCES, userId: '' });
      setIsLoading(false);
      return;
    }

    try {
      const [vRes, pRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('user_id', userId).order('is_primary', { ascending: false }),
        supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      if (vRes.data) {
        setVehicles(vRes.data.map((v: any) => ({
          id: v.id,
          userId: v.user_id,
          vehicleType: v.vehicle_type || 'car',
          make: v.make,
          model: v.model || '',
          year: v.year ? parseInt(v.year) : undefined,
          trim: v.details || undefined,
          engine: v.engine || undefined,
          transmission: v.transmission as any || undefined,
          drivetrain: v.drivetrain as any || undefined,
          colour: v.colour || undefined,
          numberPlate: v.number_plate || undefined,
          mileage: undefined,
          tags: v.tags || [],
          modsText: v.mods_text || undefined,
          photos: v.photos || [],
          visibility: v.visibility || 'public',
          isPrimary: v.is_primary || false,
          createdAt: v.created_at,
        })));
      }

      if (pRes.data) {
        const p = pRes.data as any;
        setPreferences({
          userId,
          vehicleTypes: p.vehicle_interests || ['car'],
          interests: [],
          styleTags: [],
          notifications: {
            newEventsNearby: true,
            friendsNearby: true,
            clubAnnouncements: true,
            marketplaceMessages: true,
            sosAlerts: true,
          },
        });
      }
    } catch (err) {
      console.error('Garage load error:', err);
    }

    setIsLoading(false);
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  const addVehicle = useCallback((vehicle: Omit<GarageVehicle, 'id' | 'createdAt'>): GarageVehicle => {
    const tempId = crypto.randomUUID();
    const newVehicle: GarageVehicle = {
      ...vehicle,
      id: tempId,
      userId: userId,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setVehicles(prev => [...prev, newVehicle]);

    // Async insert to Supabase
    (async () => {
      const { data, error } = await supabase.from('vehicles').insert({
        user_id: userId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year?.toString(),
        engine: vehicle.engine || null,
        transmission: vehicle.transmission || null,
        drivetrain: vehicle.drivetrain || null,
        colour: vehicle.colour || null,
        number_plate: vehicle.numberPlate || null,
        details: vehicle.trim || null,
        mods_text: vehicle.modsText || null,
        photos: vehicle.photos || [],
        tags: vehicle.tags || [],
        visibility: vehicle.visibility || 'public',
        is_primary: vehicle.isPrimary || false,
        vehicle_type: vehicle.vehicleType || 'car',
      }).select().single();

      if (error) {
        toast.error('Failed to save vehicle');
        setVehicles(prev => prev.filter(v => v.id !== tempId));
      } else if (data) {
        setVehicles(prev => prev.map(v => v.id === tempId ? { ...v, id: data.id } : v));
      }
    })();

    return newVehicle;
  }, [userId]);

  const updateVehicle = useCallback(async (vehicleId: string, patch: Partial<GarageVehicle>) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, ...patch } : v));

    const updates: Record<string, unknown> = {};
    if (patch.make !== undefined) updates.make = patch.make;
    if (patch.model !== undefined) updates.model = patch.model;
    if (patch.year !== undefined) updates.year = patch.year?.toString();
    if (patch.engine !== undefined) updates.engine = patch.engine;
    if (patch.transmission !== undefined) updates.transmission = patch.transmission;
    if (patch.drivetrain !== undefined) updates.drivetrain = patch.drivetrain;
    if (patch.colour !== undefined) updates.colour = patch.colour;
    if (patch.numberPlate !== undefined) updates.number_plate = patch.numberPlate;
    if (patch.trim !== undefined) updates.details = patch.trim;
    if (patch.modsText !== undefined) updates.mods_text = patch.modsText;
    if (patch.photos !== undefined) updates.photos = patch.photos;
    if (patch.tags !== undefined) updates.tags = patch.tags;
    if (patch.visibility !== undefined) updates.visibility = patch.visibility;
    if (patch.isPrimary !== undefined) updates.is_primary = patch.isPrimary;
    if (patch.vehicleType !== undefined) updates.vehicle_type = patch.vehicleType;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('vehicles').update(updates).eq('id', vehicleId);
      if (error) toast.error('Failed to update vehicle');
    }
  }, []);

  const deleteVehicle = useCallback(async (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId);
    if (error) {
      toast.error('Failed to delete vehicle');
      reload();
    }
  }, [reload]);

  const setPrimary = useCallback(async (vehicleId: string) => {
    setVehicles(prev => prev.map(v => ({ ...v, isPrimary: v.id === vehicleId })));

    // Clear all, then set one
    await supabase.from('vehicles').update({ is_primary: false }).eq('user_id', userId);
    const { error } = await supabase.from('vehicles').update({ is_primary: true }).eq('id', vehicleId);
    if (error) toast.error('Failed to set primary vehicle');
  }, [userId]);

  const updatePreferences = useCallback(async (patch: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...patch }));

    if (!userId) return;
    const updates: Record<string, unknown> = {};
    if (patch.vehicleTypes) updates.vehicle_interests = patch.vehicleTypes;
    if (patch.notifications) updates.notification_prefs = patch.notifications;

    if (Object.keys(updates).length > 0) {
      await supabase.from('user_preferences').update(updates).eq('user_id', userId);
    }
  }, [userId]);

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
