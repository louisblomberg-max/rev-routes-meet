import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Home from './Home';

const Index = () => {
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

  return <Home />;
};

export default Index;