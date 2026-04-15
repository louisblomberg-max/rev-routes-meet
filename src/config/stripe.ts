// ============================
// Stripe Price IDs & Plan Mapping
// ============================

export const STRIPE_PRICES = {
  pro_monthly: 'price_1TMa1ORdtkGP5enYDSGCiONH',
  pro_yearly: 'price_1TMa1gRdtkGP5enYVOQ3tlml',
  club_monthly: 'price_1TMa2FRdtkGP5enYyUWS9wVL',
  club_yearly: 'price_1TMa2pRdtkGP5enYoaflZI5M',
  business_monthly: 'price_1TMa37RdtkGP5enYFNGPw6gE',
  business_yearly: 'price_1TMa3VRdtkGP5enYMvaHECON',
  event_post: 'price_1TMa3oRdtkGP5enYIwOkBxDn',
} as const;

export const PLAN_PRICES = {
  pro: { monthly: 4.99, yearly: 39.99 },
  club: { monthly: 9.99, yearly: 79.99 },
  business: { monthly: 19.99, yearly: 159.99 },
} as const;

/** Map Stripe product IDs to plan IDs */
export const PRODUCT_TO_PLAN: Record<string, 'pro' | 'club' | 'business'> = {
  prod_UCZ9lox5JkxEjH: 'pro',
  prod_UCZ9tsBLBtJVxg: 'pro',
  prod_UCZ9fXthuMunC8: 'club',
  prod_UCZAdLhhgWSlFF: 'club',
};

/** Get the Stripe price ID for a plan + billing cycle */
export function getPriceId(plan: 'pro' | 'club' | 'business', billing: 'monthly' | 'yearly'): string {
  const key = `${plan}_${billing}` as keyof typeof STRIPE_PRICES;
  return STRIPE_PRICES[key];
}
