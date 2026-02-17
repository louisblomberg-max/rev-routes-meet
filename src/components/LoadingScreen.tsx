import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import revnetLogo from '@/assets/revnet-logo-full.jpg';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-background flex items-center justify-center z-50 transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative">
        {/* Spinning Cog */}
        <div className="w-32 h-32 animate-spin-slow">
          <Settings 
            className="w-full h-full text-muted-foreground/30" 
            strokeWidth={1}
          />
        </div>
        
        {/* Static Logo in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={revnetLogo} 
            alt="RevNet" 
            className="w-16 h-16 object-contain rounded-lg"
          />
        </div>
      </div>
      
      {/* Subtle loading indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse-subtle" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse-subtle" style={{ animationDelay: '200ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse-subtle" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
