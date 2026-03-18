import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, MapPin, Wrench, Users, ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';

const INTERESTS = [
  { id: 'events', label: 'Events & Meets', desc: 'Car meets, shows and drive-outs', icon: Calendar },
  { id: 'routes', label: 'Driving Routes', desc: 'Scenic roads and touring routes', icon: MapPin },
  { id: 'services', label: 'Services', desc: 'Garages, mechanics and specialists', icon: Wrench },
  { id: 'clubs', label: 'Clubs', desc: 'Communities and groups', icon: Users },
  { id: 'marketplace', label: 'Marketplace', desc: 'Buy and sell vehicles or parts', icon: ShoppingBag },
];

const OnboardingInterests = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const handleContinue = () => {
    updateProfile({
      interests: {
        events: selected.includes('events') ? ['Meets', 'Cars & Coffee', 'Track Days', 'Drive-outs', 'Shows'] : [],
        routes: selected.includes('routes') ? ['Scenic', 'Twisties', 'Coastal', 'Off-road', 'Track'] : [],
        services: selected.includes('services') ? ['Mechanics', 'Detailing', 'Tuning', 'Tyres', 'MOT', 'Parts'] : [],
        clubs: selected.includes('clubs'),
        marketplace: selected.includes('marketplace'),
      },
    } as any);
    setOnboardingStep(2);
    navigate('/onboarding/vehicle');
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/features" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 1 ? 'bg-primary' : 'bg-black/10'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-black text-center mb-1">What would you like to discover?</h1>
        <p className="text-sm text-black/50 text-center mb-6">
          Choose what you want to see in your feed.
        </p>

        <div className="space-y-2.5">
          {INTERESTS.map(item => {
            const Icon = item.icon;
            const active = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all flex items-center gap-3 ${
                  active
                    ? 'border-primary bg-white shadow-md'
                    : 'border-black/10 bg-white hover:border-black/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  active ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-black/50'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-black">{item.label}</h3>
                  <p className="text-xs text-black/50">{item.desc}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  active ? 'border-primary bg-primary' : 'border-black/20'
                }`}>
                  {active && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={handleContinue} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <p className="text-center text-xs text-black/40 mt-2">
          {selected.length} selected · You can change this anytime
        </p>
      </div>
    </div>
  );
};

export default OnboardingInterests;
