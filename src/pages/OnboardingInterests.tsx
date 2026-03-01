import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';

const EVENT_INTERESTS = ['Meets', 'Cars & Coffee', 'Track Days', 'Shows', 'Group Drives'];
const ROUTE_INTERESTS = ['Scenic', 'Twisties', 'Coastal', 'Off-road', 'Track'];
const SERVICE_INTERESTS = ['Mechanics', 'Detailing', 'Parts', 'Tyres', 'Tuning', 'MOT', 'EV Charging'];

const ALL_INTERESTS = [
  { category: 'Events', items: EVENT_INTERESTS },
  { category: 'Routes', items: ROUTE_INTERESTS },
  { category: 'Services', items: SERVICE_INTERESTS },
];

const OnboardingInterests = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (val: string) => {
    setSelected(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const handleContinue = () => {
    const events = EVENT_INTERESTS.filter(i => selected.includes(i));
    const routes = ROUTE_INTERESTS.filter(i => selected.includes(i));
    const services = SERVICE_INTERESTS.filter(i => selected.includes(i));
    updateProfile({ interests: { events, routes, services } } as any);
    setOnboardingStep(3);
    navigate('/onboarding/permissions');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/vehicle" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 2 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">What are you into?</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Select all that interest you</p>

        {ALL_INTERESTS.map(group => (
          <div key={group.category} className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{group.category}</h3>
            <div className="space-y-2">
              {group.items.map(item => (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  className={`w-full py-3.5 px-5 rounded-2xl text-sm font-semibold text-center transition-all ${
                    selected.includes(item)
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-foreground hover:bg-muted/80'
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
      </div>
    </div>
  );
};

export default OnboardingInterests;
