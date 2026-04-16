import { Crown, CreditCard, Check, X, Shield, Sparkles, Route, Building, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_PRICES } from '@/config/stripe';

type PaywallType = 'event' | 'route' | 'service' | 'club';

interface CreationPaywallSheetProps {
  open: boolean;
  onClose: () => void;
  type: PaywallType;
  /** Called after successful one-time payment redirect isn't needed — user returns via success URL */
  onPublishWithCredit?: () => void;
}

const PAYWALL_CONFIG: Record<PaywallType, {
  heading: string;
  subheading: string;
  icon: React.ElementType;
  accentClass: string;
  showPayOnce: boolean;
  payOnceLabel: string;
  payOncePrice: string;
  upgradePlan: 'enthusiast' | 'business';
  upgradePlanLabel: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlySaving: string;
  features: string[];
}> = {
  event: {
    heading: 'Publish Your Event',
    subheading: "You've used your free event post",
    icon: CreditCard,
    accentClass: 'text-events',
    showPayOnce: true,
    payOnceLabel: 'Pay £5.99 — Publish this event',
    payOncePrice: '£5.99',
    upgradePlan: 'enthusiast',
    upgradePlanLabel: 'Enthusiast',
    monthlyPrice: '£7.99/month',
    yearlyPrice: '£63.99/year',
    yearlySaving: '2 months free',
    features: [
      'Create unlimited free and ticketed events',
      'Sell tickets — 5% commission',
      'Organiser dashboard',
      'Everything in Enthusiast',
    ],
  },
  route: {
    heading: 'Enthusiast Plan Required',
    subheading: 'Creating and publishing routes requires the Enthusiast plan',
    icon: Route,
    accentClass: 'text-routes',
    showPayOnce: false,
    payOnceLabel: '',
    payOncePrice: '',
    upgradePlan: 'enthusiast',
    upgradePlanLabel: 'Enthusiast',
    monthlyPrice: '£7.99/month',
    yearlyPrice: '£63.99/year',
    yearlySaving: '2 months free',
    features: [
      'Create unlimited routes',
      'Import GPX files',
      'Unlimited navigation',
      'Live location and convoy mode',
    ],
  },
  service: {
    heading: 'Business Plan Required',
    subheading: 'Service listings require the Business plan — managed from the website dashboard',
    icon: Building,
    accentClass: 'text-services',
    showPayOnce: false,
    payOnceLabel: '',
    payOncePrice: '',
    upgradePlan: 'business',
    upgradePlanLabel: 'Business',
    monthlyPrice: '£19.99/month',
    yearlyPrice: '£159.99/year',
    yearlySaving: '2 months free',
    features: [
      'Service listing on the RevNet map',
      'Featured placement',
      'Verified business badge',
      'Business analytics',
    ],
  },
  club: {
    heading: 'Enthusiast Plan Required',
    subheading: 'Creating clubs requires the Enthusiast plan',
    icon: Users,
    accentClass: 'text-clubs',
    showPayOnce: false,
    payOnceLabel: '',
    payOncePrice: '',
    upgradePlan: 'enthusiast',
    upgradePlanLabel: 'Enthusiast',
    monthlyPrice: '£7.99/month',
    yearlyPrice: '£63.99/year',
    yearlySaving: '2 months free',
    features: [
      'Create and manage your own club',
      'Club feed and announcements',
      'Analytics dashboard',
      'Verified badge',
    ],
  },
};

const CreationPaywallSheet = ({ open, onClose, type }: CreationPaywallSheetProps) => {
  const [loadingPayOnce, setLoadingPayOnce] = useState(false);
  const [loadingMonthly, setLoadingMonthly] = useState(false);
  const [loadingYearly, setLoadingYearly] = useState(false);

  if (!open) return null;

  const config = PAYWALL_CONFIG[type];

  const handlePayOnce = async () => {
    setLoadingPayOnce(true);
    try {
      const { data, error } = await supabase.functions.invoke('charge-event-post');
      if (error || !data?.url) {
        toast.error('Payment failed. Please try again.');
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoadingPayOnce(false);
    }
  };

  const handleUpgrade = async (billing: 'monthly' | 'yearly') => {
    const setLoading = billing === 'monthly' ? setLoadingMonthly : setLoadingYearly;
    setLoading(true);
    try {
      const priceId = billing === 'monthly'
        ? (config.upgradePlan === 'enthusiast' ? STRIPE_PRICES.enthusiast_monthly : STRIPE_PRICES.business_monthly)
        : (config.upgradePlan === 'enthusiast' ? STRIPE_PRICES.enthusiast_yearly : STRIPE_PRICES.business_yearly);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { price_id: priceId, plan: config.upgradePlan },
      });
      if (error || !data?.url) {
        toast.error('Could not start upgrade. Please try again.');
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-card w-full max-w-md rounded-t-3xl border-t border-border/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        <div className="px-5 pb-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
                <Crown className={`w-5 h-5 ${config.accentClass}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{config.heading}</h3>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">{config.subheading}</p>

          {/* Pay once option (events only) */}
          {config.showPayOnce && (
            <>
              <button
                onClick={handlePayOnce}
                disabled={loadingPayOnce}
                className="w-full text-left bg-muted/30 rounded-2xl border border-border/50 p-4 hover:border-primary/30 transition-all disabled:opacity-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Post this event — {config.payOncePrice} one time</p>
                    <p className="text-[11px] text-muted-foreground">Your event stays live for 30 days.</p>
                  </div>
                </div>
                <Button
                  className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 mt-2"
                  disabled={loadingPayOnce}
                >
                  {loadingPayOnce ? 'Loading…' : `Pay ${config.payOncePrice}`}
                </Button>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            </>
          )}

          {/* Upgrade section */}
          <div className="bg-primary/5 rounded-2xl border-2 border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-primary">
                {config.showPayOnce ? 'Recommended' : `Upgrade to ${config.upgradePlanLabel}`}
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-1.5 mb-4">
              {config.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Monthly button */}
            <Button
              onClick={() => handleUpgrade('monthly')}
              disabled={loadingMonthly}
              className="w-full h-10 rounded-xl mb-2"
            >
              <Crown className="w-4 h-4 mr-1.5" />
              {loadingMonthly ? 'Loading…' : `${config.upgradePlanLabel} — ${config.monthlyPrice}`}
            </Button>

            {/* Yearly button */}
            <Button
              onClick={() => handleUpgrade('yearly')}
              disabled={loadingYearly}
              variant="outline"
              className="w-full h-10 rounded-xl border-primary/30"
            >
              {loadingYearly ? 'Loading…' : (
                <>
                  {config.upgradePlanLabel} — {config.yearlyPrice}
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                    {config.yearlySaving}
                  </span>
                </>
              )}
            </Button>
          </div>

          {/* Trust signals */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure payment</span>
              <span>Cancel anytime</span>
              <span>Instant access</span>
            </div>
          </div>

          {/* Cancel */}
          <button onClick={onClose} className="w-full text-center text-sm text-muted-foreground py-2 hover:text-foreground transition-colors">
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreationPaywallSheet;
