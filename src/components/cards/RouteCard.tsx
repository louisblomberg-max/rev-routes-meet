import { Route, Ruler, Car, Bike, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RouteData {
  id: string;
  name: string;
  distance: string;
  type: string;
  vehicleType: 'car' | 'bike' | 'both';
  rating: number;
}

interface RouteCardProps {
  route: RouteData;
  onClick: () => void;
}

const RouteCard = ({ route, onClick }: RouteCardProps) => {
  const getRouteTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Scenic': 'bg-routes-light text-routes',
      'Twisty': 'bg-events-light text-events',
      'Mixed': 'bg-services-light text-services',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <div 
      className="content-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{route.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRouteTypeBadge(route.type)}`}>
              {route.type}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Ruler className="w-4 h-4 text-routes" />
              <span>{route.distance}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {route.vehicleType === 'bike' ? (
                <Bike className="w-4 h-4" />
              ) : route.vehicleType === 'car' ? (
                <Car className="w-4 h-4" />
              ) : (
                <>
                  <Car className="w-4 h-4" />
                  <Bike className="w-4 h-4" />
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-services">★</span>
              <span className="text-muted-foreground">{route.rating}</span>
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          variant="outline"
          className="flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Bookmark className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RouteCard;
