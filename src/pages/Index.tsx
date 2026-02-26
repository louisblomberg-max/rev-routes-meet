import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import Home from './Home';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if we've already shown the loading screen this session
  const [isLoading, setIsLoading] = useState(() => {
    return sessionStorage.getItem('revnet-loaded') !== 'true';
  });

  const handleLoadingComplete = () => {
    sessionStorage.setItem('revnet-loaded', 'true');
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Auth gate: not logged in → auth entry
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Onboarding gate: logged in but not onboarded
  if (user && !user.onboardingComplete) {
    // If not verified yet, send to verify
    if (!user.isVerified) {
      const dest = user.email || user.phone || '';
      return <Navigate to={`/auth/verify?dest=${encodeURIComponent(dest)}`} replace />;
    }
    // Otherwise resume onboarding at the right step
    const stepRoutes = [
      '/onboarding/profile',
      '/onboarding/vehicle',
      '/onboarding/interests',
      '/onboarding/permissions',
      '/onboarding/finish',
    ];
    const step = Math.min(user.onboardingStep || 0, stepRoutes.length - 1);
    return <Navigate to={stepRoutes[step]} replace />;
  }

  return <Home />;
};

export default Index;
