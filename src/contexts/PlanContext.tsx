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
  // Free features — available to all
  'browse_map': 'free',
  'view_routes': 'free',
  'view_events': 'free',
  'view_services': 'free',
  'search_content': 'free',
  'attend_events': 'free',
  'buy_tickets': 'free',
  'read_forums': 'free',
  'post_forums': 'free',
  'join_clubs': 'free',
  'basic_messaging': 'free',
  'view_profiles': 'free',
  'friend_system': 'free',
  'basic_garage': 'free',
  'buy_marketplace': 'free',
  'offer_sos': 'free',
  'request_sos': 'free',
  'navigate_routes': 'free', // limited to 3 uses then locked

  // Enthusiast features
  'unlimited_navigation': 'enthusiast',
  'create_routes': 'enthusiast',
  'import_gpx': 'enthusiast',
  'route_analytics': 'enthusiast',
  'create_events': 'enthusiast',
  'sell_tickets': 'enthusiast',
  'organiser_dashboard': 'enthusiast',
  'live_location': 'enthusiast',
  'convoy_mode': 'enthusiast',
  'unlimited_clubs': 'enthusiast',
  'create_club': 'enthusiast',
  'manage_club': 'enthusiast',
  'club_feed': 'enthusiast',
  'unlimited_messaging': 'enthusiast',
  'unlimited_garage': 'enthusiast',
  'full_garage_features': 'enthusiast',
  'sell_marketplace': 'enthusiast',
  'boost_marketplace': 'enthusiast',
  'unlimited_saves': 'enthusiast',

  // Business features — website only
  'service_listing': 'business',
  'business_profile': 'business',
  'business_analytics': 'business',
  'business_enquiries': 'business',
  'business_reviews': 'business',
  'business_promotions': 'business',
  'verified_business_badge': 'business',
};

const PLAN_HIERARCHY: Record<PlanId, number> = {
  free: 0,
  enthusiast: 1,
  business: 2,
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
      enthusiast: 'Enthusiast',
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
