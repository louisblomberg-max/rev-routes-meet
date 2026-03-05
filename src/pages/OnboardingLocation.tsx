import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

const SCOPE_OPTIONS = [
  { id: 'local', label: 'Local', desc: 'Nearby only' },
  { id: 'national', label: 'National', desc: 'Whole country' },
  { id: 'continental', label: 'Continental', desc: 'Across borders' },
  { id: 'global', label: 'Global', desc: 'Worldwide' },
] as const;

const OnboardingLocation = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();
  const [step, setStep] = useState<'ask' | 'radius'>('ask');
  const [locationGranted, setLocationGranted] = useState(false);
  const [radius, setRadius] = useState(25);
  const [scope, setScope] = useState<string>('local');

  const grantLocation = async () => {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      setLocationGranted(true);
      updateProfile({
        locationCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      } as any);
      toast.success('Location access granted');
      setStep('radius');
    } catch {
      toast.info('You can enable location later in Settings');
      setStep('radius');
    }
  };

  const handleContinue = () => {
    updateProfile({
      discoveryRadiusMiles: radius,
      discoveryScope: scope as any,
    } as any);
    setOnboardingStep(4);
    navigate('/onboarding/notifications');
  };

  if (step === 'ask') {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col">
        <div className="px-6 pt-8 safe-top">
          <div className="flex items-center gap-3 mb-2">
            <BackButton fallbackPath="/onboarding/vehicle" />
            <div className="flex-1">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-scale-up">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight mb-3">
            Enable location
          </h1>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            To show nearby routes, events & services on your map
          </p>
        </div>

        <div className="px-6 pb-10 safe-bottom space-y-3">
          <Button onClick={grantLocation} className="w-full h-14 text-base font-semibold rounded-full gap-2">
            {locationGranted ? (
              <><Check className="w-5 h-5" /> Location enabled</>
            ) : (
              <>Allow Location <ChevronRight className="w-5 h-5" /></>
            )}
          </Button>
          <button
            onClick={() => setStep('radius')}
            className="w-full text-sm text-muted-foreground py-1"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/vehicle" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">Discovery distance</h1>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Step 4 of 6 — How far do you want to explore?
        </p>

        {/* Radius slider */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">Default radius</span>
            <span className="text-lg font-bold text-primary">{radius} mi</span>
          </div>
          <Slider
            value={[radius]}
            onValueChange={([v]) => setRadius(v)}
            min={1}
            max={50}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1 mile</span>
            <span>50 miles</span>
          </div>
        </div>

        {/* Scope quick options */}
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Or choose a scope</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {SCOPE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setScope(opt.id)}
              className={`py-3.5 px-4 rounded-2xl text-left transition-all ${
                scope === opt.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-foreground'
              }`}
            >
              <span className="text-sm font-bold block">{opt.label}</span>
              <span className={`text-[11px] ${scope === opt.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{opt.desc}</span>
            </button>
          ))}
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

export default OnboardingLocation;
