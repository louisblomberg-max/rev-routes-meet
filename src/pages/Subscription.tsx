import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { Check, ArrowLeft, Shield, Zap, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { getPriceId } from '@/config/stripe';
import type { PlanId } from '@/models';

const FEATURE_HEADLINES: Record<string, { title: string; subtitle: string }> = {
  convoy: { title: 'Unlock Convoy Mode', subtitle: 'Share your live location with friends while driving together' },
  events: { title: 'Unlock Unlimited Events', subtitle: 'Post as many events as you want with no extra fees' },
  clubs: { title: 'Unlock Club Creation', subtitle: 'Create and manage your own car clubs' },
  services: { title: 'Unlock Service Listings', subtitle: 'List your business or services for the community' },
  location: { title: 'Unlock Live Location', subtitle: 'Share your real-time position with friends' },
  ticketing: { title: 'Unlock Event Ticketing', subtitle: 'Sell tickets to your events with Stripe payouts' },
  analytics: { title: 'Unlock Analytics', subtitle: 'Get insights into your events, routes and clubs' },
};

const DEFAULT_HEADLINE = { title: 'Upgrade Your Plan', subtitle: 'Get more from RevNet with a premium membership' };

const PLANS = [
  {
    id: 'free' as PlanId,
    name: 'Explorer',
    icon: Shield,
    price: { monthly: 0, yearly: 0 },
    features: [
      'Free forever',
      '1 free event post',
      'Routes free to browse',
      'Join clubs and forums',
      'Basic navigation',
      'Offer help via SOS',
    ],
  },
  {
    id: 'pro' as PlanId,
    name: 'Pro Driver',
    icon: Zap,
    price: { monthly: 3.99, yearly: 43.99 },
    features: [
      'Everything in Explorer',
      'Unlimited event posts',
      'Create and share routes',
      'Sell tickets for events',
      'Live location sharing',
      'Convoy mode',
      'Request SOS breakdown help',
    ],
  },
  {
    id: 'club' as PlanId,
    name: 'Club & Business',
    icon: Building2,
    price: { monthly: 5.99, yearly: 63.99 },
    features: [
      'Everything in Pro',
      'Create and manage clubs',
      'Add services and business listings',
      'Analytics dashboard',
      'Verified badge',
    ],
  },
];

export default function Subscription() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { effectivePlan } = usePlan();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const feature = searchParams.get('feature') || '';
  const headline = FEATURE_HEADLINES[feature] || DEFAULT_HEADLINE;

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
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A1628]/90 backdrop-blur-xl border-b border-white/10 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-sm font-bold tracking-wide text-white/80">RevNet</span>
        </div>
      </div>

      <div className="px-4 pt-6 pb-10 space-y-6 max-w-lg mx-auto">
        {/* Headline */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold">{headline.title}</h1>
          <p className="text-sm text-white/60">{headline.subtitle}</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 bg-white/5 rounded-2xl p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-[#185FA5] text-white shadow-lg' : 'text-white/50'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all relative ${billing === 'yearly' ? 'bg-[#185FA5] text-white shadow-lg' : 'text-white/50'}`}
          >
            Yearly
            <span className="absolute -top-2 -right-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              Save up to {Math.max(...PLANS.filter(p => p.price.monthly > 0).map(p => Math.round((1 - p.price.yearly / (p.price.monthly * 12)) * 100)))}%
            </span>
          </button>
        </div>

        {/* Plan cards */}
        <div className="space-y-4">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === effectivePlan;
            const Icon = plan.icon;
            const price = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const isUpgrade = !isCurrent && plan.id !== 'free';
            const isPro = plan.id === 'pro';
            const isOrganiser = plan.id === 'club';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-5 transition-all ${
                  isCurrent
                    ? 'border-[#185FA5] bg-[#185FA5]/15 ring-1 ring-[#185FA5]/40'
                    : isPro
                      ? 'border-[#185FA5]/50 bg-white/[0.04]'
                      : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-4 bg-[#185FA5] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Current plan
                  </div>
                )}
                {isPro && !isCurrent && (
                  <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    ⭐ Most popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.id === 'free' ? 'bg-white/10' : isPro ? 'bg-[#185FA5]/20' : 'bg-purple-500/20'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      plan.id === 'free' ? 'text-white/60' : isPro ? 'text-[#185FA5]' : 'text-purple-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold">
                        {price === 0 ? 'Free' : `£${price.toFixed(2)}`}
                      </span>
                      {price > 0 && (
                        <span className="text-xs text-white/40">
                          /{billing === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${
                        plan.id === 'free' ? 'text-white/30' : isPro ? 'text-[#185FA5]' : 'text-purple-400'
                      }`} />
                      <span className="text-white/70">{feat}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl bg-white/5 text-center text-sm font-semibold text-white/40">
                    ✓ Current plan
                  </div>
                ) : isUpgrade ? (
                  <button
                    disabled={loading}
                    onClick={() => handleUpgrade(plan.id)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                      isPro
                        ? 'bg-[#185FA5] hover:bg-[#1a6bbf] text-white shadow-lg shadow-[#185FA5]/30'
                        : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/30'
                    } disabled:opacity-50`}
                  >
                    {loading ? 'Loading…' : `Upgrade to ${plan.name}`}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/30 pt-2">
          Cancel anytime · No hidden fees · Your data stays yours
        </p>
      </div>
    </div>
  );
}
