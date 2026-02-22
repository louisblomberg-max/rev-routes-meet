import { createContext, useContext, useState, ReactNode } from 'react';

export type PlanId = 'free' | 'pro' | 'club';

export interface FeatureAccess {
  id: string;
  label: string;
  requiredPlan: PlanId;
}

// Define which plan level each feature requires
export const FEATURE_REQUIREMENTS: Record<string, PlanId> = {
  // Free features
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
  
  // Pro features
  'create_routes': 'pro',
  'create_events': 'pro',
  'live_location': 'pro',
  'breakdown_help': 'pro',
  'advanced_filters': 'pro',
  'garage_showcase': 'pro',
  'priority_visibility': 'pro',
  'create_marketplace_listing': 'pro',
  
  // Club/Business features
  'create_clubs': 'club',
  'club_announcements': 'club',
  'event_ticketing': 'club',
  'business_listings': 'club',
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
  subscriptionStatus: 'active' | 'inactive';
  setPlan: (plan: PlanId) => void;
  setSubscriptionStatus: (status: 'active' | 'inactive') => void;
  hasAccess: (featureId: string) => boolean;
  getRequiredPlan: (featureId: string) => PlanId;
  getPlanLabel: (plan: PlanId) => string;
  effectivePlan: PlanId;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider = ({ children }: { children: ReactNode }) => {
  const [currentPlan, setCurrentPlan] = useState<PlanId>(() => {
    return (localStorage.getItem('revnet_plan') as PlanId) || 'free';
  });

  const [subscriptionStatus, setSubscriptionStatusState] = useState<'active' | 'inactive'>(() => {
    return (localStorage.getItem('revnet_subscription_status') as 'active' | 'inactive') || 'active';
  });

  // If subscription is inactive, treat as free
  const effectivePlan: PlanId = subscriptionStatus === 'active' ? currentPlan : 'free';

  const setPlan = (plan: PlanId) => {
    setCurrentPlan(plan);
    localStorage.setItem('revnet_plan', plan);
  };

  const setSubscriptionStatus = (status: 'active' | 'inactive') => {
    setSubscriptionStatusState(status);
    localStorage.setItem('revnet_subscription_status', status);
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
      currentPlan, 
      subscriptionStatus, 
      setPlan, 
      setSubscriptionStatus, 
      hasAccess, 
      getRequiredPlan, 
      getPlanLabel, 
      effectivePlan 
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
