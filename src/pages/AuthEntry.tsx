import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import revnetLogo from '@/assets/revnet-logo-new.png';

const AuthEntry = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Decorative emoji */}
        <div className="text-7xl mb-2 animate-fade-up">🏎️</div>

        {/* Car enthusiast emojis */}
        <div className="flex items-center gap-4 mb-8 animate-fade-up">
          <span className="text-6xl">🧑‍🔧</span>
          <span className="text-6xl">👩‍🔧</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground leading-tight mb-3 animate-fade-up">
          Let's get started by setting{'\n'}up your driver profile!
        </h1>

        <img src={revnetLogo} alt="RevNet" className="h-7 w-auto opacity-30 mt-6" />
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10 safe-bottom space-y-4">
        <Button
          onClick={() => navigate('/auth/signup')}
          className="w-full h-14 text-base font-semibold rounded-full gap-2"
        >
          Let's do it!
          <ChevronRight className="w-5 h-5" />
        </Button>

        <div className="flex items-center justify-center gap-1">
          <span className="text-sm text-muted-foreground">Already have an account?</span>
          <button onClick={() => navigate('/auth/login')} className="text-sm text-primary font-semibold">
            Sign in
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/60 text-center">
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthEntry;
