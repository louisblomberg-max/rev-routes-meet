// ============================
// Subscription Plan Definitions
// ============================

export type PlanId = 'free' | 'pro' | 'club' | 'business';

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
  pro: {
    id: 'pro' as PlanId,
    name: 'Pro Driver',
    monthlyPrice: 4.99,
    annualPrice: 39.99,
    annualMonthlyEquivalent: 3.33,
    trialDays: 7,
    trialRequiresCard: false,
    color: '#d30d37',
    description: 'For active enthusiasts',
    popular: true,
  },
  club: {
    id: 'club' as PlanId,
    name: 'Club',
    monthlyPrice: 9.99,
    annualPrice: 79.99,
    annualMonthlyEquivalent: 6.67,
    trialDays: 30,
    trialRequiresCard: false,
    color: '#7C3AED',
    description: 'For club organisers',
    popular: false,
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
