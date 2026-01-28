import { useRef } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import EventCard from './cards/EventCard';
import RouteCard from './cards/RouteCard';
import ServiceCard from './cards/ServiceCard';
import { mockEvents, mockRoutes, mockServices } from '@/data/mockData';

interface BottomSheetProps {
  activeCategory: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick: (type: string, id: string) => void;
}

const BottomSheet = ({ activeCategory, isExpanded, onToggle, onItemClick }: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  const getTitle = () => {
    switch (activeCategory) {
      case 'events': return 'Nearby Meets & Events';
      case 'routes': return 'Nearby Routes';
      case 'services': return 'Nearby Services';
      default: return 'Discover';
    }
  };

  const hasActiveCategory = activeCategory !== null;

  const renderContent = () => {
    // Show guidance when no category selected
    if (!activeCategory) {
      return (
        <div className="text-center py-8 px-4">
          <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Select a category or search to explore nearby content
          </p>
        </div>
      );
    }

    const items = isExpanded ? undefined : 3;

    if (activeCategory === 'events') {
      return mockEvents.slice(0, items).map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          onClick={() => onItemClick('event', event.id)}
        />
      ));
    }

    if (activeCategory === 'routes') {
      return mockRoutes.slice(0, items).map((route) => (
        <RouteCard 
          key={route.id} 
          route={route}
          onClick={() => onItemClick('route', route.id)}
        />
      ));
    }

    if (activeCategory === 'services') {
      return mockServices.slice(0, items).map((service) => (
        <ServiceCard 
          key={service.id} 
          service={service}
          onClick={() => onItemClick('service', service.id)}
        />
      ));
    }

    return null;
  };

  return (
    <div 
      ref={sheetRef}
      className={`bottom-sheet fixed left-0 right-0 transition-all duration-300 ease-out z-30 ${
        isExpanded ? 'bottom-0 h-[70vh]' : 'bottom-0 h-auto min-h-[200px] max-h-[50vh]'
      }`}
    >
      {/* Enhanced Drag Handle */}
      <button 
        onClick={onToggle}
        className="w-full flex flex-col items-center pt-4 pb-3"
      >
        <div className="w-12 h-1.5 bg-muted-foreground/40 rounded-full mb-2" />
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          {isExpanded ? (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Collapse</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Expand</span>
            </>
          )}
        </div>
      </button>

      {/* Content */}
      <div className="px-4 pb-6">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-lg font-semibold text-foreground">{getTitle()}</h2>
        </div>
        {hasActiveCategory && (
          <p className="text-xs text-muted-foreground mb-3">Based on your current location</p>
        )}
        <div className={`space-y-3 ${isExpanded ? 'overflow-y-auto max-h-[55vh]' : ''}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
