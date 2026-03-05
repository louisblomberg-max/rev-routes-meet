import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface AuthVehicle {
  id: string;
  type: 'car' | 'motorcycle';
  make: string;
  model: string;
  year?: string;
  trim?: string;
  color?: string;
  isPrimary: boolean;
}

export interface NotificationPrefs {
  newEventsNearby: boolean;
  friendsNearby: boolean;
  clubAnnouncements: boolean;
  marketplaceMessages: boolean;
  sosAlerts: boolean;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  displayName?: string;
  username?: string;
  avatar?: string | null;
  location?: string;
  locationCoords?: { lat: number; lng: number };
  bio?: string;
  country?: string;
  membershipPlan: 'free' | 'pro' | 'club';
  isProfileComplete: boolean;
  isVerified: boolean;
  onboardingComplete: boolean;
  onboardingStep: number; // 0-5 (basics, interests, vehicle, location, notifications, plan)
  interests: {
    events: string[];
    routes: string[];
    services: string[];
    clubs: boolean;
    marketplace: boolean;
  };
  vehicleTypes: string[]; // 'cars' | 'motorcycles' | 'both'
  vehicleTags: string[]; // 'classic', 'supercars', 'jdm', etc.
  vehicles: AuthVehicle[];
  discoveryRadiusMiles: number;
  discoveryScope: 'local' | 'national' | 'continental' | 'global';
  notificationPrefs: NotificationPrefs;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginPhone: (phone: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  registerPhone: (phone: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  requestVerificationCode: (destination: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  updateProfile: (updates: Partial<AuthUser>) => void;
  completeOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  newEventsNearby: false,
  friendsNearby: false,
  clubAnnouncements: false,
  marketplaceMessages: false,
  sosAlerts: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('revnet_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('revnet_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('revnet_user');
    }
  }, [user]);

  const createUser = (partial: Partial<AuthUser>): AuthUser => ({
    id: crypto.randomUUID(),
    email: undefined,
    phone: undefined,
    displayName: undefined,
    username: undefined,
    avatar: null,
    bio: '',
    country: 'GB',
    membershipPlan: 'free',
    isProfileComplete: false,
    isVerified: false,
    onboardingComplete: false,
    onboardingStep: 0,
    interests: { events: [], routes: [], services: [], clubs: false, marketplace: false },
    vehicleTypes: [],
    vehicleTags: [],
    vehicles: [],
    discoveryRadiusMiles: 25,
    discoveryScope: 'local',
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
    createdAt: new Date().toISOString(),
    ...partial,
  });

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser(prev => prev ?? createUser({
      email,
      displayName: email.split('@')[0],
      isVerified: true,
      isProfileComplete: true,
      onboardingComplete: true,
    }));
    setIsLoading(false);
  }, []);

  const loginPhone = useCallback(async (phone: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser(createUser({ phone, isVerified: false }));
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, _password: string, displayName: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser(createUser({
      email,
      displayName,
      isVerified: true, // Skip verify for now to go straight to onboarding
      onboardingComplete: false,
      onboardingStep: 0,
    }));
    setIsLoading(false);
  }, []);

  const registerPhone = useCallback(async (phone: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser(createUser({ phone, isVerified: false }));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('revnet_user');
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
  }, []);

  const requestVerificationCode = useCallback(async (_destination: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const valid = code.length === 6;
    if (valid) {
      setUser(prev => prev ? { ...prev, isVerified: true } : null);
    }
    setIsLoading(false);
    return valid;
  }, []);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(prev => prev ? { ...prev, onboardingComplete: true, isProfileComplete: true } : null);
  }, []);

  const setOnboardingStep = useCallback((step: number) => {
    setUser(prev => prev ? { ...prev, onboardingStep: step } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginPhone,
      register,
      registerPhone,
      logout,
      resetPassword,
      requestVerificationCode,
      verifyCode,
      updateProfile,
      completeOnboarding,
      setOnboardingStep,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
