import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import revnetLogo from '@/assets/revnet-logo-new.png';

const OnboardingFinish = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const handleGo = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 h-1 rounded-full bg-primary" />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-7xl mb-6 animate-scale-up">🏁</div>
        <h1 className="text-2xl font-bold text-black mb-3 animate-fade-up">You're all set!</h1>
        <p className="text-black/50 text-base leading-relaxed max-w-[300px] animate-fade-up">
          Welcome to RevNet. Discover events, routes, and services near you.
        </p>
        <img src={revnetLogo} alt="RevNet" className="h-7 w-auto mt-8 opacity-30" />
      </div>

      <div className="px-6 pb-10 safe-bottom">
        <Button onClick={handleGo} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          Go to Discovery
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFinish;
