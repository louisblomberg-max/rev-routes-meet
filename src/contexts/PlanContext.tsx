import { createContext, useContext, ReactNode } from 'react';

export type PlanId = 'free';

interface PlanContextType {
  currentPlan: PlanId;
  effectivePlan: PlanId;
  billingCycle: 'monthly' | 'yearly';
  subscriptionStatus: string;
  hasAccess: (feature: string) => boolean;
  getRequiredPlan: (feature: string) => PlanId;
  getPlanLabel: (plan: string) => string;
  setPlan: (plan: PlanId) => void;
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  setSubscriptionStatus: (status: string) => void;
}

const PlanContext = createContext<PlanContextType | null>(null);

export const PlanProvider = ({ children }: { children: ReactNode }) => (
  <PlanContext.Provider value={{
    currentPlan: 'free',
    effectivePlan: 'free',
    billingCycle: 'monthly',
    subscriptionStatus: 'active',
    hasAccess: () => true,
    getRequiredPlan: () => 'free',
    getPlanLabel: () => 'RevNet',
    setPlan: () => {},
    setBillingCycle: () => {},
    setSubscriptionStatus: () => {},
  }}>
    {children}
  </PlanContext.Provider>
);

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
};
