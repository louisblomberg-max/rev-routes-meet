import { MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, TOTAL_ONBOARDING_STEPS } from '@/contexts/OnboardingContext';

const EnableLocationStep = () => {
  const { next, back, updateData } = useOnboarding();

  const handleEnable = () => {
    if (!navigator.geolocation) {
      updateData({ locationPermissionStatus: 'skipped' });
      next();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        updateData({ locationPermissionStatus: 'allowed' });
        next();
      },
      () => {
        updateData({ locationPermissionStatus: 'denied' });
        next();
      },
      { timeout: 10000 }
    );
  };

  const handleSkip = () => {
    updateData({ locationPermissionStatus: 'skipped' });
    next();
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress */}
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_ONBOARDING_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all ${i <= 4 ? 'bg-primary' : 'bg-black/10'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <div className="w-28 h-28 rounded-3xl bg-white border border-black/10 flex items-center justify-center mb-8 shadow-sm">
          <MapPin className="w-14 h-14 text-black/80" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-center mb-3 animate-fade-up text-black">
          Enable Location
        </h1>
        <p className="text-sm text-center text-black/60 max-w-[280px] animate-fade-up">
          Allow location access to discover nearby events, routes, clubs and services.
        </p>
      </div>

      {/* Bottom CTAs */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button
          onClick={handleEnable}
          className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-black text-white hover:bg-black/90"
        >
          Enable Location <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={handleSkip} className="w-full text-sm text-black/50 mt-2 py-2">
          Skip for now
        </button>
        <p className="text-[11px] text-black/30 text-center mt-1">
          Location helps power Discovery and SOS features.
        </p>
        <button onClick={back} className="w-full text-sm text-black/50 mt-1 py-2">
          Back
        </button>
      </div>
    </div>
  );
};

export default EnableLocationStep;
