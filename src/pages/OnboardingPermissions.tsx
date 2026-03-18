import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

const OnboardingPermissions = () => {
  const navigate = useNavigate();
  const { setOnboardingStep } = useAuth();
  const [step, setStep] = useState<'intro' | 'permissions' | 'notifications'>('intro');
  const [locationGranted, setLocationGranted] = useState(false);

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

  const handleNotifications = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        toast.success('Notifications enabled');
      }
    }
    setOnboardingStep(4);
    navigate('/onboarding/referral');
  };

  if (step === 'intro') {
    return (
      <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
        <div className="px-6 pt-8 safe-top">
          <div className="flex items-center gap-3 mb-2">
            <BackButton fallbackPath="/onboarding/interests" />
            <div className="flex-1">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-black/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="text-7xl mb-6">📍</div>
          <h1 className="text-2xl font-bold text-black leading-tight mb-3">
            Now let's set up your{'\n'}location & notifications!
          </h1>
          <p className="text-sm text-black/50 max-w-[280px]">
            We'll need a few permissions to show you nearby meets, routes and services
          </p>
        </div>

        <div className="px-6 pb-10 safe-bottom">
          <Button onClick={() => setStep('permissions')} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
            Let's do it! <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'permissions') {
    return (
      <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
        <div className="px-6 pt-8 safe-top">
          <div className="flex items-center gap-3 mb-2">
            <BackButton fallbackPath="/onboarding/interests" />
            <div className="flex-1">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-black/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-8">
          <h1 className="text-2xl font-bold text-black text-center mb-2">Enable Location</h1>
          <p className="text-sm text-black/50 text-center mb-10">
            We NEED this permission to show you nearby events, routes and services
          </p>

          <div className="space-y-3">
            <button
              onClick={grantLocation}
              className={`w-full py-4 px-5 rounded-2xl text-sm font-semibold text-center transition-all ${
                locationGranted
                  ? 'bg-primary text-white'
                  : 'bg-white text-black border border-black/10'
              }`}
            >
              {locationGranted ? (
                <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Location Enabled</span>
              ) : (
                "Enable Location - Select 'Allow'"
              )}
            </button>
          </div>
        </div>

        <div className="px-6 pb-10 safe-bottom">
          <Button
            onClick={() => setStep('notifications')}
            className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10"
          >
            Next <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Notifications step
  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/interests" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-black/10'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <h1 className="text-2xl font-bold text-black mb-2">Stay in the Loop</h1>
        <p className="text-sm text-black/50 mb-8 max-w-[280px]">
          Get notified about nearby meets, club updates and important alerts
        </p>
        <div className="text-7xl mb-4">🔔</div>
      </div>

      <div className="px-6 pb-10 safe-bottom">
        <Button onClick={handleNotifications} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          Enable Notifications
        </Button>
        <button
          onClick={() => {
            setOnboardingStep(4);
            navigate('/onboarding/referral');
          }}
          className="w-full text-sm text-black/50 mt-3 py-1"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default OnboardingPermissions;
