import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Building2, Sparkles, Shield, CreditCard, ChevronRight, Crown, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useOnboarding, TOTAL_ONBOARDING_STEPS } from '@/contexts/OnboardingContext';
import { toast } from 'sonner';

type PlanId = 'free' | 'enthusiast' | 'business';

const withTimeout = async <T,>(promise: Promise<T>, ms: number, msg: string): Promise<T> => {
  let tid: ReturnType<typeof setTimeout> | undefined;
  const tp = new Promise<never>((_, reject) => { tid = setTimeout(() => reject(new Error(msg)), ms); });
  try { return await Promise.race([promise, tp]); } finally { if (tid) clearTimeout(tid); }
};

const PLANS = [
  {
    id: 'free' as PlanId, name: 'Explorer', tagline: 'Free forever', icon: Sparkles,
    price: { monthly: 0, yearly: 0 },
    trial: null,
    features: [
      { label: 'Full map — browse events, routes and services', included: true },
      { label: 'Navigate routes — 3 free navigations', included: true },
      { label: 'Attend free and ticketed events', included: true },
      { label: 'Join up to 2 clubs', included: true },
      { label: 'SOS breakdown help — free for everyone', included: true },
      { label: 'Create and publish routes', included: false },
      { label: 'Unlimited navigation', included: false },
    ],
  },
  {
    id: 'enthusiast' as PlanId, name: 'Enthusiast', tagline: 'For active enthusiasts', icon: Star, popular: true,
    price: { monthly: 7.99, yearly: 63.99 },
    trial: { days: 7, requiresCard: false },
    features: [
      { label: 'Everything in Explorer', included: true },
      { label: 'Unlimited navigation — turn by turn, voice, rerouting', included: true },
      { label: 'Create and publish unlimited routes', included: true },
      { label: 'Import GPX files', included: true },
      { label: 'Create free and ticketed events', included: true },
      { label: 'Live location and convoy mode', included: true },
      { label: 'Create and manage your own club', included: true },
      { label: 'Full garage — unlimited vehicles', included: true },
    ],
  },
  {
    id: 'business' as PlanId, name: 'Business', tagline: 'For automotive businesses', icon: Building2,
    price: { monthly: 19.99, yearly: 159.99 },
    trial: null,
    features: [
      { label: 'Service listing on the RevNet map', included: true },
      { label: 'Featured placement in your area', included: true },
      { label: 'Verified business badge', included: true },
      { label: 'Business profile — photos, hours, contact', included: true },
      { label: 'Customer enquiries and reviews', included: true },
      { label: 'Business analytics dashboard', included: true },
    ],
  },
];

export interface PlanSelection {
  plan: 'free' | 'enthusiast' | 'business';
  billingCycle: 'monthly' | 'yearly';
}

interface PlanStepProps {
  onComplete?: (selection: PlanSelection) => Promise<void> | void;
}

const PlanStep = ({ onComplete }: PlanStepProps) => {
  const navigate = useNavigate();
  const { back, data, updateData } = useOnboarding();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(data.billingCycle || 'yearly');
  const [selected, setSelected] = useState<PlanId>(data.plan || 'enthusiast');
  const [loading, setLoading] = useState(false);

  const selectedPlan = PLANS.find(p => p.id === selected)!;

  const handleContinue = async () => {
    setLoading(true);
    try {
      updateData({ plan: selected, billingCycle: billing });
      if (onComplete) {
        await withTimeout(
          Promise.resolve(onComplete({ plan: selected, billingCycle: billing })),
          45000, 'Saving is taking too long. Please try again.'
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(message);
      if (message.toLowerCase().includes('session')) navigate('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleFree = async () => {
    setLoading(true);
    try {
      updateData({ plan: 'free', billingCycle: billing });
      if (onComplete) {
        await withTimeout(
          Promise.resolve(onComplete({ plan: 'free', billingCycle: billing })),
          45000, 'Saving is taking too long. Please try again.'
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= 5 ? 'bg-primary' : 'bg-black/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-44">
        <div className="text-center mb-5 animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1.5 text-black">Choose Your Plan</h1>
          <p className="text-sm text-black/50 max-w-[280px] mx-auto">Unlock the full RevNet experience. Cancel anytime.</p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-3 animate-fade-up">
          <span className={`text-sm transition-colors ${billing === 'monthly' ? 'font-semibold text-black' : 'text-black/50'}`}>Monthly</span>
          <Switch checked={billing === 'yearly'} onCheckedChange={(c) => setBilling(c ? 'yearly' : 'monthly')} disabled={loading} />
          <span className={`text-sm transition-colors ${billing === 'yearly' ? 'font-semibold text-black' : 'text-black/50'}`}>Annual</span>
        </div>

        {billing === 'yearly' && (
          <div className="bg-green-100/80 rounded-xl px-3 py-2 text-center mb-4 animate-fade-up">
            <p className="text-xs font-medium text-green-800">Pay annually — get 2 months free</p>
          </div>
        )}

        <div className="space-y-3 animate-fade-up">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = plan.id === selected;
            const planPrice = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;

            return (
              <button key={plan.id} onClick={() => !loading && setSelected(plan.id)} disabled={loading}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative overflow-hidden ${isSelected ? 'border-primary bg-white shadow-lg' : 'border-black/10 bg-white/80 hover:border-black/20'} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {(plan as any).popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-bl-xl flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary/10' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-black/50'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-[15px]">{plan.name}</h3>
                    <p className="text-[11px] text-black/50">{plan.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-black">{planPrice === 0 ? 'Free' : `£${planPrice.toFixed(2)}`}</span>
                    {planPrice > 0 && <p className="text-[10px] text-black/50">/ {billing === 'monthly' ? 'month' : 'year'}</p>}
                    {billing === 'yearly' && plan.price.monthly > 0 && (
                      <p className="text-[9px] text-black/40">or £{plan.price.monthly.toFixed(2)}/mo</p>
                    )}
                  </div>
                </div>
                {plan.trial && (
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-0">
                      {plan.trial.days} day free trial — no card needed
                    </Badge>
                  </div>
                )}
                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {f.included ? <Check className="w-3.5 h-3.5 text-primary shrink-0" /> : <X className="w-3.5 h-3.5 text-black/20 shrink-0" />}
                      <span className={f.included ? 'text-black/80' : 'text-black/30'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <div className={`absolute top-4 left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-black/20'}`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-5 text-[10px] text-black/40">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure payment</span>
          <span>Cancel anytime</span>
          <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> Instant access</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={handleContinue} disabled={loading} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>)
            : selected === 'free' ? (<>Continue with Explorer <ChevronRight className="w-5 h-5" /></>)
            : selected === 'business' ? (<>List your business <ChevronRight className="w-5 h-5" /></>)
            : (<>Start {selectedPlan.name} <ChevronRight className="w-5 h-5" /></>)}
        </Button>
        {selected !== 'free' && !loading && (
          <button onClick={handleFree} className="w-full text-xs text-black/50 mt-2 py-1 hover:text-black transition-colors">Continue with Explorer instead</button>
        )}
        {selected === 'free' && !loading && (
          <button onClick={back} className="w-full text-sm text-black/50 mt-2 py-2">Back</button>
        )}
      </div>
    </div>
  );
};

export default PlanStep;
