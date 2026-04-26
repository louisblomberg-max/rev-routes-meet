import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bell, Navigation, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PermStep {
  id: string;
  icon: typeof MapPin;
  title: string;
  description: string;
  optional: boolean;
}

const steps: PermStep[] = [
  {
    id: 'location',
    icon: MapPin,
    title: 'Location Access',
    description: 'Show nearby events, routes, and services on the map.',
    optional: false,
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Get alerts for events, messages, and help requests.',
    optional: true,
  },
  {
    id: 'background',
    icon: Navigation,
    title: 'Background Location',
    description: 'Enable live location sharing for group drives and breakdowns.',
    optional: true,
  },
];

const Permissions = () => {
  const navigate = useNavigate();
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);

  const step = steps[current];
  const isLast = current === steps.length - 1;
  const Icon = step.icon;

  const grant = async () => {
    // Simulate permission request
    if (step.id === 'location') {
      try {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        setGranted(prev => new Set(prev).add(step.id));
        toast.success('Location access granted');
      } catch {
        toast.error('Location access denied — you can enable it later in Settings');
      }
    } else if (step.id === 'notifications') {
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        if (result === 'granted') {
          setGranted(prev => new Set(prev).add(step.id));
          toast.success('Notifications enabled');
        } else {
          toast.info('You can enable notifications later in Settings');
        }
      } else {
        toast.info('Notifications not supported in this browser');
      }
    } else {
      // Background location — just simulate
      setGranted(prev => new Set(prev).add(step.id));
      toast.success('Background location enabled');
    }

    if (isLast) {
      navigate('/onboarding');
    } else {
      setCurrent(c => c + 1);
    }
  };

  const skip = () => {
    if (isLast) {
      navigate('/onboarding');
    } else {
      setCurrent(c => c + 1);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-dvh flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-12 safe-top">
        <div className="flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${
              i < current ? 'bg-primary' : i === current ? 'bg-primary/60' : 'bg-muted'
            }`} />
          ))}
        </div>
        <p className="text-caption mt-3">Step {current + 1} of {steps.length}</p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className={`w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ${
          granted.has(step.id) ? 'bg-services/10' : ''
        }`}>
          {granted.has(step.id) ? (
            <Check className="w-10 h-10 text-services" />
          ) : (
            <Icon className="w-10 h-10 text-primary" />
          )}
        </div>
        <h2 className="heading-lg text-foreground mb-2">{step.title}</h2>
        <p className="text-muted-foreground text-sm max-w-[280px]">{step.description}</p>
        {step.optional && (
          <span className="inline-block mt-3 text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Optional
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-10 safe-bottom space-y-3">
        <Button onClick={grant} className="w-full h-12 text-base font-semibold gap-2">
          {granted.has(step.id) ? 'Continue' : `Allow ${step.title}`}
          <ChevronRight className="w-4 h-4" />
        </Button>
        {step.optional && (
          <button onClick={skip} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default Permissions;
