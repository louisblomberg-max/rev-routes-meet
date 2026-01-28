import { MapPin, Navigation } from 'lucide-react';
import { mockPins } from '@/data/mockData';

interface MapViewProps {
  activeCategory: string | null;
  onPinClick: (pin: typeof mockPins[0]) => void;
}

const MapView = ({ activeCategory, onPinClick }: MapViewProps) => {
  const filteredPins = activeCategory 
    ? mockPins.filter(pin => pin.type === activeCategory)
    : [];

  const getPinColor = (type: string) => {
    switch (type) {
      case 'events': return 'bg-events';
      case 'routes': return 'bg-routes';
      case 'services': return 'bg-services';
      case 'clubs': return 'bg-clubs';
      default: return 'bg-muted-foreground';
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted">
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

      {/* Current location indicator */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-routes/20 animate-ping" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-routes border-2 border-white shadow-lg" />
          </div>
        </div>
      </div>

      {/* Map pins - only show when category is selected */}
      {filteredPins.map((pin) => (
        <button
          key={pin.id}
          onClick={() => onPinClick(pin)}
          className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 hover:scale-110 active:scale-95 animate-scale-up"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <div className={`${getPinColor(pin.type)} p-2 rounded-full shadow-lg`}>
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className={`${getPinColor(pin.type)} w-2 h-2 rounded-full mx-auto -mt-1`} />
        </button>
      ))}

      {/* Guidance overlay when no category selected */}
      {!activeCategory && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center px-8 py-4 rounded-2xl bg-card/80 backdrop-blur-sm shadow-lg animate-fade-up">
            <p className="text-sm text-muted-foreground">
              Select a category above to see nearby pins
            </p>
          </div>
        </div>
      )}

      {/* Compass */}
      <button className="absolute top-24 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
        <Navigation className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
};

export default MapView;
