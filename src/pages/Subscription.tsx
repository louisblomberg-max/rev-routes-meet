import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { getPriceId } from '@/config/stripe';
import type { PlanId } from '@/models';

const FEATURE_HEADLINES: Record<string, string> = {
  convoy: 'Unlock Convoy Mode',
  events: 'Unlock Unlimited Events',
  clubs: 'Unlock Club Creation',
  services: 'Unlock Service Listings',
  routes: 'Unlock Unlimited Routes',
  location: 'Unlock Live Location Sharing',
  analytics: 'Unlock Analytics Dashboard',
  tickets: 'Unlock Event Ticketing',
};

const PLANS = [
  {
    id: 'free' as PlanId,
    name: 'Explorer',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Free forever',
      '1 free event post',
      'Routes free to browse',
      'Join clubs & forums',
      'Basic navigation',
    ],
  },
  {
    id: 'pro' as PlanId,
    name: 'Pro Driver',
    price: { monthly: 3.99, yearly: 43.99 },
    features: [
      'Everything in Explorer',
      'Unlimited event posts',
      'Live location sharing',
      'Convoy mode',
      'Priority support',
    ],
    recommended: true,
  },
  {
    id: 'club' as PlanId,
    name: 'Organiser',
    price: { monthly: 5.99, yearly: 63.99 },
    features: [
      'Everything in Pro',
      'Create clubs',
      'Add services',
      'Sell tickets with Stripe',
      'Analytics dashboard',
    ],
  },
];

export default function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const feature = searchParams.get('feature');
  const { effectivePlan } = usePlan();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const headline = feature ? FEATURE_HEADLINES[feature] || 'Upgrade Your Plan' : 'Upgrade Your Plan';

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === 'free' || planId === effectivePlan) return;

    try {
      const Capacitor = (window as any).Capacitor;
      if (Capacitor?.isNativePlatform?.()) {
        toast.info('Payment available on web at revnet.app');
        return;
      }
    } catch { /* not native */ }

    setLoading(true);
    try {
      const priceId = getPriceId(planId as 'pro' | 'club', billing);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { price_id: priceId, plan: planId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      console.error('[Subscription] Checkout error:', err);
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A1628]/90 backdrop-blur-lg border-b border-white/10 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-sm font-bold tracking-wide text-white/60">REV<span className="text-[#185FA5]">NET</span></span>
        </div>
      </div>

      <div className="px-4 pt-6 pb-10 max-w-md mx-auto space-y-6">
        {/* Headline */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight">{headline}</h1>
          <p className="text-sm text-white/50">Choose the plan that fits your driving life</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 bg-white/5 rounded-2xl p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              billing === 'monthly' ? 'bg-[#185FA5] text-white shadow-lg' : 'text-white/50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all relative ${
              billing === 'yearly' ? 'bg-[#185FA5] text-white shadow-lg' : 'text-white/50'
            }`}
          >
            Yearly
            <span className="absolute -top-2.5 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              Save 10%
            </span>
          </button>
        </div>

        {/* Plan cards */}
        <div className="space-y-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === effectivePlan;
            const price = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const isUpgrade = !isCurrent && plan.id !== 'free';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-4 transition-all ${
                  isCurrent
                    ? 'border-[#185FA5] bg-[#185FA5]/10 ring-1 ring-[#185FA5]/40'
                    : plan.recommended
                      ? 'border-[#185FA5]/50 bg-white/[0.03]'
                      : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 right-0 bg-[#185FA5] text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl rounded-tr-2xl flex items-center gap-1">
                    <Check className="w-3 h-3" /> Current plan
                  </div>
                )}
                {plan.recommended && !isCurrent && (
                  <div className="absolute top-0 right-0 bg-[#185FA5] text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-xl rounded-tr-2xl">
                    ⭐ Recommended
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-extrabold">
                      {price === 0 ? 'Free' : `£${price.toFixed(2)}`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs text-white/40">/ {billing === 'monthly' ? 'mo' : 'yr'}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#185FA5]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button disabled size="sm" className="w-full bg-white/10 text-white/40 border-0">
                    ✓ Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    size="sm"
                    disabled={loading}
                    onClick={() => handleUpgrade(plan.id)}
                    className="w-full bg-[#185FA5] hover:bg-[#185FA5]/90 text-white font-bold"
                  >
                    {loading ? 'Redirecting…' : `Upgrade to ${plan.name}`}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/30 leading-relaxed">
          Cancel anytime · No hidden fees · Your data stays yours
        </p>
      </div>
    </div>
  );
}
