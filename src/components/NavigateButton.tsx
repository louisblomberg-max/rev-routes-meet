/**
 * Reusable Navigate button pair for detail pages.
 * Triggers Mapbox Directions navigation + offers external maps fallback.
 */

import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';
import { openExternalMaps, NavigationDestination } from '@/services/navigationService';
import { Button } from '@/components/ui/button';
import { Navigation, ExternalLink, Loader2 } from 'lucide-react';

interface NavigateButtonProps {
  destination: NavigationDestination;
  colorClass?: string;
}

const NavigateButton = ({ destination, colorClass = 'bg-routes hover:bg-routes/90' }: NavigateButtonProps) => {
  const routerNavigate = useRouterNavigate();
  const { startNavigation, status } = useNavigation();
  const isLoading = status === 'loading';

  const handleNavigate = async () => {
    await startNavigation(destination);
    // Go to home/discovery so user sees the map
    routerNavigate('/');
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleNavigate}
        disabled={isLoading}
        className={`flex-1 py-6 text-lg gap-2 ${colorClass} text-white`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Navigation className="w-5 h-5" />
        )}
        {isLoading ? 'Getting route...' : 'Navigate'}
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
