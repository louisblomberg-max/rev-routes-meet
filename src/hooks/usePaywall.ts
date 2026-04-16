// ============================
// Paywall Gate Hook
// ============================
// Centralised check for whether the current user can perform a gated action.

import { usePlan, type PlanId } from '@/contexts/PlanContext';
import { useAuth } from '@/contexts/AuthContext';
import type { PaywallReason } from '@/components/PaywallModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface PaywallCheck {
  allowed: boolean;
  reason: PaywallReason | null;
  creditsRemaining: number;
}

export const usePaywall = () => {
  const { effectivePlan } = usePlan();
  const { user, updateProfile } = useAuth();

  const canCreateEvent = (): PaywallCheck => {
    if (effectivePlan === 'enthusiast') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    const credits = user?.eventCredits ?? 0;
    if (credits > 0) {
      return { allowed: true, reason: null, creditsRemaining: credits };
    }
    return { allowed: false, reason: 'event_credits', creditsRemaining: 0 };
  };

  const canCreateRoute = (): PaywallCheck => {
    if (effectivePlan === 'enthusiast') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    const credits = user?.routeCredits ?? 0;
    if (credits > 0) {
      return { allowed: true, reason: null, creditsRemaining: credits };
    }
    return { allowed: false, reason: 'route_credits', creditsRemaining: 0 };
  };

  const canCreateService = (): PaywallCheck => {
    if (effectivePlan === 'business') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    return { allowed: false, reason: 'service_plan', creditsRemaining: 0 };
  };

  const canCreateClub = (): PaywallCheck => {
    if (effectivePlan === 'enthusiast') {
      return { allowed: true, reason: null, creditsRemaining: -1 };
    }
    return { allowed: false, reason: 'club_plan', creditsRemaining: 0 };
  };

  /** Deduct 1 event credit (for free users paying per-item) */
  const deductEventCredit = async () => {
    if (!user?.id) return;
    const { error } = await supabase.rpc('use_event_credit', { p_user_id: user.id });
    if (error) { toast.error('Failed to deduct credit'); return; }
    updateProfile({ eventCredits: Math.max(0, (user?.eventCredits ?? 0) - 1) });
  };

  const deductRouteCredit = async () => {
    if (!user?.id) return;
    const { error } = await supabase.rpc('use_route_credit', { p_user_id: user.id });
    if (error) { toast.error('Failed to deduct credit'); return; }
    updateProfile({ routeCredits: Math.max(0, (user?.routeCredits ?? 0) - 1) });
  };

  /** Redirect to payment flow — never activate plan directly */
  const upgradeToPlan = (_plan: PlanId) => {
    // SECURITY: Plan activation must go through Stripe/RevenueCat payment flow.
    // This is a placeholder — integrate with Stripe Checkout or RevenueCat here.
    toast.info('Redirecting to payment…');
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
