// ============================
// Paywall Gate Hook (stub — everything is free)
// ============================

export interface PaywallCheck {
  allowed: boolean;
  reason: null;
  creditsRemaining: number;
}

export const usePaywall = () => {
  const always: PaywallCheck = { allowed: true, reason: null, creditsRemaining: -1 };

  return {
    canCreateEvent: () => always,
    canCreateRoute: () => always,
    canCreateService: () => always,
    canCreateClub: () => always,
    deductEventCredit: async () => {},
    deductRouteCredit: async () => {},
    upgradeToPlan: () => {},
  };
};
