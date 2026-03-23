// ============================
// Subscription Plan Definitions
// ============================

import type { SubscriptionPlan } from './index';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Member',
    price: 0,
    eventCreditsPerMonth: 0,
    routeCreditsPerMonth: 0,
    features: [
      'Browse events, routes & services',
      '1 free event post included',
      'Additional events £2.99 each',
      'Join clubs & forums',
      'Basic messaging',
      'Save & bookmark content',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Driver',
    price: 3.99,
    eventCreditsPerMonth: -1, // unlimited
    routeCreditsPerMonth: -1,
    features: [
      'Everything in Explorer',
      'Unlimited event posts',
      'Create & publish routes',
      'Host unlimited events',
      'Live location sharing',
      'SOS breakdown help',
      'Garage showcase',
      'Priority visibility',
    ],
  },
  {
    id: 'club',
    name: 'Club / Business',
    price: 5.99,
    eventCreditsPerMonth: -1,
    routeCreditsPerMonth: -1,
    features: [
      'Everything in Pro',
      'Create & manage clubs',
      'Event ticketing with Stripe payouts',
      'Business & service listings',
      'Analytics & insights',
      'Featured placement',
      'Verified badge',
    ],
  },
];

/** Cost to publish a single event for non-Pro users */
export const EVENT_PUBLISH_COST_GBP = 2.99;

/** Cost to publish a single route for non-Pro users */
export const ROUTE_PUBLISH_COST_GBP = 1.99;
