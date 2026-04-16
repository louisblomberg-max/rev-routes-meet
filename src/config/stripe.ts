// ============================
// Stripe Price IDs & Plan Mapping
// ============================

export const STRIPE_PRICES = {
  enthusiast_monthly: 'price_1TMa1ORdtkGP5enYDSGCiONH',
  enthusiast_yearly: 'price_1TMa1gRdtkGP5enYVOQ3tlml',
  business_monthly: 'price_1TMa37RdtkGP5enYFNGPw6gE',
  business_yearly: 'price_1TMa3VRdtkGP5enYMvaHECON',
  event_post: 'price_1TMa3oRdtkGP5enYIwOkBxDn',
} as const;

export const PLAN_PRICES = {
  enthusiast: { monthly: 7.99, yearly: 63.99 },
  business: { monthly: 19.99, yearly: 159.99 },
} as const;

export const PRODUCT_TO_PLAN: Record<string, 'enthusiast' | 'business'> = {};

export function getPriceId(plan: 'enthusiast' | 'business', billing: 'monthly' | 'yearly'): string {
  const key = `${plan}_${billing}` as keyof typeof STRIPE_PRICES;
  return STRIPE_PRICES[key];
}
