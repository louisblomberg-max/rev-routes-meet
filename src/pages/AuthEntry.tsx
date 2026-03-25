import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import revnetLogo from '@/assets/revnet-logo-auth.png';

const AuthEntry = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen relative overflow-hidden flex flex-col" style={{ backgroundColor: '#f3f3e8', color: '#171717' }}>
      <div className="flex-1 flex flex-col items-center justify-start px-6 pt-16">
        <img src={revnetLogo} alt="RevNet" className="w-full h-auto" />
      </div>

      <div className="px-6 pb-8 safe-bottom space-y-3">
        <Button
          onClick={() => navigate('/auth/signup')}
          className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          Create account
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => navigate('/auth/login')}
          className="w-full h-14 text-base font-semibold rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
};

export default AuthEntry;
