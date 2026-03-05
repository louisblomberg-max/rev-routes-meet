import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';

const CATEGORIES = [
  {
    id: 'events',
    label: 'Events & Drives',
    items: ['Meets', 'Cars & Coffee', 'Track Days', 'Drive-outs', 'Shows'],
    color: 'bg-events/15 text-events',
    activeColor: 'bg-events text-events-foreground',
  },
  {
    id: 'routes',
    label: 'Routes',
    items: ['Scenic', 'Twisties', 'Coastal', 'Off-road', 'Track'],
    color: 'bg-routes/15 text-routes',
    activeColor: 'bg-routes text-routes-foreground',
  },
  {
    id: 'services',
    label: 'Services',
    items: ['Mechanics', 'Detailing', 'Tuning', 'Tyres', 'MOT', 'Parts'],
    color: 'bg-services/15 text-services',
    activeColor: 'bg-services text-services-foreground',
  },
  {
    id: 'clubs',
    label: 'Clubs & Community',
    items: ['Clubs & Community'],
    color: 'bg-clubs/15 text-clubs',
    activeColor: 'bg-clubs text-clubs-foreground',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    items: ['Marketplace'],
    color: 'bg-amber-500/15 text-amber-600',
    activeColor: 'bg-amber-500 text-white',
  },
];

const OnboardingInterests = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (val: string) => {
    setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const handleContinue = () => {
    const events = CATEGORIES[0].items.filter(i => selected.includes(i));
    const routes = CATEGORIES[1].items.filter(i => selected.includes(i));
    const services = CATEGORIES[2].items.filter(i => selected.includes(i));
    const clubs = selected.includes('Clubs & Community');
    const marketplace = selected.includes('Marketplace');
    updateProfile({ interests: { events, routes, services, clubs, marketplace } } as any);
    setOnboardingStep(2);
    navigate('/onboarding/vehicle');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/auth/signup" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 1 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">What are you into?</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Select all that interest you — we'll personalise your feed
        </p>

        {CATEGORIES.map(cat => (
          <div key={cat.id} className="mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">{cat.label}</h3>
            <div className="flex flex-wrap gap-2">
              {cat.items.map(item => (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  className={`py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                    selected.includes(item) ? cat.activeColor + ' shadow-md' : cat.color
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button onClick={handleContinue} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          {selected.length} selected · You can change this anytime
        </p>
      </div>
    </div>
  );
};

export default OnboardingInterests;
