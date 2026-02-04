import { MapPin } from 'lucide-react';
import { mockPins, mockEvents, mockRoutes, mockServices } from '@/data/mockData';
import { EventsFilterState } from '@/components/EventsFiltersPanel';
import { RoutesFilterState } from '@/components/RoutesFiltersPanel';
import { ServicesFilterState } from '@/components/ServicesFiltersPanel';

interface MapViewProps {
  activeCategories?: string[];
  activeCategory?: string | null;
  onPinClick?: (pin: typeof mockPins[0]) => void;
  selectedRouteId?: string | null;
  showEmptyPrompt?: boolean;
  isDimmed?: boolean;
  eventsFilters?: EventsFilterState;
  routesFilters?: RoutesFilterState;
  servicesFilters?: ServicesFilterState;
}

const MapView = ({ 
  activeCategories, 
  activeCategory, 
  onPinClick, 
  selectedRouteId, 
  showEmptyPrompt, 
  isDimmed,
  eventsFilters,
  routesFilters,
  servicesFilters,
}: MapViewProps) => {
  // Filter pins based on category and active filters
  const getFilteredPins = () => {
    if (isDimmed) return [];
    
    const categoryToFilter = activeCategories && activeCategories.length > 0 
      ? activeCategories 
      : activeCategory 
        ? [activeCategory] 
        : [];
    
    if (categoryToFilter.length === 0) return [];
    
    return mockPins.filter(pin => {
      // First check if pin's category is active
      if (!categoryToFilter.includes(pin.type)) return false;
      
      // Apply category-specific filters
      if (pin.type === 'events' && eventsFilters) {
        const event = mockEvents.find(e => e.id === pin.id);
        if (!event) return true;
        
        // Filter by event type
        if (eventsFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'meets': 'Meets',
            'cars-coffee': 'Cars & Coffee',
            'drive': 'Drive / Drive-Out',
            'group-drive': 'Group Drive',
            'track-day': 'Track Day',
            'show': 'Show / Exhibition',
          };
          const allowedTypes = eventsFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && !allowedTypes.includes(event.eventType)) {
            return false;
          }
        }
        
        // Filter by vehicle types
        if (eventsFilters.vehicleTypes.length > 0) {
          const vehicleTypeMapping: Record<string, string[]> = {
            'cars': ['All Welcome', 'Cars Only', 'European Cars', 'Classic Cars'],
            'motorcycles': ['All Welcome', 'Motorcycles Only'],
            'classic': ['Classic Cars', 'All Welcome'],
            'supercars': ['Supercars Only', 'European Cars', 'All Welcome'],
            'jdm': ['JDM Only', 'All Welcome'],
            'euro': ['European Cars', 'All Welcome'],
            'american': ['American Muscle', 'All Welcome'],
            'off-road': ['Off-road', 'All Welcome'],
          };
          const allowedVehicles = eventsFilters.vehicleTypes.flatMap(v => vehicleTypeMapping[v] || []);
          if (allowedVehicles.length > 0 && !allowedVehicles.includes(event.vehicleType)) {
            return false;
          }
        }
      }
      
      if (pin.type === 'routes' && routesFilters) {
        const route = mockRoutes.find(r => r.id === pin.id);
        if (!route) return true;
        
        // Filter by route type
        if (routesFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'scenic': 'Scenic',
            'coastal': 'Coastal',
            'off-road': 'Off-road',
            'twisties': 'Twisty',
            'urban': 'Urban',
            'track': 'Track',
            'mixed': 'Mixed',
          };
          const allowedTypes = routesFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && !allowedTypes.includes(route.type)) {
            return false;
          }
        }
        
        // Filter by minimum rating
        if (routesFilters.minRating && route.rating < routesFilters.minRating) {
          return false;
        }
      }
      
      if (pin.type === 'services' && servicesFilters) {
        const service = mockServices.find(s => s.id === pin.id);
        if (!service) return true;
        
        // Filter by service type
        if (servicesFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'mechanics': 'Mechanic',
            'detailing': 'Detailing',
            'parts': 'Parts',
            'tyres': 'Tyres',
            'mot': 'MOT',
            'tuning': 'Tuning',
            'bodywork': 'Bodywork',
            'car-wash': 'Car Wash',
            'fuel': 'Fuel',
            'ev-charging': 'EV Charging',
          };
          const allowedTypes = servicesFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && !allowedTypes.includes(service.category)) {
            return false;
          }
        }
        
        // Filter by minimum rating
        if (servicesFilters.minRating && service.rating < servicesFilters.minRating) {
          return false;
        }
        
        // Filter by open now
        if (servicesFilters.openNow && !service.isOpen) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredPins = getFilteredPins();

  const getPinColor = (type: string) => {
    switch (type) {
      case 'events': return 'bg-events';
      case 'routes': return 'bg-routes';
      case 'services': return 'bg-services';
      case 'clubs': return 'bg-clubs';
      default: return 'bg-muted-foreground';
    }
  };

  // Route polyline data (simplified for demo)
  const routePolylines: Record<string, { path: string; start: { x: number; y: number }; end: { x: number; y: number } }> = {
    '1': { 
      path: 'M 160 100 Q 200 150 180 200 T 220 280 T 280 320', 
      start: { x: 40, y: 25 }, 
      end: { x: 70, y: 80 } 
    },
    '2': { 
      path: 'M 300 240 Q 280 180 320 140 T 340 80', 
      start: { x: 75, y: 60 }, 
      end: { x: 85, y: 20 } 
    },
  };

  const selectedRoute = selectedRouteId ? routePolylines[selectedRouteId] : null;

  return (
    <div className={`absolute inset-0 bg-gradient-to-b from-muted/50 to-muted transition-all duration-300 ${isDimmed ? 'opacity-40' : ''}`}>
      {/* Map placeholder with grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Simulated roads */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
        <path 
          d="M 0 300 Q 200 280 400 350 T 800 300" 
          stroke="hsl(var(--foreground))" 
          strokeWidth="8" 
          fill="none"
        />
        <path 
          d="M 200 0 Q 180 200 250 400 T 200 800" 
          stroke="hsl(var(--foreground))" 
          strokeWidth="6" 
          fill="none"
        />
        <path 
          d="M 0 500 L 400 480" 
          stroke="hsl(var(--foreground))" 
          strokeWidth="4" 
          fill="none"
        />
      </svg>

      {/* Selected Route Polyline */}
      {selectedRoute && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {/* Route path glow */}
          <path 
            d={selectedRoute.path}
            stroke="hsl(var(--routes))" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          {/* Route path main */}
          <path 
            d={selectedRoute.path}
            stroke="hsl(var(--routes))" 
            strokeWidth="4" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 6"
            className="animate-pulse"
          />
          {/* Start point */}
          <circle 
            cx={selectedRoute.start.x * 4} 
            cy={selectedRoute.start.y * 4} 
            r="8" 
            fill="hsl(var(--routes))" 
            stroke="white"
            strokeWidth="3"
          />
          {/* End point */}
          <circle 
            cx={selectedRoute.end.x * 4} 
            cy={selectedRoute.end.y * 4} 
            r="8" 
            fill="hsl(var(--routes))" 
            stroke="white"
            strokeWidth="3"
          />
        </svg>
      )}

      {/* Current location indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-routes/20 animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-routes border-2 border-white shadow-lg" />
          </div>
        </div>
      </div>

      {/* Map pins */}
      {filteredPins.map((pin) => {
        const isSelected = selectedRouteId && pin.type === 'routes' && pin.id === selectedRouteId;
        
        return (
          <button
            key={pin.id}
            onClick={() => onPinClick?.(pin)}
            className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 hover:scale-110 active:scale-95 ${isSelected ? 'scale-125 z-20' : ''}`}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <div className={`${getPinColor(pin.type)} p-2 rounded-full shadow-lg ${isSelected ? 'ring-4 ring-routes/30' : ''}`}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className={`${getPinColor(pin.type)} w-2 h-2 rounded-full mx-auto -mt-1`} />
          </button>
        );
      })}

    </div>
  );
};

export default MapView;
