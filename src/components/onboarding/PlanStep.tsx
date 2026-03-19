import { useState } from 'react';
import { Check, X, Star, Building2, Sparkles, Shield, CreditCard, ChevronRight, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useOnboarding, SETUP_STEPS } from '@/contexts/OnboardingContext';

type PlanId = 'free' | 'pro' | 'club';

const PLANS = [
  {
    id: 'free' as PlanId,
    name: 'Explorer',
    tagline: 'Browse and discover',
    icon: Sparkles,
    price: { monthly: 0, yearly: 0 },
    features: [
      { label: 'Browse routes, events & services', included: true },
      { label: 'Join clubs & forums', included: true },
      { label: 'Basic messaging', included: true },
      { label: 'Save & bookmark content', included: true },
      { label: 'Create & publish routes', included: false },
      { label: 'Live location & safety', included: false },
    ],
  },
  {
    id: 'pro' as PlanId,
    name: 'Pro Driver',
    tagline: 'Create, share & connect',
    icon: Star,
    popular: true,
    price: { monthly: 3.99, yearly: 43.07 },
    features: [
      { label: 'Everything in Explorer', included: true },
      { label: 'Create & publish routes', included: true },
      { label: 'Host unlimited events', included: true },
      { label: 'Live location sharing', included: true },
      { label: 'SOS breakdown help', included: true },
      { label: 'Garage showcase', included: true },
      { label: 'Priority visibility', included: true },
    ],
  },
  {
    id: 'club' as PlanId,
    name: 'Club / Business',
    tagline: 'Organise & grow',
    icon: Building2,
    price: { monthly: 6.99, yearly: 75.49 },
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Create & manage clubs', included: true },
      { label: 'Event ticketing', included: true },
      { label: 'Business / service listings', included: true },
      { label: 'Analytics & insights', included: true },
      { label: 'Featured placement', included: true },
      { label: 'Verified badge', included: true },
    ],
  },
];

interface Props {
  onComplete: () => Promise<void>;
}

const PlanStep = ({ onComplete }: Props) => {
  const { back, data, updateData, step } = useOnboarding();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(data.billingCycle || 'yearly');
  const [selected, setSelected] = useState<PlanId>(data.plan || 'pro');
  const [loading, setLoading] = useState(false);
  const setupIdx = step - 6;

  const selectedPlan = PLANS.find(p => p.id === selected)!;

  const handleContinue = async () => {
    updateData({ plan: selected, billingCycle: billing });
    setLoading(true);
    try {
      await onComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleFree = async () => {
    updateData({ plan: 'free', billingCycle: billing });
    setLoading(true);
    try {
      await onComplete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1">
          {Array.from({ length: SETUP_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= setupIdx ? 'bg-primary' : 'bg-black/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-44">
        <div className="text-center mb-5 animate-fade-up">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1.5 text-black">
            Choose Your Plan
          </h1>
          <p className="text-sm text-black/50 max-w-[280px] mx-auto">
            Unlock the full RevNet experience. Cancel anytime.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-5 animate-fade-up">
          <span className={`text-sm transition-colors ${billing === 'monthly' ? 'font-semibold text-black' : 'text-black/50'}`}>
            Monthly
          </span>
          <Switch
            checked={billing === 'yearly'}
            onCheckedChange={(c) => setBilling(c ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm transition-colors ${billing === 'yearly' ? 'font-semibold text-black' : 'text-black/50'}`}>
            Yearly
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
              Save 20%
            </Badge>
          </span>
        </div>

        <div className="space-y-3 animate-fade-up">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = plan.id === selected;
            const planPrice = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;

            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-primary bg-white shadow-lg'
                    : 'border-black/10 bg-white/80 hover:border-black/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-bl-xl flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary/10' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-black/50'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black text-[15px]">{plan.name}</h3>
                    <p className="text-[11px] text-black/50">{plan.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-bold text-black">
                      {planPrice === 0 ? 'Free' : `£${planPrice.toFixed(2)}`}
                    </span>
                    {planPrice > 0 && (
                      <p className="text-[10px] text-black/50">
                        / {billing === 'monthly' ? 'month' : 'year'}
                      </p>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      {f.included ? (
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-black/20 shrink-0" />
                      )}
                      <span className={f.included ? 'text-black/80' : 'text-black/30'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className={`absolute top-4 left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary bg-primary' : 'border-black/20'
                }`}>
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
        <Button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10"
        >
          {selected === 'free' ? 'Continue with Free' : `Start ${selectedPlan.name}`}
          <ChevronRight className="w-5 h-5" />
        </Button>
        {selected !== 'free' && (
          <button onClick={handleFree} disabled={loading} className="w-full text-xs text-black/50 mt-2 py-1 hover:text-black transition-colors">
            Continue with Free instead
          </button>
        )}
        {selected === 'free' && (
          <button onClick={back} className="w-full text-sm text-black/50 mt-2 py-2">Back</button>
        )}
      </div>
    </div>
  );
};

export default PlanStep;
