import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import revnetLogo from '@/assets/revnet-logo-full.jpg';

const OnboardingFinish = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();

  const handleGo = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full bg-primary" />
          ))}
        </div>
        <p className="text-caption mt-1.5">Step 5 of 5 — Done!</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-2xl bg-services/10 flex items-center justify-center mb-6 animate-scale-up">
          <CheckCircle className="w-12 h-12 text-services" />
        </div>
        <h1 className="heading-display text-foreground mb-3 animate-fade-up">You're all set!</h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-[300px] animate-fade-up">
          Welcome to RevNet. Discover events, routes, and services near you.
        </p>

        <img src={revnetLogo} alt="RevNet" className="h-8 w-auto mt-8 opacity-40" />
      </div>

      <div className="px-6 pb-10 safe-bottom">
        <Button onClick={handleGo} className="w-full h-12 text-base font-semibold gap-2">
          Go to Discovery
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFinish;
