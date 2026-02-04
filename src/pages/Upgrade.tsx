import { ArrowLeft, Check, Star, Crown, Building2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const Upgrade = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const currentPlan = 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free Member',
      icon: Sparkles,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border/50',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Browse routes, events & services',
        'Join clubs & forums',
        'Post questions & replies',
        'Save routes & events',
        'Basic messaging',
      ],
      recommended: false,
    },
    {
      id: 'pro',
      name: 'Pro Driver',
      icon: Star,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary',
      price: { monthly: 4.99, yearly: 49 },
      features: [
        'Everything in Free, plus:',
        'Create & publish routes',
        'Create events & drive-outs',
        'Live location sharing (group drives)',
        'Breakdown / Help requests',
        'Advanced route filters',
        'Profile & garage showcase',
        'Priority community visibility',
      ],
      recommended: true,
    },
    {
      id: 'club',
      name: 'Club / Business',
      icon: Building2,
      color: 'text-clubs',
      bgColor: 'bg-clubs/10',
      borderColor: 'border-clubs/30',
      price: { monthly: 19.99, yearly: 199 },
      features: [
        'Everything in Pro, plus:',
        'Create & manage clubs',
        'Club announcements & posts',
        'Event ticketing',
        'Business/service listings',
        'Analytics (views, engagement)',
        'Featured placement on map',
        'Verified badge',
      ],
      recommended: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      navigate(-1);
      return;
    }
    
    if (planId === 'club') {
      toast.info('Contact us for Club/Business plans', {
        description: 'We\'ll be in touch to discuss your needs.',
      });
      return;
    }

    toast.success(`Upgrading to ${planId === 'pro' ? 'Pro Driver' : 'Club / Business'}`, {
      description: 'Payment processing would happen here.',
    });
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Upgrade</h1>
            <p className="text-xs text-muted-foreground">Choose the right plan for you</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Hero Section */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Unlock More Features</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create routes, host events, and connect with the community
          </p>
        </div>

        {/* Billing Cycle Toggle */}
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
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Save 15%
            </Badge>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="space-y-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all ${
                  plan.recommended 
                    ? `${plan.borderColor} border-2 shadow-md` 
                    : 'border-border/50'
                } ${isCurrentPlan ? 'bg-muted/30' : ''}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-bl-lg">
                    ⭐ Most Popular
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-muted text-muted-foreground text-[10px] font-semibold px-2.5 py-1 rounded-br-lg">
                    Current
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
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, plan.recommended ? 5 : 4).map((feature, idx) => (
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
                      <li className="text-xs text-primary font-medium pl-5">
                        +{plan.features.length - (plan.recommended ? 5 : 4)} more features
                      </li>
                    )}
                  </ul>
                  
                  <Button 
                    variant={isCurrentPlan ? 'secondary' : plan.recommended ? 'default' : 'outline'}
                    size="sm"
                    className={`w-full h-10 ${plan.recommended ? 'font-semibold' : ''}`}
                    disabled={isCurrentPlan}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrentPlan 
                      ? 'Current Plan' 
                      : plan.id === 'club' 
                        ? 'Contact Us' 
                        : plan.id === 'pro'
                          ? 'Upgrade to Pro'
                          : 'Select'
                    }
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Assurance */}
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cancel anytime. No hidden fees.<br />
            Your data stays yours, always.
          </p>
        </div>

        {/* Link to full billing */}
        <button 
          onClick={() => navigate('/settings/plan-billing')}
          className="w-full text-sm text-primary font-medium hover:text-primary/80 transition-colors py-2"
        >
          View billing history & manage subscription →
        </button>
      </div>
    </div>
  );
};

export default Upgrade;