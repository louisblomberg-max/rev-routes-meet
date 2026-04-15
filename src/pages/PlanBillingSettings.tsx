import { useState, useEffect } from 'react';
import { Check, Crown, CreditCard, Calendar, Receipt, ChevronRight, Route, Calendar as CalendarIcon, Users, MessageSquare, Car, MapPin, Shield, Eye, Lock, BarChart3, Ticket, Store, BadgeCheck } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { usePlan, PlanId, FEATURE_REQUIREMENTS } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const PLAN_FEATURES: Record<PlanId, { label: string; icon: any; route?: string; featureId: string }[]> = {
  free: [
    { label: 'Browse routes, events & services', icon: Route, route: '/', featureId: 'browse_routes' },
    { label: '1 free event post included', icon: CalendarIcon, featureId: 'browse_events' },
    { label: 'Additional events £5.99 each', icon: CreditCard, featureId: 'browse_services' },
    { label: 'Join clubs & forums', icon: Users, route: '/clubs', featureId: 'join_clubs' },
    { label: 'Basic messaging', icon: MessageSquare, route: '/messages', featureId: 'basic_messaging' },
    { label: 'Save & bookmark content', icon: Route, route: '/my-routes', featureId: 'save_routes' },
  ],
  pro: [
    { label: 'Unlimited event posts', icon: CalendarIcon, featureId: 'create_events' },
    { label: 'Create & publish routes', icon: Route, route: '/add/route', featureId: 'create_routes' },
    { label: 'Host unlimited events', icon: CalendarIcon, featureId: 'create_events' },
    { label: 'Live location sharing', icon: MapPin, featureId: 'live_location' },
    { label: 'SOS breakdown help', icon: Shield, featureId: 'breakdown_help' },
    { label: 'Garage showcase', icon: Car, route: '/my-garage', featureId: 'garage_showcase' },
    { label: 'Priority visibility', icon: Eye, featureId: 'priority_visibility' },
  ],
  club: [
    { label: 'Create & manage clubs', icon: Users, route: '/add/club', featureId: 'create_clubs' },
    { label: 'Event ticketing with Stripe payouts', icon: Ticket, featureId: 'event_ticketing' },
    { label: 'Business & service listings', icon: Store, route: '/add/service', featureId: 'business_listings' },
    { label: 'Analytics & insights', icon: BarChart3, featureId: 'analytics' },
    { label: 'Featured placement', icon: MapPin, featureId: 'featured_placement' },
    { label: 'Verified badge', icon: BadgeCheck, featureId: 'verified_badge' },
  ],
};

const PlanBillingSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan, hasAccess, getPlanLabel } = usePlan();
  const [isLoading, setIsLoading] = useState(true);
  const [subData, setSubData] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle();
      setSubData(data);
      setIsLoading(false);
    })();
  }, [user?.id]);

  const billingCycle = subData?.billing_cycle || 'monthly';
  const plans = [
    { id: 'free' as PlanId, name: 'Explorer (Free)', price: { monthly: 0, yearly: 0 } },
    { id: 'pro' as PlanId, name: 'Pro Driver', price: { monthly: 4.99, yearly: 39.99 } },
    { id: 'club' as PlanId, name: 'Club', price: { monthly: 9.99, yearly: 79.99 } },
    { id: 'business' as PlanId, name: 'Business', price: { monthly: 19.99, yearly: 159.99 } },
  ];
  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[0];
  const price = billingCycle === 'monthly' ? currentPlanData.price.monthly : currentPlanData.price.yearly;

  const accessibleFeatures = [
    ...PLAN_FEATURES.free,
    ...(currentPlan === 'pro' || currentPlan === 'club' ? PLAN_FEATURES.pro : []),
    ...(currentPlan === 'club' ? PLAN_FEATURES.club : []),
  ];
  const lockedFeatures = currentPlan === 'free' ? [...PLAN_FEATURES.pro, ...PLAN_FEATURES.club] : currentPlan === 'pro' ? PLAN_FEATURES.club : [];

  const formatNextBilling = () => {
    if (!subData?.current_period_end) return currentPlan === 'free' ? 'N/A (Free plan)' : 'Not set';
    try {
      return format(new Date(subData.current_period_end), 'dd MMMM yyyy');
    } catch {
      return 'Unknown';
    }
  };

  const statusLabel = () => {
    const s = subData?.status;
    if (!s || s === 'active') return 'Active';
    if (s === 'pending_payment') return 'Pending payment';
    if (s === 'inactive') return 'Inactive';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen pb-8 md:max-w-2xl md:mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
          <div className="px-4 py-3 flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-full bg-muted/80" />
            <div><h1 className="text-lg font-bold text-foreground">Plan & Billing</h1></div>
          </div>
        </div>
        <div className="px-4 pt-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen pb-8 md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-muted/80 hover:bg-muted" />
          <div><h1 className="text-lg font-bold text-foreground">Plan & Billing</h1><p className="text-xs text-muted-foreground">Manage your plan, payments, and upgrades</p></div>
        </div>
      </div>

      {/* Current Plan */}
      <div className="px-4 pt-4">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h3 className="text-base font-semibold text-foreground">Your plan</h3></div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-foreground">{getPlanLabel(currentPlan)}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{statusLabel()}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {currentPlan === 'free' && 'Browse, discover & join — upgrade for more'}
                  {currentPlan === 'pro' && 'Create routes, events & live features'}
                  {currentPlan === 'club' && 'Full access including club management & ticketing'}
                </p>
                <Button size="sm" className="h-8" onClick={() => navigate('/upgrade')}>
                  <Crown className="w-3.5 h-3.5 mr-1.5" />Change plan
                </Button>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">{price === 0 ? 'Free' : `£${price.toFixed(2)}`}</span>
                {price > 0 && <p className="text-xs text-muted-foreground">/ {billingCycle === 'monthly' ? 'month' : 'year'}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Your Features</h2>
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <div className="divide-y divide-border/20">
            {accessibleFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <button key={`${feature.featureId}-${idx}`} onClick={() => feature.route && navigate(feature.route)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors active:bg-muted">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-primary" /></div>
                  <span className="flex-1 text-left text-sm text-foreground">{feature.label}</span>
                  {feature.route ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" /> : <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {lockedFeatures.length > 0 && (
        <div className="px-4 pt-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Unlock with Upgrade</h2>
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/20">
              {lockedFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                const requiredPlan = FEATURE_REQUIREMENTS[feature.featureId] as PlanId;
                return (
                  <button key={`locked-${feature.featureId}-${idx}`} onClick={() => navigate('/upgrade')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors opacity-50">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-muted-foreground" /></div>
                    <span className="flex-1 text-left text-sm text-muted-foreground">{feature.label}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground">{getPlanLabel(requiredPlan)}</Badge>
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
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><CreditCard className="w-4 h-4 text-muted-foreground" /></div>
              <div className="text-left"><p className="text-sm font-medium text-foreground">Payment method</p><p className="text-xs text-muted-foreground">{currentPlan === 'free' ? 'No card on file' : 'Managed via Stripe'}</p></div>
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
              <div className="text-left"><p className="text-sm font-medium text-foreground">Billing cycle</p><p className="text-xs text-muted-foreground capitalize">{billingCycle}</p></div>
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><Receipt className="w-4 h-4 text-muted-foreground" /></div>
              <div className="text-left"><p className="text-sm font-medium text-foreground">Next billing date</p><p className="text-xs text-muted-foreground">{formatNextBilling()}</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Plan */}
      <div className="px-4 pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Manage plan</h2>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/upgrade')}>
            <Crown className="w-3.5 h-3.5 mr-1.5" />Change plan
          </Button>
          {currentPlan !== 'free' && (
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">Cancel subscription</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Cancel your subscription?</AlertDialogTitle><AlertDialogDescription>You'll be moved to the Free plan at the end of your billing period.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Keep my plan</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cancel subscription</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanBillingSettings;
