import { ArrowLeft, Check, Star, Crown, Building2, CreditCard, Calendar, Receipt, ChevronRight, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const PlanBillingSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentPlan] = useState<'free' | 'pro' | 'club'>('free');

  const plans = [
    {
      id: 'free',
      name: 'Free Member',
      icon: Check,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
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
      borderColor: 'border-primary/30',
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
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
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

  const billingHistory = [
    { date: '12 Feb 2026', amount: '£0.00', status: 'Paid', plan: 'Free Member' },
    { date: '12 Jan 2026', amount: '£0.00', status: 'Paid', plan: 'Free Member' },
  ];

  const handleUpgrade = (planId: string) => {
    toast({
      title: "Upgrade initiated",
      description: `Starting upgrade to ${planId === 'pro' ? 'Pro Driver' : 'Club / Business'} plan.`,
    });
  };

  const handleDowngrade = () => {
    toast({
      title: "Plan downgraded",
      description: "Your plan will change at the end of the billing period.",
    });
  };

  const handleCancel = () => {
    toast({
      title: "Subscription cancelled",
      description: "Your current plan will remain active until the end of the billing period.",
    });
  };

  return (
    <div className="mobile-container bg-background min-h-screen pb-8">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Plan & Billing</h1>
            <p className="text-xs text-muted-foreground">Manage your plan, payments, and upgrades</p>
          </div>
        </div>
      </div>

      {/* Current Plan Card */}
      <div className="px-4 pt-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-foreground">Your plan</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-foreground">Free Member</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Access to routes, events, clubs, and community features
                </p>
                <Button size="sm" className="h-8">
                  <Crown className="w-3.5 h-3.5 mr-1.5" />
                  Upgrade plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="px-4 pt-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <Switch 
            checked={billingCycle === 'yearly'} 
            onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm ${billingCycle === 'yearly' ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0 bg-green-100 text-green-700">Save 15%</Badge>
          </span>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="px-4 pt-2">
        <h2 className="text-sm font-semibold text-foreground mb-3">Choose your plan</h2>
        <div className="space-y-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentPlan;
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${plan.recommended ? plan.borderColor + ' border-2' : 'border-border/50'}`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-bl-lg">
                    ⭐ Recommended
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${plan.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${plan.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  </div>
                  
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className={`w-3 h-3 mt-0.5 shrink-0 ${idx === 0 && plan.id !== 'free' ? 'opacity-0' : plan.color}`} />
                        <span className={idx === 0 && plan.id !== 'free' ? 'font-medium text-foreground' : ''}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xl font-bold text-foreground">
                        £{price.toFixed(price === 0 ? 0 : 2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {price === 0 ? '' : ` / ${billingCycle === 'monthly' ? 'month' : 'year'}`}
                      </span>
                    </div>
                    <Button 
                      variant={isCurrentPlan ? 'secondary' : 'default'}
                      size="sm"
                      className="h-8"
                      disabled={isCurrentPlan}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {isCurrentPlan ? 'Current plan' : plan.id === 'club' ? 'Contact us' : 'Upgrade to Pro'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Billing Information */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Billing details</h2>
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          <button className="w-full flex items-center justify-between px-3 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Payment method</p>
                <p className="text-xs text-muted-foreground">No card on file</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Billing cycle</p>
                <p className="text-xs text-muted-foreground capitalize">{billingCycle}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
          
          <button className="w-full flex items-center justify-between px-3 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Receipt className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Next payment</p>
                <p className="text-xs text-muted-foreground">N/A (Free plan)</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        </div>
      </div>

      {/* Billing History */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Billing history</h2>
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          {billingHistory.length > 0 ? (
            <div className="divide-y divide-border/30">
              {billingHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.date}</p>
                    <p className="text-xs text-muted-foreground">{item.plan}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{item.amount}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-muted-foreground">No billing history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Assurance Text */}
      <div className="px-4 pt-6">
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            You can change or cancel your plan at any time.<br />
            No ads. No hidden fees. Your data stays yours.
          </p>
        </div>
      </div>

      {/* Manage Plan */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Manage plan</h2>
        <div className="space-y-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start" disabled={currentPlan === 'free'}>
                Downgrade plan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Downgrade your plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your current plan will remain active until the end of the billing period. You'll then be moved to the Free plan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my plan</AlertDialogCancel>
                <AlertDialogAction onClick={handleDowngrade}>Downgrade</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive" disabled={currentPlan === 'free'}>
                Cancel subscription
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your current plan will remain active until the end of the billing period. After that, you'll be moved to the Free plan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my plan</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Cancel subscription
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default PlanBillingSettings;
