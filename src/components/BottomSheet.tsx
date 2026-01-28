import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
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
      case 'events': return 'Nearby Events';
      case 'routes': return 'Popular Routes';
      case 'services': return 'Services Near You';
      default: return 'Discover';
    }
  };

  const renderContent = () => {
    const items = isExpanded ? undefined : 2;

    if (activeCategory === 'events' || !activeCategory) {
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

    // Default: show mix
    return (
      <>
        {mockEvents.slice(0, 1).map((event) => (
          <EventCard 
            key={event.id} 
            event={event}
            onClick={() => onItemClick('event', event.id)}
          />
        ))}
        {mockRoutes.slice(0, 1).map((route) => (
          <RouteCard 
            key={route.id} 
            route={route}
            onClick={() => onItemClick('route', route.id)}
          />
        ))}
      </>
    );
  };

  return (
    <div 
      ref={sheetRef}
      className={`bottom-sheet fixed left-0 right-0 transition-all duration-300 ease-out z-30 ${
        isExpanded ? 'bottom-0 h-[70vh]' : 'bottom-0 h-auto max-h-[45vh]'
      }`}
    >
      {/* Handle */}
      <button 
        onClick={onToggle}
        className="w-full flex flex-col items-center pt-3 pb-2"
      >
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mb-2" />
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
        <h2 className="text-lg font-semibold text-foreground mb-3">{getTitle()}</h2>
        <div className={`space-y-3 ${isExpanded ? 'overflow-y-auto max-h-[55vh]' : ''}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
