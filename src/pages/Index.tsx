import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import Home from './Home';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

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

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !user.onboardingComplete) {
    if (!user.isVerified) {
      const dest = user.email || user.phone || '';
      return <Navigate to={`/auth/verify?dest=${encodeURIComponent(dest)}`} replace />;
    }
    const stepRoutes = [
      '/onboarding/features',       // step 0
      '/onboarding/vehicle',        // step 1
      '/onboarding/notifications',  // step 2
    ];
    const step = Math.min(user.onboardingStep || 0, stepRoutes.length - 1);
    return <Navigate to={stepRoutes[step]} replace />;
  }

  return <Home />;
};

export default Index;
