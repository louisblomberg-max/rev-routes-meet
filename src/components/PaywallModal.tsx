// ============================
// Paywall / Mock Payment Modal
// ============================
import { useState } from 'react';
import { Crown, Check, X, CreditCard, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type PaywallReason = 'event_credits' | 'route_credits' | 'service_plan' | 'club_plan';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  reason: PaywallReason;
  creditsRemaining?: number;
  /** Called with true on success, false on fail */
  onPaymentResult: (success: boolean, method: 'per_item' | 'subscribe') => void;
}

const CONFIG: Record<PaywallReason, {
  title: string;
  perItemPrice: string;
  perItemLabel: string;
  subscribePrice: string;
  subscribePlan: string;
  benefits: string[];
}> = {
  event_credits: {
    title: 'Publish This Event',
    perItemPrice: '£2.99',
    perItemLabel: 'Pay to publish this event',
    subscribePrice: '£3.99/mo',
    subscribePlan: 'Pro Driver',
    benefits: [
      'Unlimited event publishing',
      'Create & publish routes',
      'Live location sharing',
      'Breakdown help (SOS)',
      'Garage showcase',
      'Priority visibility',
    ],
  },
  route_credits: {
    title: 'Publish This Route',
    perItemPrice: '£1.99',
    perItemLabel: 'Pay to publish this route',
    subscribePrice: '£3.99/mo',
    subscribePlan: 'Pro Driver',
    benefits: [
      'Unlimited route publishing',
      'Host unlimited events',
      'Live location sharing',
      'Breakdown help (SOS)',
      'Garage showcase',
      'Priority visibility',
    ],
  },
  service_plan: {
    title: 'Publish a Service',
    perItemPrice: '',
    perItemLabel: '',
    subscribePrice: '£6.99/mo',
    subscribePlan: 'Club / Business',
    benefits: [
      'Create & manage service listings',
      'Business verification badge',
      'Featured placement',
      'Analytics dashboard',
      'Everything in Pro Driver',
    ],
  },
  club_plan: {
    title: 'Create a Club',
    perItemPrice: '',
    perItemLabel: '',
    subscribePrice: '£6.99/mo',
    subscribePlan: 'Club / Business',
    benefits: [
      'Create & manage clubs',
      'Club announcements',
      'Event ticketing',
      'Analytics dashboard',
      'Everything in Pro Driver',
    ],
  },
};

const PaywallModal = ({ open, onClose, reason, creditsRemaining = 0, onPaymentResult }: PaywallModalProps) => {
  const [processing, setProcessing] = useState<'per_item' | 'subscribe' | null>(null);

  if (!open) return null;

  const config = CONFIG[reason];
  const hasPerItem = !!config.perItemPrice;

  const simulatePayment = async (method: 'per_item' | 'subscribe', success: boolean) => {
    setProcessing(method);
    await new Promise(r => setTimeout(r, 800));
    setProcessing(null);

    if (success) {
      toast.success(method === 'subscribe'
        ? `Subscribed to ${config.subscribePlan}!`
        : 'Payment successful!');
      onPaymentResult(true, method);
    } else {
      toast.error('Payment failed — please try again.');
      onPaymentResult(false, method);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-md mx-auto border border-border/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted z-10">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="p-6 pt-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Crown className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{config.title}</h2>
            {creditsRemaining === 0 && hasPerItem && (
              <p className="text-sm text-muted-foreground mt-1">You have 0 credits remaining</p>
            )}
          </div>

          <div className="space-y-3">
            {/* Per-item option */}
            {hasPerItem && (
              <div className="bg-muted/30 rounded-2xl border border-border/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{config.perItemLabel}</p>
                    <p className="text-2xl font-bold text-foreground">{config.perItemPrice}</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => simulatePayment('per_item', true)}
                    disabled={!!processing}
                    className="flex-1 h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                  >
                    {processing === 'per_item' ? 'Processing…' : 'Pay Now (Success)'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => simulatePayment('per_item', false)}
                    disabled={!!processing}
                    className="h-10 rounded-xl text-xs px-3"
                  >
                    Fail
                  </Button>
                </div>
              </div>
            )}

            {/* Divider */}
            {hasPerItem && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground font-medium">OR</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            )}

            {/* Subscribe option */}
            <div className="bg-primary/5 rounded-2xl border-2 border-primary/30 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold text-primary">Recommended</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Subscribe to {config.subscribePlan}</p>
                  <p className="text-2xl font-bold text-foreground">{config.subscribePrice}</p>
                </div>
              </div>
              <ul className="space-y-1.5 mb-4">
                {config.benefits.map(b => (
                  <li key={b} className="flex items-center gap-2 text-xs text-foreground/80">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button
                  onClick={() => simulatePayment('subscribe', true)}
                  disabled={!!processing}
                  className="flex-1 h-10 rounded-xl"
                >
                  {processing === 'subscribe' ? 'Processing…' : 'Subscribe (Success)'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => simulatePayment('subscribe', false)}
                  disabled={!!processing}
                  className="h-10 rounded-xl text-xs px-3"
                >
                  Fail
                </Button>
              </div>
            </div>
          </div>

          {/* Trust markers */}
          <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-border/30">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" />
              Secure payment
            </div>
            <div className="text-[10px] text-muted-foreground">Cancel anytime</div>
            <div className="text-[10px] text-muted-foreground">Instant access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
