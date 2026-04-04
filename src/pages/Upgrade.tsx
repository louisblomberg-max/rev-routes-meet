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

const Upgrade = () => {
  const navigate = useNavigate();
  const { currentPlan, setPlan, setSubscriptionStatus, effectivePlan } = usePlan();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const togglePlanExpanded = (planId: string) => {
    setExpandedPlans(prev => ({ ...prev, [planId]: !prev[planId] }));
  };

  const plans = [
    {
      id: 'free' as PlanId,
      name: 'Free Member',
      icon: Sparkles,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border/50',
      price: { monthly: 0, yearly: 0 },
      savingsBadge: null,
      features: [
        'Browse routes, events & services',
        '1 free event post included',
        'Additional events £2.99 each',
        'Join clubs & forums',
        'Basic messaging',
        'Save & bookmark content',
      ],
      recommended: false,
    },
    {
      id: 'pro' as PlanId,
      name: 'Pro Driver',
      icon: Star,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary',
      price: { monthly: 3.99, yearly: 43.99 },
      savingsBadge: 'Save 8%',
      features: [
        'Everything in Explorer, plus:',
        'Unlimited event posts',
        'Create & publish routes',
        'Host unlimited events',
        'Live location sharing',
        'SOS breakdown help',
        'Garage showcase',
        'Priority visibility',
      ],
      recommended: true,
    },
    {
      id: 'club' as PlanId,
      name: 'Club / Business',
      icon: Building2,
      color: 'text-clubs',
      bgColor: 'bg-clubs/10',
      borderColor: 'border-clubs/30',
      price: { monthly: 5.99, yearly: 63.99 },
      savingsBadge: 'Save 11%',
      features: [
        'Everything in Pro, plus:',
        'Create & manage clubs',
        'Event ticketing with Stripe payouts',
        'Business & service listings',
        'Analytics & insights',
        'Featured placement',
        'Verified badge',
      ],
      recommended: false,
    },
  ];

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === currentPlan) return;
    
    if (planId === 'free') {
      setPlan(planId);
      setSubscriptionStatus('active');
      toast.success('Downgraded to Free');
      return;
    }

    // Check for native platform
    try {
      const Capacitor = (window as any).Capacitor;
      if (Capacitor.isNativePlatform()) {
        toast.info('Payment available on web at revnet.app');
        return;
      }
    } catch { /* not native */ }

    setLoading(true);
    try {
      const priceId = getPriceId(planId as 'pro' | 'club', billingCycle);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { price_id: priceId, plan: planId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
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
          <span className={`text-sm transition-colors ${billingCycle === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch 
            checked={billingCycle === 'yearly'} 
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm transition-colors ${billingCycle === 'yearly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
        </div>

        <div className="space-y-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all ${
                  isCurrentPlan
                    ? 'border-primary border-2 shadow-md ring-2 ring-primary/20'
                    : plan.recommended && !isCurrentPlan
                      ? `${plan.borderColor} border-2 shadow-md` 
                      : 'border-border/50'
                }`}
              >
                {plan.recommended && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-bl-lg">
                    ⭐ Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-bl-lg flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Active Plan
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${plan.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${plan.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">
                          {price === 0 ? 'Free' : `£${price.toFixed(2)}`}
                        </span>
                        {price > 0 && (
                          <span className="text-xs text-muted-foreground">
                            / {billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && plan.savingsBadge && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {plan.savingsBadge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {(expandedPlans[plan.id] 
                      ? plan.features 
                      : plan.features.slice(0, plan.recommended ? 5 : 4)
                    ).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          idx === 0 && plan.id !== 'free' ? 'opacity-0' : plan.color
                        }`} />
                        <span className={`${
                          idx === 0 && plan.id !== 'free' 
                            ? 'font-medium text-foreground' 
                            : 'text-muted-foreground'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.features.length > (plan.recommended ? 5 : 4) && (
                      <li>
                        <button 
                          onClick={() => togglePlanExpanded(plan.id)}
                          className="flex items-center gap-1 text-xs text-primary font-medium pl-5 hover:text-primary/80 transition-colors"
                        >
                          {expandedPlans[plan.id] ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              Show less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              +{plan.features.length - (plan.recommended ? 5 : 4)} more features
                            </>
                          )}
                        </button>
                      </li>
                    )}
                  </ul>
                  
                  <Button 
                    variant={isCurrentPlan ? 'secondary' : plan.recommended ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full h-10 ${plan.recommended && !isCurrentPlan ? 'font-semibold' : ''}`}
                    disabled={isCurrentPlan || loading}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrentPlan 
                      ? '✓ Current Plan'
                      : ['free', 'pro', 'club'].indexOf(plan.id) < ['free', 'pro', 'club'].indexOf(currentPlan)
                        ? `Downgrade to ${plan.name}`
                        : plan.id === 'pro'
                          ? 'Upgrade to Pro'
                          : plan.id === 'club'
                            ? 'Upgrade to Club'
                            : 'Select'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cancel anytime. No hidden fees.<br />
            Your data stays yours, always.
          </p>
        </div>

        <button 
          onClick={() => navigate('/settings/billing')}
          className="w-full text-sm text-primary font-medium hover:text-primary/80 transition-colors py-2"
        >
          View billing history & manage subscription →
        </button>
      </div>
    </div>
  );
};

export default Upgrade;
