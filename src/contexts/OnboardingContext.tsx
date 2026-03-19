import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

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
  // Account
  email: string;
  password: string;
  authProvider: 'email' | 'apple' | 'google';

  // Profile
  avatarUrl: string | null;
  username: string;
  bio: string;
  location: string;
  drivingStyle: string;

  // Garage
  vehicles: OnboardingVehicle[];

  // Vehicle Interests
  vehicleInterests: string[];

  // Preferences (grouped)
  eventTypes: string[];
  routeTypes: string[];
  serviceTypes: string[];
  communityTypes: string[];

  // Goals
  goals: string[];

  // Social
  joinedClubs: string[];

  // Permissions
  permissions: {
    notificationsEnabled: boolean;
    locationEnabled: boolean;
  };
  locationPermissionStatus: 'not_requested' | 'allowed' | 'denied' | 'skipped';

  // Notifications
  notifications: {
    newEventsNearby: boolean;
    clubActivity: boolean;
    marketplaceMessages: boolean;
    nearbyDrivers: boolean;
    sosAlerts: boolean;
  };

  // Subscription
  plan: 'free' | 'pro' | 'club';
  billingCycle: 'monthly' | 'yearly';

  // Legacy compat
  interests: string[];
}

const DEFAULT_DATA: OnboardingData = {
  email: '',
  password: '',
  authProvider: 'email',
  avatarUrl: null,
  username: '',
  bio: '',
  location: '',
  drivingStyle: '',
  vehicles: [],
  vehicleInterests: [],
  eventTypes: [],
  routeTypes: [],
  serviceTypes: [],
  communityTypes: [],
  goals: [],
  joinedClubs: [],
  permissions: {
    notificationsEnabled: false,
    locationEnabled: false,
  },
  locationPermissionStatus: 'not_requested',
  notifications: {
    newEventsNearby: false,
    clubActivity: false,
    marketplaceMessages: false,
    nearbyDrivers: false,
    sosAlerts: false,
  },
  plan: 'free',
  billingCycle: 'yearly',
  interests: [],
};

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
    const { password, ...safeData } = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data: safeData }));
  } catch {
    // Storage full or unavailable
  }
}

interface OnboardingContextType {
  step: number;
  data: OnboardingData;
  totalSteps: number;
  setupSteps: number;
  setStep: (s: number) => void;
  next: () => void;
  back: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  clearOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Steps 0-5: Welcome + Feature slides, Steps 6-17: Setup steps (12 setup steps)
export const TOTAL_ONBOARDING_STEPS = 18;
export const SETUP_STEPS = 12; // Account through Plan

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
    <OnboardingContext.Provider value={{ step, data, totalSteps: TOTAL_ONBOARDING_STEPS, setupSteps: SETUP_STEPS, setStep, next, back, updateData, clearOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
