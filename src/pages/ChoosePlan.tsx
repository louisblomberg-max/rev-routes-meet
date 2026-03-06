import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Building2, Sparkles, Shield, CreditCard, Receipt, Users, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePlan, PlanId } from '@/contexts/PlanContext';
import { toast } from 'sonner';
import revnetLogo from '@/assets/revnet-logo-new.png';

const PLANS = [
  {
    id: 'free' as PlanId,
    name: 'Explorer',
    tagline: 'Get started for free',
    icon: Sparkles,
    price: { monthly: 0, yearly: 0 },
    features: [
      { label: 'Browse routes, events & services', included: true },
      { label: 'Join clubs & forums', included: true },
      { label: 'Basic messaging', included: true },
      { label: 'Save & bookmark content', included: true },
      { label: 'Post questions & replies', included: true },
      { label: 'Create & publish routes', included: false },
      { label: 'Live location & safety', included: false },
    ],
  },
  {
    id: 'pro' as PlanId,
    name: 'Pro',
    tagline: 'For active drivers',
    icon: Star,
    popular: true,
    price: { monthly: 3.99, yearly: 43.07 },
    features: [
      { label: 'Everything in Explorer', included: true },
      { label: 'Create & publish routes', included: true },
      { label: 'Create events & drive-outs', included: true },
      { label: 'Live location sharing', included: true },
      { label: 'Breakdown / Help requests', included: true },
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
      { label: 'Business/service listings', included: true },
      { label: 'Analytics & insights', included: true },
      { label: 'Featured map placement', included: true },
      { label: 'Verified badge', included: true },
    ],
  },
];

const WHY_BENEFITS = [
  { icon: Star, title: 'Create & share', desc: 'Publish routes, host events and build your driving profile.' },
  { icon: Shield, title: 'Live safety', desc: 'Share live location on group drives and send breakdown alerts.' },
  { icon: Users, title: 'Community', desc: 'Start clubs, grow your following, and connect with like-minded drivers.' },
  { icon: Receipt, title: 'No lock-in', desc: 'Cancel anytime. Your content stays yours, always.' },
];

const TRUST_ITEMS = [
  { icon: Users, label: 'Built for car & bike communities' },
  { icon: Shield, label: 'Cancel anytime' },
  { icon: CreditCard, label: 'Secure payments' },
  { icon: Receipt, label: 'Invoice available' },
];

const ChoosePlan = () => {
  const navigate = useNavigate();
  const { setPlan } = usePlan();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [selected, setSelected] = useState<PlanId>('pro');

  const yearlyMonths = 12;
  const yearlySavingsMonths = Math.round(yearlyMonths * 0.2);

  const handleContinue = () => {
    setPlan(selected);
    if (selected !== 'free') {
      toast.success(`${PLANS.find(p => p.id === selected)?.name} plan activated!`, {
        description: 'You now have access to more features.',
      });
    }
    navigate('/onboarding/profile');
  };

  const selectedPlan = PLANS.find(p => p.id === selected)!;
  const price = billing === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly;

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pb-48">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 text-center safe-top">
          <img src={revnetLogo} alt="RevNet" className="h-9 w-auto mx-auto mb-5" />
          <h1 className="text-xl font-bold text-foreground leading-tight">
            Unlock the full RevNet experience
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-[320px] mx-auto">
            Routes, Events, Live Safety, Clubs and Community — built for drivers.
          </p>

          {/* Why upgrade link */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-3 hover:underline">
                <Info className="w-3.5 h-3.5" />
                Why upgrade?
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-lg">Why upgrade?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                {WHY_BENEFITS.map((b, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <b.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 px-6 pb-5">
          <span className={`text-sm transition-colors ${billing === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={billing === 'yearly'}
            onCheckedChange={(c) => setBilling(c ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm transition-colors ${billing === 'yearly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-services-muted text-services dark:bg-services/20 dark:text-services">
              Save 20% — {yearlySavingsMonths} months free
            </Badge>
          </span>
        </div>

        {/* Plan cards */}
        <div className="px-4 space-y-3">
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
                    ? 'border-primary bg-primary/[0.03] shadow-md ring-1 ring-primary/20'
                    : 'border-border/50 bg-card hover:border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-bl-xl">
                    ⭐ Most Popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-[15px]">{plan.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{plan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      {planPrice === 0 ? 'Free' : `£${planPrice.toFixed(2)}`}
                    </span>
                    {planPrice > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        / {billing === 'monthly' ? 'mo' : 'yr'}
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
                        <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                      )}
                      <span className={f.included ? 'text-foreground' : 'text-muted-foreground/50'}>
                        {f.label}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Selection indicator */}
                <div className={`absolute top-4 left-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="px-6 pt-6">
          <div className="grid grid-cols-2 gap-2">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Legal */}
        <p className="px-6 pt-4 text-[10px] text-muted-foreground/60 text-center leading-relaxed">
          By continuing you agree to <button className="underline">Terms</button> & <button className="underline">Privacy</button>.
          Subscriptions renew automatically unless cancelled.
        </p>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border/30 px-6 py-4 safe-bottom z-20">
        <Button
          onClick={handleContinue}
          className="w-full h-12 text-base font-semibold mb-2"
        >
          {selected === 'free'
            ? 'Continue with Free'
            : `Start ${selectedPlan.name}`}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>

        {selected !== 'free' && (
          <button
            onClick={() => { setSelected('free'); }}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Continue with Free instead
          </button>
        )}

        {selected !== 'free' && (
          <p className="text-center text-[10px] text-muted-foreground/60 mt-1">
            Cancel anytime · Secure payment
          </p>
        )}
      </div>
    </div>
  );
};

export default ChoosePlan;
