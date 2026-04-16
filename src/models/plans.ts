// ============================
// Subscription Plan Definitions
// ============================

export type PlanId = 'free' | 'enthusiast' | 'business';

export const PLANS = {
  free: {
    id: 'free' as PlanId,
    name: 'Explorer',
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthlyEquivalent: 0,
    trialDays: 0,
    trialRequiresCard: false,
    color: '#6B7280',
    description: 'Free forever',
    popular: false,
  },
  enthusiast: {
    id: 'enthusiast' as PlanId,
    name: 'Enthusiast',
    monthlyPrice: 7.99,
    annualPrice: 63.99,
    annualMonthlyEquivalent: 5.33,
    trialDays: 7,
    trialRequiresCard: false,
    color: '#d30d37',
    description: 'For active enthusiasts',
    popular: true,
  },
  business: {
    id: 'business' as PlanId,
    name: 'Business',
    monthlyPrice: 19.99,
    annualPrice: 159.99,
    annualMonthlyEquivalent: 13.33,
    trialDays: 0,
    trialRequiresCard: false,
    color: '#059669',
    description: 'For automotive businesses',
    popular: false,
  },
} as const;

export const EVENT_POST_ONE_TIME_COST_GBP = 5.99;
export const MARKETPLACE_COMMISSION_PERCENT = 3;
export const TICKET_COMMISSION_PERCENT = 5;
export const SOS_SUBSCRIPTION_PRICE_GBP = 1.99;
export const SOS_FREE_MEMBER_THRESHOLD = 50000;
export const FREE_NAVIGATION_LIMIT = 3;
