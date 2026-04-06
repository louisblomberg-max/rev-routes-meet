import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/BackButton';

const SOURCES = [
  'Instagram',
  'TikTok',
  'Facebook',
  'Reddit',
  'App Store',
  'Friend',
  'Car Meet / Show',
  'Other',
];

const OnboardingReferral = () => {
  const navigate = useNavigate();
  const { setOnboardingStep } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    setOnboardingStep(5);
    navigate('/');
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/onboarding/permissions" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 4 ? 'bg-primary' : 'bg-black/10'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-black text-center mb-1">How did you hear{'\n'}about RevNet?</h1>
        <p className="text-sm text-black/50 text-center mb-6">This helps us improve our outreach</p>

        <div className="space-y-2.5">
          {SOURCES.map(source => (
            <button
              key={source}
              onClick={() => setSelected(source === selected ? null : source)}
              className={`w-full py-4 px-5 rounded-2xl text-sm font-semibold text-center transition-all ${
                selected === source
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-black border border-black/10 hover:bg-white/80'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={handleContinue} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingReferral;
