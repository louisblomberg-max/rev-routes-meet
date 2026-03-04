// ============================
// Paywall Gate Hook
// ============================
// Centralised check for whether the current user can perform a gated action.

import { usePlan, type PlanId } from '@/contexts/PlanContext';
import { useData } from '@/contexts/DataContext';
import type { PaywallReason } from '@/components/PaywallModal';

export interface PaywallCheck {
  allowed: boolean;
  reason: PaywallReason | null;
  creditsRemaining: number;
}

export const usePaywall = () => {
  const { effectivePlan } = usePlan();
  const { state } = useData();

  const canCreateEvent = (): PaywallCheck => {
    // Pro+ = unlimited
    if (effectivePlan === 'pro' || effectivePlan === 'club') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    const credits = state.currentUser?.eventCredits ?? 0;
    if (credits > 0) {
      return { allowed: true, reason: null, creditsRemaining: credits };
    }
    return { allowed: false, reason: 'event_credits', creditsRemaining: 0 };
  };

  const canCreateRoute = (): PaywallCheck => {
    if (effectivePlan === 'pro' || effectivePlan === 'club') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    const credits = state.currentUser?.routeCredits ?? 0;
    if (credits > 0) {
      return { allowed: true, reason: null, creditsRemaining: credits };
    }
    return { allowed: false, reason: 'route_credits', creditsRemaining: 0 };
  };

  const canCreateService = (): PaywallCheck => {
    if (effectivePlan === 'club') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    return { allowed: false, reason: 'service_plan', creditsRemaining: 0 };
  };

  const canCreateClub = (): PaywallCheck => {
    if (effectivePlan === 'club') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    return { allowed: false, reason: 'club_plan', creditsRemaining: 0 };
  };

  /** Deduct 1 event credit (for free users paying per-item) */
  const deductEventCredit = () => {
    state.setCurrentUser(prev => prev ? {
      ...prev,
      eventCredits: Math.max(0, (prev.eventCredits ?? 0) - 1),
    } : prev);
  };

  const deductRouteCredit = () => {
    state.setCurrentUser(prev => prev ? {
      ...prev,
      routeCredits: Math.max(0, (prev.routeCredits ?? 0) - 1),
    } : prev);
  };

  /** Upgrade to a plan (mock) */
  const upgradeToPlan = (plan: PlanId) => {
    // This is handled by PlanContext — we just update credits
    state.setCurrentUser(prev => prev ? {
      ...prev,
      plan,
      eventCredits: -1,
      routeCredits: -1,
    } : prev);
  };

  return {
    canCreateEvent,
    canCreateRoute,
    canCreateService,
    canCreateClub,
    deductEventCredit,
    deductRouteCredit,
    upgradeToPlan,
  };
};
