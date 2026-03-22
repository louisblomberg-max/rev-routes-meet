import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !user.onboardingComplete) {
    if (!user.isVerified) {
      const dest = user.email || user.phone || '';
      return <Navigate to={`/auth/verify?dest=${encodeURIComponent(dest)}`} replace />;
    }
    const stepRoutes = [
      '/onboarding/features',
      '/onboarding/vehicle',
      '/onboarding/notifications',
    ];
    const step = Math.min(user.onboardingStep || 0, stepRoutes.length - 1);
    return <Navigate to={stepRoutes[step]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
