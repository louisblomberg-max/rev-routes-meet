import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface OnboardingVehicle {
  id: string;
  vehicleType: 'car' | 'motorcycle';
  make: string;
  model: string;
  year: string;
  engine: string;
  modifications: string;
  horsepower: string;
  drivetrain: string;
  colour: string;
  imageUrl: string | null;
}

export interface OnboardingData {
  // Profile (step 7)
  avatarUrl: string | null;
  bio: string;
  // Username (step 8)
  username: string;
  // Garage (step 9)
  vehicles: OnboardingVehicle[];
  // Notifications (step 10)
  notifications: {
    newEventsNearby: boolean;
    clubActivity: boolean;
    marketplaceMessages: boolean;
    nearbyDrivers: boolean;
    sosAlerts: boolean;
  };
  // Interests (step 11)
  interests: string[];
  // Account (step 12)
  email: string;
  password: string;
}

const DEFAULT_DATA: OnboardingData = {
  avatarUrl: null,
  bio: '',
  username: '',
  vehicles: [],
  notifications: {
    newEventsNearby: true,
    clubActivity: false,
    marketplaceMessages: false,
    nearbyDrivers: false,
    sosAlerts: true,
  },
  interests: [],
  email: '',
  password: '',
};

interface OnboardingContextType {
  step: number;
  data: OnboardingData;
  totalSteps: number;
  setStep: (s: number) => void;
  next: () => void;
  back: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const TOTAL_ONBOARDING_STEPS = 12;

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);

  const next = useCallback(() => setStep(s => Math.min(s + 1, TOTAL_ONBOARDING_STEPS - 1)), []);
  const back = useCallback(() => setStep(s => Math.max(s - 1, 0)), []);
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <OnboardingContext.Provider value={{ step, data, totalSteps: TOTAL_ONBOARDING_STEPS, setStep, next, back, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
