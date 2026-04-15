/**
 * Reusable Navigate button pair for detail pages.
 * - Desktop: hidden (navigation is mobile-only)
 * - Native app: navigates to /navigation with destination state
 * - Mobile web: prompts to open app, with fallback to in-browser navigation
 */

import { useState, useEffect } from 'react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { openExternalMaps, NavigationDestination } from '@/services/navigationService';
import { Button } from '@/components/ui/button';
import { Navigation, ExternalLink, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface NavigateButtonProps {
  destination: NavigationDestination;
  colorClass?: string;
}

const NavigateButton = ({ destination, colorClass = 'bg-routes hover:bg-routes/90' }: NavigateButtonProps) => {
  const routerNavigate = useRouterNavigate();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  if (isDesktop) return null;

  let isNativeApp = false;
  try {
    const Capacitor = (window as any).Capacitor;
    isNativeApp = Capacitor?.isNativePlatform?.() ?? false;
  } catch { /* not native */ }

  const navState = {
    destLat: destination.lat,
    destLng: destination.lng,
    destTitle: destination.title,
  };

  const handleNavigate = () => {
    routerNavigate('/navigation', { state: navState });
  };

  const handleMobileWebNavigate = () => {
    toast('For the best experience, use the RevNet app', {
      duration: 8000,
      action: {
        label: 'Navigate anyway',
        onClick: handleNavigate,
      },
    });
    // Try deep link — falls back silently if app not installed
    const deepLink = `revnet://navigate?lat=${destination.lat}&lng=${destination.lng}&title=${encodeURIComponent(destination.title)}`;
    window.location.href = deepLink;
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={isNativeApp ? handleNavigate : handleMobileWebNavigate}
        className={`flex-1 py-6 text-lg gap-2 ${colorClass} text-white`}
      >
        {isNativeApp ? (
          <Navigation className="w-5 h-5" />
        ) : (
          <Smartphone className="w-5 h-5" />
        )}
        Navigate
      </Button>
      <Button
        onClick={() => openExternalMaps(destination)}
        variant="outline"
        className="py-6 px-4"
      >
        <ExternalLink className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default NavigateButton;
