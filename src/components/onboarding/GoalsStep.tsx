import { ChevronRight, Calendar, Route, Users, ShoppingBag, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, SETUP_STEPS } from '@/contexts/OnboardingContext';

const GOALS = [
  { id: 'discover_events', label: 'Discover events', icon: Calendar },
  { id: 'find_routes', label: 'Find driving routes', icon: Route },
  { id: 'meet_people', label: 'Meet people / join clubs', icon: Users },
  { id: 'buy_sell', label: 'Buy & sell cars/parts', icon: ShoppingBag },
  { id: 'get_services', label: 'Get help & services', icon: Wrench },
];

const GoalsStep = () => {
  const { data, updateData, next, back, step } = useOnboarding();
  const setupIdx = step - 6;

  const toggle = (id: string) => {
    const goals = data.goals.includes(id)
      ? data.goals.filter(g => g !== id)
      : [...data.goals, id];
    updateData({ goals });
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-6 pt-10 safe-top">
        <div className="flex gap-1">
          {Array.from({ length: SETUP_STEPS }).map((_, i) => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= setupIdx ? 'bg-primary' : 'bg-black/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-8 overflow-y-auto pb-32">
        <h1 className="text-3xl font-black tracking-tight text-center mb-2 animate-fade-up text-black">
          What do you want from RevNet?
        </h1>
        <p className="text-sm text-center mb-8 animate-fade-up text-black/60">
          Pick your priorities — we'll shape your experience around them.
        </p>

        <div className="space-y-2.5 max-w-sm mx-auto animate-fade-up">
          {GOALS.map(g => {
            const active = data.goals.includes(g.id);
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => toggle(g.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  active ? 'border-primary bg-white shadow-sm' : 'border-black/10 bg-white/80 hover:border-black/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-primary/10' : 'bg-black/5'}`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-black/40'}`} />
                </div>
                <p className={`text-sm font-semibold ${active ? 'text-black' : 'text-black/70'}`}>{g.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={next} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button onClick={back} className="w-full text-sm text-black/50 mt-2 py-2">Back</button>
      </div>
    </div>
  );
};

export default GoalsStep;
