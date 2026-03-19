import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, SETUP_STEPS } from '@/contexts/OnboardingContext';

const GROUPS = [
  {
    label: 'EVENTS',
    items: ['Car Meets', 'Drive-Outs', 'Track Days', 'Car Shows', 'Motorsport Events'],
    field: 'eventTypes' as const,
  },
  {
    label: 'ROUTES',
    items: ['Scenic Drives', 'Twisty Roads', 'Mountain Passes', 'Coastal Routes', 'Off-Road Trails'],
    field: 'routeTypes' as const,
  },
  {
    label: 'SERVICES',
    items: ['Mechanics', 'Detailing', 'Performance Tuning', 'Parts & Accessories', 'Tyres & Wheels'],
    field: 'serviceTypes' as const,
  },
  {
    label: 'COMMUNITY',
    items: ['Car Clubs', 'Motorcycle Groups', 'Local Meets', 'Online Discussions'],
    field: 'communityTypes' as const,
  },
];

const InterestsStep = () => {
  const { data, updateData, next, back, step } = useOnboarding();
  const setupIdx = step - 6;

  const toggle = (field: 'eventTypes' | 'routeTypes' | 'serviceTypes' | 'communityTypes', tag: string) => {
    const current = data[field];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    updateData({ [field]: updated });
    // Also keep legacy interests in sync
    const allSelected = [
      ...(field === 'eventTypes' ? updated : data.eventTypes),
      ...(field === 'routeTypes' ? updated : data.routeTypes),
      ...(field === 'serviceTypes' ? updated : data.serviceTypes),
      ...(field === 'communityTypes' ? updated : data.communityTypes),
    ];
    updateData({ interests: allSelected });
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
          Tailor Your RevNet Experience
        </h1>
        <p className="text-sm text-center mb-8 animate-fade-up text-black/60">
          Choose what you're into — we'll personalise events, routes, services and communities around you.
        </p>

        <div className="space-y-6 animate-fade-up">
          {GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[11px] font-bold tracking-widest text-black/40 mb-2.5">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map(tag => {
                  const active = data[group.field].includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggle(group.field, tag)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-black/10 text-black/60 bg-white hover:border-black/20'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-black/40 text-center mt-8">
          These preferences will influence recommendations throughout the app.
        </p>
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

export default InterestsStep;
