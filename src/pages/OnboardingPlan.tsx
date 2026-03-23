import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Building2, Sparkles, ChevronRight, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { usePlan, PlanId } from '@/contexts/PlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import revnetLogo from '@/assets/revnet-logo-new.png';
import BackButton from '@/components/BackButton';

const PLANS = [
  {
    id: 'free' as PlanId,
    name: 'Explorer',
    tagline: 'Get started for free',
    icon: Sparkles,
    price: { monthly: 0, yearly: 0 },
    features: [
      { label: 'Browse routes, events & services', included: true },
      { label: '1 free event post included', included: true },
      { label: 'Additional events £2.99 each', included: true },
      { label: 'Join clubs & forums', included: true },
      { label: 'Basic messaging', included: true },
      { label: 'Create & publish routes', included: false },
      { label: 'Live location & safety', included: false },
    ],
  },
  {
    id: 'pro' as PlanId,
    name: 'Pro Driver',
    tagline: 'For active drivers',
    icon: Star,
    popular: true,
    price: { monthly: 3.99, yearly: 43.07 },
    features: [
      { label: 'Everything in Explorer', included: true },
      { label: 'Unlimited event posts', included: true },
      { label: 'Create & publish routes', included: true },
      { label: 'Live location sharing', included: true },
      { label: 'SOS breakdown help', included: true },
      { label: 'Garage showcase', included: true },
      { label: 'Priority visibility', included: true },
    ],
  },
  {
    id: 'club' as PlanId,
    name: 'Clubs & Services',
    tagline: 'Organise & grow',
    icon: Building2,
    price: { monthly: 6.99, yearly: 75.49 },
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Create & manage clubs', included: true },
      { label: 'Event ticketing with Stripe payouts', included: true },
      { label: 'Business & service listings', included: true },
      { label: 'Analytics & insights', included: true },
      { label: 'Featured placement', included: true },
      { label: 'Verified badge', included: true },
    ],
  },
];

const OnboardingPlan = () => {
  const navigate = useNavigate();
  const { setPlan } = usePlan();
  const { completeOnboarding } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [selected, setSelected] = useState<PlanId>('free');

  const handleContinue = () => {
    setPlan(selected);
    completeOnboarding();
    if (selected !== 'free') {
      toast.success(`${PLANS.find(p => p.id === selected)?.name} activated!`);
    }
    navigate('/');
  };

  const selectedPlan = PLANS.find(p => p.id === selected)!;

  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="flex-1 overflow-y-auto pb-48">
        <div className="px-6 pt-8 safe-top">
          <div className="flex items-center gap-3 mb-4">
            <BackButton fallbackPath="/onboarding/notifications" />
            <div className="flex-1">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex-1 h-1 rounded-full bg-primary" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-4 text-center">
          <img src={revnetLogo} alt="RevNet" className="h-9 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold text-black">Choose your plan</h1>
          <p className="text-sm text-black/50 mt-1.5 max-w-[300px] mx-auto">
            Start free — upgrade anytime
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 px-6 pb-5">
          <span className={`text-sm transition-colors ${billing === 'monthly' ? 'font-semibold text-black' : 'text-black/50'}`}>Monthly</span>
          <Switch checked={billing === 'yearly'} onCheckedChange={(c) => setBilling(c ? 'yearly' : 'monthly')} />
          <span className={`text-sm transition-colors ${billing === 'yearly' ? 'font-semibold text-black' : 'text-black/50'}`}>
            Yearly
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">Save 20%</Badge>
          </span>
        </div>

        {/* Plan cards */}
        <div className="px-4 space-y-3">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            const isSelected = plan.id === selected;
            const price = billing === 'monthly' ? plan.price.monthly : plan.price.yearly;

            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-primary bg-white shadow-md ring-1 ring-primary/20'
                    : 'border-black/10 bg-white hover:border-black/20'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-bl-xl">
                    ⭐ Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary/10' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-black/50'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-[15px]">{plan.name}</h3>
                    <p className="text-[11px] text-black/50">{plan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-black">
                      {price === 0 ? 'Free' : `£${price.toFixed(2)}`}
                    </span>
                    {price > 0 && <p className="text-[10px] text-black/50">/ {billing === 'monthly' ? 'mo' : 'yr'}</p>}
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
                      <span className={f.included ? 'text-black' : 'text-black/30'}>{f.label}</span>
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

        <div className="px-6 pt-5 flex items-center justify-center gap-4 text-[11px] text-black/40">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Cancel anytime</span>
          <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Secure payments</span>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20 border-t border-black/5" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={handleContinue} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          {selected === 'free' ? 'Start Free' : `Continue with ${selectedPlan.name}`}
          <ChevronRight className="w-5 h-5" />
        </Button>
        {selected !== 'free' && (
          <button
            onClick={() => setSelected('free')}
            className="w-full text-center text-xs text-black/50 hover:text-black transition-colors py-2 mt-1"
          >
            Start free instead
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPlan;
