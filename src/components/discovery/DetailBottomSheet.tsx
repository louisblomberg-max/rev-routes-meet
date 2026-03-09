/**
 * DetailBottomSheet — draggable bottom sheet for map pin details.
 * Uses vaul Drawer for native-feeling drag.
 */

import { Drawer, DrawerContent, DrawerOverlay } from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { RevEvent, RevRoute, RevService } from '@/models';
import { useNavigation } from '@/contexts/NavigationContext';
import { useData } from '@/contexts/DataContext';
import EventDetailContent from './EventDetailContent';
import RouteDetailContent from './RouteDetailContent';
import ServiceDetailContent from './ServiceDetailContent';

export type DetailItem =
  | { type: 'event'; data: RevEvent }
  | { type: 'route'; data: RevRoute }
  | { type: 'service'; data: RevService };

interface DetailBottomSheetProps {
  item: DetailItem | null;
  onClose: () => void;
  onViewFull: (type: string, id: string) => void;
}

const DetailBottomSheet = ({ item, onClose, onViewFull }: DetailBottomSheetProps) => {
  const { startNavigation } = useNavigation();
  const { events: eventsRepo, routes: routesRepo, services: servicesRepo, state } = useData();

  if (!item) return null;

  const handleNavigate = async () => {
    const d = item.data;
    const lat = (d as any).lat;
    const lng = (d as any).lng;
    if (lat != null && lng != null) {
      await startNavigation({
        lat,
        lng,
        title: 'title' in d ? (d as any).title : (d as any).name,
        itemType: item.type === 'event' ? 'events' : item.type === 'route' ? 'routes' : 'services',
      });
    }
  };

  const handleViewFull = () => {
    const d = item.data;
    onViewFull(item.type, d.id);
  };

  const handleSaveEvent = (eventId: string) => {
    if (state.savedEvents.includes(eventId)) {
      eventsRepo.unsaveEvent('user-1', eventId);
    } else {
      eventsRepo.saveEvent('user-1', eventId);
    }
  };

  const handleSaveRoute = (routeId: string) => {
    if (state.savedRoutes.includes(routeId)) {
      routesRepo.unsaveRoute('user-1', routeId);
    } else {
      routesRepo.saveRoute('user-1', routeId);
    }
  };

  const handleSaveService = (serviceId: string) => {
    if (state.savedServices.includes(serviceId)) {
      servicesRepo.unsaveService('user-1', serviceId);
    } else {
      servicesRepo.saveService('user-1', serviceId);
    }
  };

  return (
    <Drawer open={!!item} onClose={onClose} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerOverlay className="bg-black/20" />
      <DrawerContent className="max-h-[85vh] bg-card border-t border-border/50 rounded-t-2xl">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-6 max-h-[calc(85vh-24px)]">
          {item.type === 'event' && (
            <EventDetailContent
              event={item.data}
              onNavigate={handleNavigate}
              isSaved={state.savedEvents.includes(item.data.id)}
              onToggleSave={() => handleSaveEvent(item.data.id)}
            />
          )}
          {item.type === 'route' && (
            <RouteDetailContent
              route={item.data}
              onNavigate={handleNavigate}
              onViewFull={handleViewFull}
              isSaved={state.savedRoutes.includes(item.data.id)}
              onToggleSave={() => handleSaveRoute(item.data.id)}
            />
          )}
          {item.type === 'service' && (
            <ServiceDetailContent
              service={item.data}
              onNavigate={handleNavigate}
              onViewFull={handleViewFull}
              isSaved={state.savedServices.includes(item.data.id)}
              onToggleSave={() => handleSaveService(item.data.id)}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailBottomSheet;
