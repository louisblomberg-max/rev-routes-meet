import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-sm p-5 ${className}`}>{children}</div>
);

const OnboardingPermissions = () => {
  const navigate = useNavigate();
  const { setOnboardingStep } = useAuth();
  const [locationGranted, setLocationGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);

  const grantLocation = async () => {
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      setLocationGranted(true);
      toast.success('Location access granted');
    } catch {
      toast.info('You can enable location later in Settings');
    }
  };

  const grantNotifications = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        setNotifGranted(true);
        toast.success('Notifications enabled');
      } else {
        toast.info('You can enable notifications later');
      }
    } else {
      toast.info('Not supported in this browser');
    }
  };

  const handleFinish = () => {
    setOnboardingStep(4);
    navigate('/onboarding/finish');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-caption mt-1.5">Step 4 of 5 — Permissions</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-5 overflow-y-auto pb-28">
        <div>
          <h1 className="heading-lg text-foreground mb-1">Almost there</h1>
          <p className="text-sm text-muted-foreground">A couple of permissions to get you the best experience</p>
        </div>

        {/* Location */}
        <SectionCard>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${locationGranted ? 'bg-services/10' : 'bg-primary/10'}`}>
              {locationGranted ? <Check className="w-6 h-6 text-services" /> : <MapPin className="w-6 h-6 text-primary" />}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-1">Location</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Needed to show you nearby meets, routes and services on the map.
              </p>
              {!locationGranted ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={grantLocation} className="h-9 text-xs font-semibold">Enable</Button>
                  <Button size="sm" variant="ghost" className="h-9 text-xs text-muted-foreground">Not now</Button>
                </div>
              ) : (
                <span className="text-xs font-semibold text-services">✓ Enabled</span>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notifGranted ? 'bg-services/10' : 'bg-primary/10'}`}>
              {notifGranted ? <Check className="w-6 h-6 text-services" /> : <Bell className="w-6 h-6 text-primary" />}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground mb-1">Notifications</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get alerts for events, club posts, and help requests.
              </p>
              {!notifGranted ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={grantNotifications} className="h-9 text-xs font-semibold">Enable</Button>
                  <Button size="sm" variant="ghost" className="h-9 text-xs text-muted-foreground">Not now</Button>
                </div>
              ) : (
                <span className="text-xs font-semibold text-services">✓ Enabled</span>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/30 px-6 py-4 safe-bottom">
        <Button onClick={handleFinish} className="w-full h-12 text-base font-semibold">
          Finish Setup
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPermissions;
