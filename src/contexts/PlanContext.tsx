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
  'browse_routes': 'free',
  'browse_events': 'free',
  'browse_services': 'free',
  'join_clubs': 'free',
  'join_forums': 'free',
  'basic_messaging': 'free',
  'save_routes': 'free',
  'save_events': 'free',
  'my_friends': 'free',
  'my_discussions': 'free',
  'post_questions': 'free',
  'post_replies': 'free',
  'create_events': 'free',
  'create_routes': 'free',
  'garage_showcase': 'free',
  'live_location': 'pro',
  'breakdown_help': 'pro',
  'advanced_filters': 'pro',
  'priority_visibility': 'pro',
  'create_marketplace_listing': 'pro',
  'create_clubs': 'club',
  'club_announcements': 'club',
  'event_ticketing': 'club',
  'business_listings': 'club',
  'create_services': 'club',
  'analytics': 'club',
  'featured_placement': 'club',
  'verified_badge': 'club',
  'manage_club': 'club',
};

const PLAN_HIERARCHY: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  club: 2,
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
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

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
    // Do NOT write to profiles or subscriptions — server-side only
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
      free: 'Free',
      pro: 'Pro Driver',
      club: 'Club / Business',
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
