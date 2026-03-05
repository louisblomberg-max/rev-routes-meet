import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Bell, MapPin, Users, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth, type NotificationPrefs } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';

const NOTIFICATION_OPTIONS = [
  { key: 'newEventsNearby' as keyof NotificationPrefs, label: 'New events near you', desc: 'Meets, shows, track days nearby', icon: MapPin, recommended: false },
  { key: 'friendsNearby' as keyof NotificationPrefs, label: 'Friends & live location', desc: 'Nearby invites and group drives', icon: Users, recommended: false },
  { key: 'clubAnnouncements' as keyof NotificationPrefs, label: 'Club announcements', desc: 'Posts, events, member activity', icon: Users, recommended: false },
  { key: 'marketplaceMessages' as keyof NotificationPrefs, label: 'Marketplace messages', desc: 'Buy, sell & trade notifications', icon: ShoppingBag, recommended: false },
  { key: 'sosAlerts' as keyof NotificationPrefs, label: 'SOS / Help alerts', desc: 'Breakdown help & emergency alerts', icon: AlertTriangle, recommended: true },
];

const OnboardingNotifications = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    newEventsNearby: false,
    friendsNearby: false,
    clubAnnouncements: false,
    marketplaceMessages: false,
    sosAlerts: true,
  });

  const toggle = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = () => {
    updateProfile({ notificationPrefs: prefs } as any);
    setOnboardingStep(5);
    navigate('/onboarding/plan');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/location" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center mb-1">Notifications</h1>
          <p className="text-sm text-muted-foreground text-center max-w-[280px]">
            Step 5 of 6 — Choose what you want to hear about
          </p>
        </div>

        <div className="space-y-2">
          {NOTIFICATION_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <div key={opt.key} className="flex items-center gap-3 bg-card rounded-2xl border border-border/50 p-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                    {opt.recommended && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">REC</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </div>
                <Switch
                  checked={prefs[opt.key]}
                  onCheckedChange={() => toggle(opt.key)}
                />
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-5">
          You can change this anytime in Settings.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button onClick={handleContinue} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingNotifications;
