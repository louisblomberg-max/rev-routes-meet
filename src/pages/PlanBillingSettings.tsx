import { ArrowLeft, Check, Star, Crown, Building2, CreditCard, Calendar, Receipt, ChevronRight, Download, Route, Calendar as CalendarIcon, Users, MessageSquare, Car, MapPin, Shield, Sparkles, BarChart3, Ticket, Store, BadgeCheck, Eye, Filter, Lock } from 'lucide-react';
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
import { toast } from 'sonner';
import { usePlan, PlanId, FEATURE_REQUIREMENTS } from '@/contexts/PlanContext';

const PLAN_FEATURES: Record<PlanId, { label: string; icon: any; route?: string; featureId: string }[]> = {
  free: [
    { label: 'Browse Routes', icon: Route, route: '/', featureId: 'browse_routes' },
    { label: 'Browse Events', icon: CalendarIcon, route: '/', featureId: 'browse_events' },
    { label: 'Browse Services', icon: Store, route: '/', featureId: 'browse_services' },
    { label: 'Join Clubs', icon: Users, route: '/clubs', featureId: 'join_clubs' },
    { label: 'Join Forums', icon: MessageSquare, route: '/forums', featureId: 'join_forums' },
    { label: 'Basic Messaging', icon: MessageSquare, route: '/messages', featureId: 'basic_messaging' },
    { label: 'Save Routes', icon: Route, route: '/my-routes', featureId: 'save_routes' },
    { label: 'Save Events', icon: CalendarIcon, route: '/my-events', featureId: 'save_events' },
    { label: 'My Friends', icon: Users, route: '/my-friends', featureId: 'my_friends' },
    { label: 'My Discussions', icon: MessageSquare, route: '/my-discussions', featureId: 'my_discussions' },
  ],
  pro: [
    { label: 'Create Routes', icon: Route, route: '/add-route', featureId: 'create_routes' },
    { label: 'Create Events', icon: CalendarIcon, route: '/add-event', featureId: 'create_events' },
    { label: 'Live Location', icon: MapPin, featureId: 'live_location' },
    { label: 'Breakdown Help', icon: Shield, featureId: 'breakdown_help' },
    { label: 'Advanced Filters', icon: Filter, featureId: 'advanced_filters' },
    { label: 'Garage Showcase', icon: Car, route: '/my-garage', featureId: 'garage_showcase' },
    { label: 'Priority Visibility', icon: Eye, featureId: 'priority_visibility' },
  ],
  club: [
    { label: 'Create Clubs', icon: Users, route: '/add-club', featureId: 'create_clubs' },
    { label: 'Club Announcements', icon: MessageSquare, featureId: 'club_announcements' },
    { label: 'Event Ticketing', icon: Ticket, featureId: 'event_ticketing' },
    { label: 'Business Listings', icon: Store, route: '/add-service', featureId: 'business_listings' },
    { label: 'Analytics', icon: BarChart3, featureId: 'analytics' },
    { label: 'Featured Placement', icon: MapPin, featureId: 'featured_placement' },
    { label: 'Verified Badge', icon: BadgeCheck, featureId: 'verified_badge' },
  ],
};

const PlanBillingSettings = () => {
  const navigate = useNavigate();
  const { currentPlan, setPlan, hasAccess, getPlanLabel } = usePlan();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free' as PlanId,
      name: 'Free Member',
      icon: Sparkles,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border/50',
      price: { monthly: 0, yearly: 0 },
    },
    {
      id: 'pro' as PlanId,
      name: 'Pro Driver',
      icon: Star,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary',
      price: { monthly: 4.99, yearly: 47.99 },
      recommended: true,
    },
    {
      id: 'club' as PlanId,
      name: 'Club / Business',
      icon: Building2,
      color: 'text-clubs',
      bgColor: 'bg-clubs/10',
      borderColor: 'border-clubs/30',
      price: { monthly: 19.99, yearly: 189.99 },
    },
  ];

  const currentPlanData = plans.find(p => p.id === currentPlan)!;
  const price = billingCycle === 'monthly' ? currentPlanData.price.monthly : currentPlanData.price.yearly;

  const billingHistory = [
    { date: '12 Feb 2026', amount: price === 0 ? '£0.00' : `£${price.toFixed(2)}`, status: 'Paid', plan: currentPlanData.name },
    { date: '12 Jan 2026', amount: price === 0 ? '£0.00' : `£${price.toFixed(2)}`, status: 'Paid', plan: currentPlanData.name },
  ];

  const handleChangePlan = (planId: PlanId) => {
    if (planId === currentPlan) return;
    const planName = plans.find(p => p.id === planId)?.name || planId;
    const isDowngrade = ['free', 'pro', 'club'].indexOf(planId) < ['free', 'pro', 'club'].indexOf(currentPlan);
    setPlan(planId);
    toast.success(isDowngrade ? `Downgraded to ${planName}` : `Upgraded to ${planName}!`, {
      description: isDowngrade ? 'Some features are now locked.' : 'You now have access to more features!',
    });
  };

  const handleCancel = () => {
    setPlan('free');
    toast.success('Subscription cancelled', {
      description: 'You have been moved to the Free plan.',
    });
  };

  // Get all features accessible with current plan
  const accessibleFeatures = [
    ...PLAN_FEATURES.free,
    ...(currentPlan === 'pro' || currentPlan === 'club' ? PLAN_FEATURES.pro : []),
    ...(currentPlan === 'club' ? PLAN_FEATURES.club : []),
  ];

  // Get locked features (next tier)
  const lockedFeatures = currentPlan === 'free' 
    ? [...PLAN_FEATURES.pro, ...PLAN_FEATURES.club]
    : currentPlan === 'pro'
      ? PLAN_FEATURES.club
      : [];

  return (
    <div className="mobile-container bg-background min-h-screen pb-8">
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
                  <span className="text-lg font-bold text-foreground">{getPlanLabel(currentPlan)}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {currentPlan === 'free' && 'Basic access to clubs, forums & routes'}
                  {currentPlan === 'pro' && 'Create routes, events & live features'}
                  {currentPlan === 'club' && 'Full access including club management'}
                </p>
                {currentPlan !== 'club' && (
                  <Button size="sm" className="h-8" onClick={() => navigate('/upgrade')}>
                    <Crown className="w-3.5 h-3.5 mr-1.5" />
                    Upgrade plan
                  </Button>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">
                  {price === 0 ? 'Free' : `£${price.toFixed(2)}`}
                </span>
                {price > 0 && (
                  <p className="text-xs text-muted-foreground">/ {billingCycle === 'monthly' ? 'month' : 'year'}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Features */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Your Features</h2>
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="divide-y divide-border/20">
            {accessibleFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <button
                  key={`${feature.featureId}-${idx}`}
                  onClick={() => feature.route && navigate(feature.route)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors active:bg-muted"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="flex-1 text-left text-sm text-foreground">{feature.label}</span>
                  {feature.route && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                  {!feature.route && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Locked Features */}
      {lockedFeatures.length > 0 && (
        <div className="px-4 pt-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Unlock with Upgrade</h2>
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/20">
              {lockedFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                const requiredPlan = FEATURE_REQUIREMENTS[feature.featureId] as PlanId;
                return (
                  <button
                    key={`locked-${feature.featureId}-${idx}`}
                    onClick={() => navigate('/upgrade')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors opacity-50"
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="flex-1 text-left text-sm text-muted-foreground">{feature.label}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground">
                        {getPlanLabel(requiredPlan)}
                      </Badge>
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Billing Details */}
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
                <p className="text-xs text-muted-foreground">{currentPlan === 'free' ? 'No card on file' : '•••• 4242'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
          
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Billing cycle</p>
                <p className="text-xs text-muted-foreground capitalize">{billingCycle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${billingCycle === 'monthly' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Mo</span>
              <Switch 
                checked={billingCycle === 'yearly'} 
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                className="scale-90"
              />
              <span className={`text-xs ${billingCycle === 'yearly' ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>Yr</span>
            </div>
          </div>
          
          <button className="w-full flex items-center justify-between px-3 py-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Receipt className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Next payment</p>
                <p className="text-xs text-muted-foreground">{currentPlan === 'free' ? 'N/A (Free plan)' : '12 Mar 2026'}</p>
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
        </div>
      </div>

      {/* Manage Plan */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Manage plan</h2>
        <div className="space-y-2">
          {/* Downgrade */}
          {currentPlan !== 'free' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  Downgrade to {currentPlan === 'club' ? 'Pro Driver' : 'Free'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Downgrade your plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {currentPlan === 'club' 
                      ? 'You\'ll lose access to club management, analytics, and business features. Your plan will change to Pro Driver.'
                      : 'You\'ll lose access to route creation, events, live features, and more. Your plan will change to Free.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my plan</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleChangePlan(currentPlan === 'club' ? 'pro' : 'free')}>
                    Downgrade
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Cancel */}
          {currentPlan !== 'free' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                  Cancel subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll be moved to the Free plan and lose access to all premium features. This cannot be undone automatically.
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
          )}

          {currentPlan === 'free' && (
            <div className="bg-muted/30 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">You're on the Free plan. Upgrade to unlock more features.</p>
              <Button size="sm" className="mt-2" onClick={() => navigate('/upgrade')}>
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                View plans
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Assurance */}
      <div className="px-4 pt-6">
        <div className="bg-muted/30 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cancel anytime. No hidden fees.<br />
            Your data stays yours, always.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanBillingSettings;
