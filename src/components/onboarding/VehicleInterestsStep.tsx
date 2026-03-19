import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, SETUP_STEPS } from '@/contexts/OnboardingContext';

const VEHICLE_INTERESTS = [
  'JDM', 'Supercars', 'Classic Cars', 'Muscle Cars',
  'European', 'Motorcycles', '4x4 / Off-Road', 'Drift',
  'Stance / Modified', 'EV / Hybrid', 'American', 'Vintage',
];

const VehicleInterestsStep = () => {
  const { data, updateData, next, back, step } = useOnboarding();
  const setupIdx = step - 6;

  const toggle = (tag: string) => {
    const vi = data.vehicleInterests.includes(tag)
      ? data.vehicleInterests.filter(t => t !== tag)
      : [...data.vehicleInterests, tag];
    updateData({ vehicleInterests: vi });
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
          What are you into?
        </h1>
        <p className="text-sm text-center mb-8 animate-fade-up text-black/60">
          Select vehicle categories that interest you.
        </p>

        <div className="flex flex-wrap gap-2.5 justify-center animate-fade-up">
          {VEHICLE_INTERESTS.map(tag => {
            const active = data.vehicleInterests.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
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

        <p className="text-xs text-black/40 text-center mt-8">
          These help us recommend relevant events, clubs and content.
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

export default VehicleInterestsStep;
