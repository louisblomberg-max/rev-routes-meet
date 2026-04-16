import { Check, Star, Crown, Building2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { usePlan, PlanId } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { getPriceId } from '@/config/stripe';

const plans = [
  {
    id: 'free' as PlanId,
    name: 'Explorer',
    icon: Sparkles,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border/50',
    price: { monthly: 0, annual: 0 },
    description: 'Free forever',
    popular: false,
    trial: null,
    features: [
      'Full map — browse events, routes and services',
      'Navigate routes — 3 free navigations included',
      'Attend free and ticketed events',
      'Buy on the marketplace',
      'Join up to 2 clubs',
      'Full forum access — read and post',
      'Message up to 5 people',
      '1 vehicle in your garage',
      'SOS breakdown help — free for everyone',
    ],
    cta: "Get started — it's free",
    ctaSubtext: null,
  },
  {
    id: 'enthusiast' as PlanId,
    name: 'Enthusiast',
    icon: Star,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary',
    price: { monthly: 7.99, annual: 63.99 },
    description: 'For active enthusiasts',
    popular: true,
    trial: { days: 7, requiresCard: false },
    features: [
      'Everything in Explorer',
      'Unlimited navigation — turn by turn, voice, rerouting',
      'Create and publish unlimited routes',
      'Import GPX files',
      'Create free and ticketed events',
      'Sell tickets — RevNet takes 5%',
      'Organiser dashboard and QR check-in',
      'Live location sharing with friends',
      'Convoy mode — group drives with live tracking',
      'Create and manage your own club',
      'Unlimited clubs, messaging and saves',
      'Full garage — unlimited vehicles, mods, photos, history',
      'Sell on the marketplace — RevNet takes 3%',
    ],
    cta: 'Try free for 7 days',
    ctaSubtext: 'No credit card needed',
  },
  {
    id: 'business' as PlanId,
    name: 'Business',
    icon: Building2,
    color: 'text-services',
    bgColor: 'bg-services/10',
    borderColor: 'border-services/30',
    price: { monthly: 19.99, annual: 159.99 },
    description: 'For automotive businesses',
    popular: false,
    trial: null,
    features: [
      'Service listing on the RevNet map',
      'Featured placement in your area',
      'Verified business badge',
      'Business profile — photos, hours, contact',
      'Customer enquiries direct to your dashboard',
      'Member reviews and public replies',
      'Analytics — views, saves, enquiries',
      'Monthly performance summary',
      'Promotion boost — £4.99 per activation',
    ],
    cta: 'List your business',
    ctaSubtext: 'Managed from the website dashboard',
  },
];

const planOrder: PlanId[] = ['free', 'enthusiast', 'business'];

const Upgrade = () => {
  const navigate = useNavigate();
  const { currentPlan, setPlan, setSubscriptionStatus } = usePlan();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const togglePlanExpanded = (planId: string) => {
    setExpandedPlans(prev => ({ ...prev, [planId]: !prev[planId] }));
  };

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === currentPlan) return;

    if (planId === 'free') {
      setPlan(planId);
      setSubscriptionStatus('active');
      toast.success('Downgraded to Explorer');
      return;
    }

    try {
      const Capacitor = (window as any).Capacitor;
      if (Capacitor.isNativePlatform()) {
        toast.info('Payment available on web at revnet.app');
        return;
      }
    } catch { /* not native */ }

    setLoading(true);
    try {
      const priceId = getPriceId(planId as 'enthusiast' | 'business', billingCycle);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { price_id: priceId, plan: planId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-muted/80 hover:bg-muted" />
          <div>
            <h1 className="text-lg font-bold text-foreground">Upgrade</h1>
            <p className="text-xs text-muted-foreground">Choose the right plan for you</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Unlock More Features</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create routes, host events, and connect with the community
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 py-2">
          <span className={`text-sm transition-colors ${billingCycle === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <Switch checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} />
          <span className={`text-sm transition-colors ${billingCycle === 'yearly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Annual</span>
        </div>

        {billingCycle === 'yearly' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5 text-center">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Pay annually — get 2 months free</p>
          </div>
        )}

        <div className="space-y-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;

            return (
              <Card key={plan.id} className={`relative overflow-hidden transition-all ${
                isCurrentPlan ? 'border-primary border-2 shadow-md ring-2 ring-primary/20'
                  : plan.popular && !isCurrentPlan ? `${plan.borderColor} border-2 shadow-md` : 'border-border/50'
              }`}>
                {plan.popular && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-bl-lg">Most Popular</div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-bl-lg flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active Plan
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${plan.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{plan.name}</h3>
                      <p className="text-[11px] text-muted-foreground">{plan.description}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">{price === 0 ? 'Free' : `£${price.toFixed(2)}`}</span>
                        {price > 0 && <span className="text-xs text-muted-foreground">/ {billingCycle === 'monthly' ? 'month' : 'year'}</span>}
                      </div>
                      {billingCycle === 'yearly' && plan.price.monthly > 0 && (
                        <p className="text-[10px] text-muted-foreground">or £{plan.price.monthly.toFixed(2)}/month</p>
                      )}
                      {plan.trial && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mt-0.5">
                          {plan.trial.days} day free trial — no card needed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {(expandedPlans[plan.id] ? plan.features : plan.features.slice(0, plan.popular ? 5 : 4)).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${idx === 0 && plan.id !== 'free' ? 'opacity-0' : plan.color}`} />
                        <span className={idx === 0 && plan.id !== 'free' ? 'font-medium text-foreground' : 'text-muted-foreground'}>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > (plan.popular ? 5 : 4) && (
                      <li>
                        <button onClick={() => togglePlanExpanded(plan.id)} className="flex items-center gap-1 text-xs text-primary font-medium pl-5 hover:text-primary/80 transition-colors">
                          {expandedPlans[plan.id] ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> +{plan.features.length - (plan.popular ? 5 : 4)} more features</>}
                        </button>
                      </li>
                    )}
                  </ul>
                  <Button
                    variant={isCurrentPlan ? 'secondary' : plan.popular ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full h-10 ${plan.popular && !isCurrentPlan ? 'font-semibold' : ''}`}
                    disabled={isCurrentPlan || loading}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrentPlan ? '✓ Current Plan'
                      : planOrder.indexOf(plan.id) < planOrder.indexOf(currentPlan) ? `Downgrade to ${plan.name}` : plan.cta}
                  </Button>
                  {!isCurrentPlan && plan.ctaSubtext && <p className="text-[10px] text-muted-foreground text-center mt-1">{plan.ctaSubtext}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">Cancel anytime. No hidden fees.<br />Your data stays yours, always.</p>
        </div>
        <button onClick={() => navigate('/settings/billing')} className="w-full text-sm text-primary font-medium hover:text-primary/80 transition-colors py-2">
          View billing history & manage subscription →
        </button>
      </div>
    </div>
  );
};

export default Upgrade;
