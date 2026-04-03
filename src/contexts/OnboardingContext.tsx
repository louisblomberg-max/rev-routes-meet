import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingVehicle {
  id: string;
  vehicleType: 'car' | 'motorcycle';
  make: string;
  model: string;
  year: string;
  trim: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  colour: string;
  mileage: string;
  numberPlate: string;
  tags: string[];
  modsText: string;
  photos: string[];
  visibility: 'public' | 'friends' | 'private';
  isPrimary: boolean;
}

export interface OnboardingData {
  avatarUrl: string | null;
  bio: string;
  location: string;
  username: string;
  vehicles: OnboardingVehicle[];
  notificationsEnabled: boolean;
  locationPermissionStatus: 'not_requested' | 'allowed' | 'denied' | 'skipped';
  plan: 'free' | 'pro' | 'club';
  billingCycle: 'monthly' | 'yearly';
}

const DEFAULT_DATA: OnboardingData = {
  avatarUrl: null,
  bio: '',
  location: '',
  username: '',
  vehicles: [],
  notificationsEnabled: false,
  locationPermissionStatus: 'not_requested',
  plan: 'free',
  billingCycle: 'yearly',
};

// 6 steps: 0=Profile, 1=Username, 2=Garage, 3=Notifications, 4=Location, 5=Plan
export const TOTAL_ONBOARDING_STEPS = 6;

const STORAGE_KEY = 'revnet_onboarding_state';

function loadPersistedState(): { step: number; data: OnboardingData } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const data = { ...DEFAULT_DATA, ...parsed.data };
    // Always ensure vehicles is an array
    if (!Array.isArray(data.vehicles)) data.vehicles = [];
    return { step: parsed.step ?? 0, data };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistState(step: number, data: OnboardingData) {
  try {
    // Strip base64 photos and large data to avoid localStorage quota issues
    const safeData = {
      ...data,
      vehicles: (data.vehicles || []).map(v => ({
        ...v,
        photos: [], // Never store base64 in localStorage
      })),
      // Only persist URL-based avatars, not base64
      avatarUrl: data.avatarUrl?.startsWith('http') ? data.avatarUrl : null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data: safeData }));
  } catch {}
}

interface OnboardingContextType {
  step: number;
  data: OnboardingData;
  totalSteps: number;
  setStep: (s: number) => void;
  next: () => void;
  back: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  addVehicle: (vehicle: OnboardingVehicle) => void;
  removeVehicle: (vehicleId: string) => void;
  updateVehicle: (vehicleId: string, field: keyof OnboardingVehicle, value: any) => void;
  clearOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const persisted = loadPersistedState();
  const [step, setStepState] = useState(persisted?.step ?? 0);
  const [data, setData] = useState<OnboardingData>(() => ({
    ...DEFAULT_DATA,
    ...(persisted?.data ?? {}),
    vehicles: persisted?.data?.vehicles ?? [],
  }));

  useEffect(() => {
    persistState(step, data);
  }, [step, data]);

  // Session heartbeat
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await supabase.auth.getSession();
      } catch {}
    }, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const setStep = useCallback((s: number) => setStepState(s), []);
  const next = useCallback(() => setStepState(s => Math.min(s + 1, TOTAL_ONBOARDING_STEPS - 1)), []);
  const back = useCallback(() => setStepState(s => Math.max(s - 1, 0)), []);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => {
      const merged = { ...prev, ...updates };
      // Always ensure vehicles is an array
      if (!Array.isArray(merged.vehicles)) merged.vehicles = [];
      return merged;
    });
  }, []);

  const addVehicle = useCallback((vehicle: OnboardingVehicle) => {
    setData(prev => {
      const currentVehicles = Array.isArray(prev.vehicles) ? prev.vehicles : [];
      // First vehicle is always primary
      const newVehicle = {
        ...vehicle,
        isPrimary: currentVehicles.length === 0,
      };
      const updated = [...currentVehicles, newVehicle];
      return { ...prev, vehicles: updated };
    });
  }, []);

  const removeVehicle = useCallback((vehicleId: string) => {
    setData(prev => {
      const updated = prev.vehicles.filter(v => v.id !== vehicleId);
      // Make first remaining vehicle primary
      if (updated.length > 0 && !updated.some(v => v.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return { ...prev, vehicles: updated };
    });
  }, []);

  const updateVehicleInContext = useCallback((vehicleId: string, field: keyof OnboardingVehicle, value: any) => {
    setData(prev => {
      const updated = prev.vehicles.map(v => {
        if (v.id !== vehicleId) return v;
        // Special handling for isPrimary - only one can be primary
        if (field === 'isPrimary' && value === true) {
          return { ...v, isPrimary: true };
        }
        return { ...v, [field]: value };
      });
      // If setting isPrimary, unset others
      if (field === 'isPrimary' && value === true) {
        return { ...prev, vehicles: updated.map(v => v.id === vehicleId ? v : { ...v, isPrimary: false }) };
      }
      return { ...prev, vehicles: updated };
    });
  }, []);

  const clearOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStepState(0);
    setData({ ...DEFAULT_DATA });
  }, []);

  return (
    <OnboardingContext.Provider value={{
      step, data, totalSteps: TOTAL_ONBOARDING_STEPS,
      setStep, next, back, updateData,
      addVehicle, removeVehicle, updateVehicle: updateVehicleInContext,
      clearOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
