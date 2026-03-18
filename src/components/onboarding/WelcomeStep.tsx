import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/contexts/OnboardingContext';
import revnetLogo from '@/assets/revnet-logo-new.png';

const WelcomeStep = () => {
  const { next } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="animate-fade-up">
          <img src={revnetLogo} alt="RevNet" className="h-14 w-auto mb-10 mx-auto brightness-0 invert" />
        </div>

        <h1 className="text-4xl font-black text-foreground tracking-tight leading-[1.1] mb-3 animate-fade-up">
          ​
        </h1>
        <p className="text-base font-medium text-foreground/70 mb-2 animate-fade-up">
          ​
        </p>
        

        
      </div>

      {/* Actions */}
      <div className="px-6 pb-8 safe-bottom space-y-3">
        <Button
          onClick={next}
          className="w-full h-14 text-base font-semibold rounded-full gap-2">
          
          Create Account
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/auth/login')}
          className="w-full h-14 text-base font-semibold rounded-full border-border/50 text-foreground hover:bg-accent">
          
          Sign In
        </Button>

        <div className="flex items-center gap-3 pt-1">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <Button
          variant="outline"
          className="w-full h-12 rounded-full text-sm font-medium border-border/50 text-foreground hover:bg-accent"
          onClick={next}>
          
          <svg className="w-5 h-5 mr-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
          Continue with Apple
        </Button>

        <Button
          variant="outline"
          className="w-full h-12 rounded-full text-sm font-medium border-border/50 text-foreground hover:bg-accent"
          onClick={next}>
          
          <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
          Continue with Google
        </Button>
      </div>
    </div>);

};

export default WelcomeStep;