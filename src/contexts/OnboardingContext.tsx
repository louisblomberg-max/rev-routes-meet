import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
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
    return { step: parsed.step ?? 0, data: { ...DEFAULT_DATA, ...parsed.data } };
  } catch {
    return null;
  }
}

function persistState(step: number, data: OnboardingData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
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
  clearOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const persisted = loadPersistedState();
  const [step, setStepState] = useState(persisted?.step ?? 0);
  const [data, setData] = useState<OnboardingData>(() => ({
    ...DEFAULT_DATA,
    ...(persisted?.data ?? {}),
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
    setData(prev => ({ ...prev, ...updates }));
  }, []);
  const clearOnboarding = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStepState(0);
    setData({ ...DEFAULT_DATA });
  }, []);

  return (
    <OnboardingContext.Provider value={{ step, data, totalSteps: TOTAL_ONBOARDING_STEPS, setStep, next, back, updateData, clearOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
