import { Calendar, Users, ShoppingBag, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useOnboarding } from '@/contexts/OnboardingContext';

const NOTIFICATION_OPTIONS = [
  { key: 'newEventsNearby' as const, label: 'New events near you', desc: 'Car meets, shows and track days', icon: Calendar },
  { key: 'clubActivity' as const, label: 'Club activity', desc: 'Posts, events and member updates', icon: Users },
  { key: 'marketplaceMessages' as const, label: 'Marketplace messages', desc: 'Buy, sell and trade alerts', icon: ShoppingBag },
  { key: 'nearbyDrivers' as const, label: 'Nearby drivers / friends', desc: 'Live location and drive invites', icon: MapPin },
  { key: 'sosAlerts' as const, label: 'SOS alerts', desc: 'Breakdown and emergency alerts', icon: AlertTriangle },
];

const NotificationsStep = () => {
  const { data, updateData, next, back } = useOnboarding();

  const toggle = (key: keyof typeof data.notifications) => {
    updateData({
      notifications: { ...data.notifications, [key]: !data.notifications[key] },
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= 3 ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto pb-32">
        <h1 className="text-3xl font-black text-foreground tracking-tight text-center mb-2 animate-fade-up">
          Stay Connected
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-8 animate-fade-up">
          Choose what notifications you'd like to receive.
        </p>

        <div className="space-y-2.5">
          {NOTIFICATION_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <div key={opt.key} className="flex items-center gap-3 bg-card rounded-2xl border border-border/50 p-4 animate-fade-up">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </div>
                <Switch
                  checked={data.notifications[opt.key]}
                  onCheckedChange={() => toggle(opt.key)}
                />
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground/50 text-center mt-6">
          You can change these anytime in Settings.
        </p>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button onClick={next} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={back} className="w-full text-sm text-muted-foreground mt-2 py-2">Back</button>
      </div>
    </div>
  );
};

export default NotificationsStep;
