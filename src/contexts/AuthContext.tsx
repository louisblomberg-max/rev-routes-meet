import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { PlanId } from '@/models';
import { toast } from 'sonner';

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
  discoveryRadiusMiles: number;
  discoveryScope: 'local' | 'national' | 'continental' | 'global';
  notificationPrefs: NotificationPrefs;
  permissions?: {
    notificationsEnabled: boolean;
    locationEnabled: boolean;
  };
  locationPermissionStatus?: 'not_requested' | 'allowed' | 'denied' | 'skipped';
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
  vehicles: any[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ onboardingComplete: boolean }>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const loadUserProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const p = profileRes.data;
      const s = subRes.data;

      const authUser: AuthUser = {
        id: userId,
        email: email,
        displayName: p?.display_name || email?.split('@')[0] || 'User',
        username: p?.username || undefined,
        avatar: p?.avatar_url || null,
        bio: p?.bio || '',
        location: p?.location || '',
        country: p?.country || 'GB',
        membershipPlan: (p?.plan as PlanId) || 'free',
        billingCycle: (s?.billing_cycle as BillingCycle) || 'monthly',
        subscriptionStatus: (s?.status as SubscriptionStatus) || 'active',
        isProfileComplete: p?.onboarding_complete || false,
        isVerified: true,
        onboardingComplete: p?.onboarding_complete || false,
        onboardingStep: p?.onboarding_step || 0,
        interests: { events: [], routes: [], services: [], clubs: false, marketplace: false },
        vehicleTypes: [],
        vehicleTags: [],
        vehicles: [],
        discoveryRadiusMiles: p?.discovery_radius_miles || 25,
        discoveryScope: 'local',
        notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
        preferences: {
          mapStyle: 'standard',
          availableToHelp: p?.available_to_help || false,
          helpDistanceMiles: p?.help_radius_miles || 10,
          locationSharingEnabled: p?.live_location_sharing || false,
          notifications: { messages: true, events: true, clubs: true, forums: true, marketplace: true },
        },
        liveFeatures: { locationSharingEnabled: p?.live_location_sharing || false, groupDrivesCount: 0, breakdownHelpCount: 0 },
        eventCredits: p?.event_credits ?? 2,
        routeCredits: p?.route_credits ?? 2,
        createdAt: p?.created_at || new Date().toISOString(),
      };

      setUser(authUser);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, []);

  // Auth state listener
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email ?? undefined);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up listener BEFORE getSession (per Supabase docs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email ?? undefined);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<{ onboardingComplete: boolean }> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setIsLoading(false); throw error; }

    // Check onboarding status from profile
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('id', data.user.id)
        .single();
      return { onboardingComplete: profile?.onboarding_complete ?? false };
    }
    return { onboardingComplete: false };
  }, []);

  const loginPhone = useCallback(async (phone: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) { setIsLoading(false); throw error; }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });
    if (error) { setIsLoading(false); throw error; }
  }, []);

  const registerPhone = useCallback(async (phone: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) { setIsLoading(false); throw error; }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) { setIsLoading(false); throw error; }
    setIsLoading(false);
  }, []);

  const requestVerificationCode = useCallback(async (destination: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email: destination });
    if (error) { setIsLoading(false); throw error; }
    setIsLoading(false);
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      token: code,
      type: 'email',
      email: user?.email || ''
    });
    setIsLoading(false);
    return !error;
  }, [user?.email]);

  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);

    if (!user?.id) return;

    // Sync relevant fields to Supabase profiles table
    const profileUpdates: Record<string, unknown> = {};
    if (updates.username !== undefined) profileUpdates.username = updates.username;
    if (updates.displayName !== undefined) profileUpdates.display_name = updates.displayName;
    if (updates.avatar !== undefined) profileUpdates.avatar_url = updates.avatar;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.location !== undefined) profileUpdates.location = updates.location;
    if (updates.country !== undefined) profileUpdates.country = updates.country;
    // SECURITY: plan, event_credits, route_credits, free_event_credits must never be written from the client
    // These are only modified via server-side webhooks/RPCs
    if (updates.discoveryRadiusMiles !== undefined) profileUpdates.discovery_radius_miles = updates.discoveryRadiusMiles;
    if (updates.preferences?.availableToHelp !== undefined) profileUpdates.available_to_help = updates.preferences.availableToHelp;
    if (updates.preferences?.helpDistanceMiles !== undefined) profileUpdates.help_radius_miles = updates.preferences.helpDistanceMiles;
    if (updates.preferences?.locationSharingEnabled !== undefined) profileUpdates.live_location_sharing = updates.preferences.locationSharingEnabled;

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
      if (error) console.error('Profile update error:', error);
    }
  }, [user?.id]);

  const completeOnboarding = useCallback(async () => {
    setUser(prev => prev ? { ...prev, onboardingComplete: true, isProfileComplete: true } : null);
    if (user?.id) {
      const { error } = await supabase.from('profiles').update({
        onboarding_complete: true,
        onboarding_step: 14,
      }).eq('id', user.id);
      if (error) {
        toast.error('Failed to save onboarding status');
        console.error(error);
      }
    }
  }, [user?.id]);

  const setOnboardingStep = useCallback(async (step: number) => {
    setUser(prev => prev ? { ...prev, onboardingStep: step } : null);
    if (user?.id) {
      await supabase.from('profiles').update({ onboarding_step: step }).eq('id', user.id);
    }
  }, [user?.id]);

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
