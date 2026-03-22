import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { PlanId } from '@/models';

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

export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'selected';

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
  membershipPlan: PlanId;
  billingCycle: BillingCycle;
  subscriptionStatus: SubscriptionStatus;
  isProfileComplete: boolean;
  isVerified: boolean;
  onboardingComplete: boolean;
  onboardingStep: number;
  interests: {
    events: string[];
    routes: string[];
    services: string[];
    clubs: boolean;
    marketplace: boolean;
  };
  vehicleTypes: string[];
  vehicleTags: string[];
  vehicles: AuthVehicle[];
  discoveryRadiusMiles: number;
  discoveryScope: 'local' | 'national' | 'continental' | 'global';
  notificationPrefs: NotificationPrefs;
  permissions?: {
    notificationsEnabled: boolean;
    locationEnabled: boolean;
  };
  locationPermissionStatus?: 'not_requested' | 'allowed' | 'denied' | 'skipped';
  // Fields from DataContext User model
  preferences: {
    mapStyle: 'standard' | 'night' | 'satellite';
    availableToHelp: boolean;
    helpDistanceMiles: number;
    locationSharingEnabled: boolean;
    notifications: {
      messages: boolean;
      events: boolean;
      clubs: boolean;
      forums: boolean;
      marketplace: boolean;
    };
  };
  liveFeatures: {
    locationSharingEnabled: boolean;
    groupDrivesCount: number;
    breakdownHelpCount: number;
  };
  eventCredits: number;
  routeCredits: number;
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
    billingCycle: 'yearly',
    subscriptionStatus: 'active',
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
    preferences: {
      mapStyle: 'standard',
      availableToHelp: false,
      helpDistanceMiles: 10,
      locationSharingEnabled: false,
      notifications: { messages: true, events: true, clubs: true, forums: true, marketplace: true },
    },
    liveFeatures: { locationSharingEnabled: false, groupDrivesCount: 0, breakdownHelpCount: 0 },
    eventCredits: 2,
    routeCredits: 2,
    createdAt: new Date().toISOString(),
    ...partial,
  });

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    // --- MOCK: fake delay ---
    await new Promise(r => setTimeout(r, 800));
    // TODO: Replace with supabase.auth.signInWithPassword({ email, password })
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
    // --- MOCK: fake delay ---
    await new Promise(r => setTimeout(r, 800));
    // TODO: Replace with supabase.auth.signInWithOtp({ phone })
    setUser(createUser({ phone, isVerified: false }));
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, _password: string, displayName: string) => {
    setIsLoading(true);
    // --- MOCK: fake delay ---
    await new Promise(r => setTimeout(r, 800));
    // TODO: Replace with supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
    setUser(createUser({
      email,
      displayName,
      isVerified: true,
      onboardingComplete: false,
      onboardingStep: 0,
    }));
    setIsLoading(false);
  }, []);

  const registerPhone = useCallback(async (phone: string) => {
    setIsLoading(true);
    // --- MOCK: fake delay ---
    await new Promise(r => setTimeout(r, 800));
    // TODO: Replace with supabase.auth.signUp({ phone })
    setUser(createUser({ phone, isVerified: false }));
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    // TODO: Replace with supabase.auth.signOut()
    setUser(null);
    localStorage.removeItem('revnet_user');
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    setIsLoading(true);
    // --- MOCK: fake delay ---
    await new Promise(r => setTimeout(r, 800));
    // TODO: Replace with supabase.auth.resetPasswordForEmail(email)
    setIsLoading(false);
  }, []);

  const requestVerificationCode = useCallback(async (_destination: string) => {
    setIsLoading(true);
    // --- MOCK: fake delay ---
    await new Promise(r => setTimeout(r, 600));
    // TODO: Replace with supabase.auth.resend({ type: 'signup', email: destination })
    setIsLoading(false);
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    setIsLoading(true);
    // --- MOCK: fake delay ---
    await new Promise(r => setTimeout(r, 800));
    // TODO: Replace with supabase.auth.verifyOtp({ token: code, type: 'email' })
    const valid = code.length === 6; // MOCK: any 6-digit code passes
    if (valid) {
      setUser(prev => prev ? { ...prev, isVerified: true } : null);
    }
    setIsLoading(false);
    return valid;
  }, []);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    // TODO: Replace with supabase.from('profiles').update(updates).eq('id', user.id)
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
