import { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Home from './Home';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return <Home />;
};

export default Index;
