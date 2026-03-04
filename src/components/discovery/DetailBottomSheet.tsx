/**
 * DetailBottomSheet — draggable bottom sheet for map pin details.
 * Uses vaul Drawer for native-feeling drag.
 */

import { Drawer, DrawerContent, DrawerOverlay } from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { RevEvent, RevRoute, RevService } from '@/models';
import { useNavigation } from '@/contexts/NavigationContext';
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
      });
    }
  };

  const handleViewFull = () => {
    const d = item.data;
    onViewFull(item.type, d.id);
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
              onViewFull={handleViewFull}
            />
          )}
          {item.type === 'route' && (
            <RouteDetailContent
              route={item.data}
              onNavigate={handleNavigate}
              onViewFull={handleViewFull}
            />
          )}
          {item.type === 'service' && (
            <ServiceDetailContent
              service={item.data}
              onNavigate={handleNavigate}
              onViewFull={handleViewFull}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailBottomSheet;
