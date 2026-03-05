import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Users, Megaphone, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth, type NotificationPrefs } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';

const NOTIFICATION_OPTIONS = [
  { key: 'newEventsNearby' as keyof NotificationPrefs, label: 'New events near you', desc: 'Meets, shows and track days', icon: Calendar, defaultOn: true },
  { key: 'friendsNearby' as keyof NotificationPrefs, label: 'Friends & group drives', desc: 'Live location and drive invites', icon: Users, defaultOn: false },
  { key: 'clubAnnouncements' as keyof NotificationPrefs, label: 'Club announcements', desc: 'Posts, events and member updates', icon: Megaphone, defaultOn: false },
  { key: 'marketplaceMessages' as keyof NotificationPrefs, label: 'Marketplace messages', desc: 'Buy, sell and trade alerts', icon: ShoppingBag, defaultOn: false },
  { key: 'sosAlerts' as keyof NotificationPrefs, label: 'SOS / Help alerts', desc: 'Breakdown and emergency alerts', icon: AlertTriangle, defaultOn: true },
];

const OnboardingNotifications = () => {
  const navigate = useNavigate();
  const { updateProfile, completeOnboarding } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    newEventsNearby: true,
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
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/vehicle" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex-1 h-1 rounded-full bg-primary" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">Notifications</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Choose what you want to hear about.
        </p>

        <div className="space-y-2.5">
          {NOTIFICATION_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <div key={opt.key} className="flex items-center gap-3 bg-card rounded-2xl border border-border/50 p-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block">{opt.label}</span>
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
          Get Started <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingNotifications;
