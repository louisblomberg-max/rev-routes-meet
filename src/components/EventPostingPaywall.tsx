import { Crown, CreditCard, Star, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerOverlay } from '@/components/ui/drawer';

interface EventPostingPaywallProps {
  open: boolean;
  onClose: () => void;
  onPayPerEvent: () => void;
  onUpgrade: () => void;
}

const EventPostingPaywall = ({ open, onClose, onPayPerEvent, onUpgrade }: EventPostingPaywallProps) => {
  return (
    <Drawer open={open} onClose={onClose} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerOverlay className="bg-black/40" />
      <DrawerContent className="bg-card border-t border-border/50 rounded-t-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        <div className="px-5 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Post Your Event</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            You've used your free event post. Choose how to continue:
          </p>

          {/* Option A: Pay per event */}
          <button
            onClick={onPayPerEvent}
            className="w-full text-left bg-muted/30 rounded-2xl border border-border/50 p-4 hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Post this event — £2.99 one time</p>
                <p className="text-[11px] text-muted-foreground">Your event stays live for 30 days.</p>
              </div>
            </div>
            <Button className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 mt-2">
              Pay £2.99
            </Button>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground font-medium">OR</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Option B: Upgrade to Pro */}
          <button
            onClick={onUpgrade}
            className="w-full text-left bg-primary/5 rounded-2xl border-2 border-primary/30 p-4 hover:border-primary/50 transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Unlimited events — £3.99/month</p>
                <p className="text-[11px] text-muted-foreground">Post unlimited events plus all Pro features.</p>
              </div>
            </div>
            <Button className="w-full h-10 rounded-xl mt-2">
              <Crown className="w-4 h-4 mr-1.5" />
              Upgrade to Pro
            </Button>
          </button>

          {/* Trust + Already Pro */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure payment</span>
              <span>Cancel anytime</span>
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              Already a Pro member? Sign in to your Pro account.
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EventPostingPaywall;
