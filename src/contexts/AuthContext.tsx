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

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  plan: string | null;
  free_event_credits: number | null;
  onboarding_complete: boolean | null;
  profile_visibility: string | null;
  stripe_connect_account_id: string | null;
  created_at: string | null;
}

// Backward-compatible AuthUser shape used by existing pages
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
  vehicles: any[];
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
}

interface AuthContextType {
  // New clean exports
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Backward-compatible exports used by existing pages
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

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchProfileWithRetry(userId: string, retries = 5, delayMs = 800): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) return data;
    if (i < retries - 1) await delay(delayMs);
  }
  return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const buildAuthUser = useCallback((userId: string, email: string | undefined, p: any, s: any): AuthUser => {
    return {
      id: userId,
      email,
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
  }, []);

  const buildProfile = useCallback((p: any): Profile => ({
    id: p.id,
    username: p.username,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    bio: p.bio,
    location: p.location,
    plan: p.plan,
    free_event_credits: p.free_event_credits,
    onboarding_complete: p.onboarding_complete,
    profile_visibility: p.profile_visibility,
    stripe_connect_account_id: p.stripe_connect_account_id,
    created_at: p.created_at,
  }), []);

  const loadUserProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const [p, subRes] = await Promise.all([
        fetchProfileWithRetry(userId),
        supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const s = subRes.data;
      const authUser = buildAuthUser(userId, email, p, s);
      setUser(authUser);

      if (p) {
        setProfile(buildProfile(p));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }, [buildAuthUser, buildProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    await loadUserProfile(user.id, user.email);
  }, [user?.id, user?.email, loadUserProfile]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          try {
            await loadUserProfile(session.user.id, session.user.email ?? undefined);
          } catch (profileError) {
            console.error('Profile load failed — signing out:', profileError);
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id, session.user.email ?? undefined);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await loadUserProfile(session.user.id, session.user.email ?? undefined);
      } else if (!session) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // ── New auth methods ──

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, []);

  const signInWithApple = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  // ── Backward-compatible methods ──

  const login = signIn;

  const loginPhone = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  }, []);

  const register = signUp;

  const registerPhone = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const requestVerificationCode = useCallback(async (destination: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email: destination });
    if (error) throw error;
  }, []);

  const verifyCode = useCallback(async (code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token: code,
      type: 'email',
      email: user?.email || '',
    });
    return !error;
  }, [user?.email]);

  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);

    if (!user?.id) return;

    const profileUpdates: Record<string, unknown> = {};
    if (updates.username !== undefined) profileUpdates.username = updates.username;
    if (updates.displayName !== undefined) profileUpdates.display_name = updates.displayName;
    if (updates.avatar !== undefined) profileUpdates.avatar_url = updates.avatar;
    if (updates.bio !== undefined) profileUpdates.bio = updates.bio;
    if (updates.location !== undefined) profileUpdates.location = updates.location;
    if (updates.country !== undefined) profileUpdates.country = updates.country;
    if (updates.onboardingComplete !== undefined) profileUpdates.onboarding_complete = updates.onboardingComplete;
    if (updates.discoveryRadiusMiles !== undefined) profileUpdates.discovery_radius_miles = updates.discoveryRadiusMiles;
    if (updates.preferences?.availableToHelp !== undefined) profileUpdates.available_to_help = updates.preferences.availableToHelp;
    if (updates.preferences?.helpDistanceMiles !== undefined) profileUpdates.help_radius_miles = updates.preferences.helpDistanceMiles;
    if (updates.preferences?.locationSharingEnabled !== undefined) profileUpdates.live_location_sharing = updates.preferences.locationSharingEnabled;

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase.from('profiles').update(profileUpdates).eq('id', user.id);
      if (error) console.error('Profile update error:', error);
      else {
        // Refresh profile state
        const { data: refreshed } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (refreshed) setProfile(buildProfile(refreshed));
      }
    }
  }, [user?.id, buildProfile]);

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
      } else {
        setProfile(prev => prev ? { ...prev, onboarding_complete: true } : null);
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
      // New exports
      profile,
      loading: isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithApple,
      signOut: handleSignOut,
      refreshProfile,

      // Backward-compatible exports
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginPhone,
      register,
      registerPhone,
      logout: handleSignOut,
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
