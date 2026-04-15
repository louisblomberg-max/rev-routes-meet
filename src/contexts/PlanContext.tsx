import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import type { PlanId } from '@/models';

export type { PlanId } from '@/models';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'selected';

export interface FeatureAccess {
  id: string;
  label: string;
  requiredPlan: PlanId;
}

export const FEATURE_REQUIREMENTS: Record<string, PlanId> = {
  // Free features
  'browse_map': 'free',
  'view_routes': 'free',
  'navigate_routes': 'free',
  'attend_events': 'free',
  'buy_marketplace': 'free',
  'sell_marketplace': 'free',
  'join_clubs': 'free',
  'read_forums': 'free',
  'basic_messaging': 'free',
  'basic_garage': 'free',
  'save_items': 'free',
  'offer_sos': 'free',
  'request_sos': 'free',
  // Pro Driver features
  'create_routes': 'pro',
  'import_gpx': 'pro',
  'live_location': 'pro',
  'convoy_mode': 'pro',
  'unlimited_clubs': 'pro',
  'unlimited_messaging': 'pro',
  'unlimited_forums': 'pro',
  'extended_garage': 'pro',
  'unlimited_saves': 'pro',
  'boost_marketplace': 'pro',
  // Club features
  'create_club': 'club',
  'manage_club': 'club',
  'club_feed': 'club',
  'club_events': 'club',
  'sell_tickets': 'club',
  'organiser_dashboard': 'club',
  'club_analytics': 'club',
  'verified_club_badge': 'club',
  'create_events': 'club',
  // Business features
  'service_listing': 'business',
  'business_analytics': 'business',
  'featured_placement': 'business',
  'verified_business_badge': 'business',
  'priority_support': 'business',
};

const PLAN_HIERARCHY: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  club: 2,
  business: 3,
};

interface PlanContextType {
  currentPlan: PlanId;
  billingCycle: BillingCycle;
  subscriptionStatus: SubscriptionStatus;
  setPlan: (plan: PlanId) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
  setSubscriptionStatus: (status: SubscriptionStatus) => void;
  hasAccess: (featureId: string) => boolean;
  getRequiredPlan: (featureId: string) => PlanId;
  getPlanLabel: (plan: PlanId) => string;
  effectivePlan: PlanId;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [billingCycle, setBillingCycleState] = useState<BillingCycle>('yearly');
  const [subscriptionStatus, setSubscriptionStatusState] = useState<SubscriptionStatus>('active');

  // Load subscription from Supabase when user changes
  useEffect(() => {
    if (!user?.id) return;

    const loadSub = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) return;

      if (data) {
        setCurrentPlan((data.plan as PlanId) || 'free');
        setBillingCycleState((data.billing_cycle as BillingCycle) || 'monthly');
        setSubscriptionStatusState((data.status as SubscriptionStatus) || 'active');
      }
    };

    loadSub();
  }, [user?.id]);

  const effectivePlan: PlanId = subscriptionStatus === 'inactive' ? 'free' : currentPlan;

  // SECURITY: Plan changes must go through payment flow (Stripe/RevenueCat), never written directly.
  // These setters only update local state for UI purposes (e.g. onboarding selection preview).
  const setPlan = (plan: PlanId) => {
    setCurrentPlan(plan);
  };

  const setBillingCycle = (cycle: BillingCycle) => {
    setBillingCycleState(cycle);
  };

  const setSubscriptionStatus = (status: SubscriptionStatus) => {
    setSubscriptionStatusState(status);
  };

  const hasAccess = (featureId: string): boolean => {
    const required = FEATURE_REQUIREMENTS[featureId];
    if (!required) return true;
    return PLAN_HIERARCHY[effectivePlan] >= PLAN_HIERARCHY[required];
  };

  const getRequiredPlan = (featureId: string): PlanId => {
    return FEATURE_REQUIREMENTS[featureId] || 'free';
  };

  const getPlanLabel = (plan: PlanId): string => {
    const labels: Record<PlanId, string> = {
      free: 'Explorer',
      pro: 'Pro Driver',
      club: 'Club',
      business: 'Business',
    };
    return labels[plan];
  };

  return (
    <PlanContext.Provider value={{
      currentPlan, billingCycle, subscriptionStatus,
      setPlan, setBillingCycle, setSubscriptionStatus,
      hasAccess, getRequiredPlan, getPlanLabel, effectivePlan
    }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error('usePlan must be used within a PlanProvider');
  return context;
};
