// ============================
// Stripe Price IDs & Plan Mapping
// ============================

export const STRIPE_PRICES = {
  pro_monthly: 'price_1TEA0oRdtkGP5enY8IV9H8O8',
  pro_yearly: 'price_1TEA16RdtkGP5enYQp4d3D0H',
  club_monthly: 'price_1TEA1SRdtkGP5enYw6c3hiTs',
  club_yearly: 'price_1TEA1jRdtkGP5enYuuGccgS9',
  event_post: 'price_1TE9kBRdtkGP5enY431JMZaB',
} as const;

export const PLAN_PRICES = {
  pro: { monthly: 3.99, yearly: 43.99 },
  club: { monthly: 5.99, yearly: 63.99 },
} as const;

/** Map Stripe product IDs to plan IDs */
export const PRODUCT_TO_PLAN: Record<string, 'pro' | 'club'> = {
  prod_UCZ9lox5JkxEjH: 'pro',
  prod_UCZ9tsBLBtJVxg: 'pro',
  prod_UCZ9fXthuMunC8: 'club',
  prod_UCZAdLhhgWSlFF: 'club',
};

/** Get the Stripe price ID for a plan + billing cycle */
export function getPriceId(plan: 'pro' | 'club', billing: 'monthly' | 'yearly'): string {
  const key = `${plan}_${billing}` as keyof typeof STRIPE_PRICES;
  return STRIPE_PRICES[key];
}
