/**
 * DetailBottomSheet — draggable bottom sheet for map pin details.
 * Uses vaul Drawer for native-feeling drag.
 */

import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { RevEvent, RevRoute, RevService } from '@/models';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const userId = authUser?.id;

  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<string[]>([]);
  const [savedServices, setSavedServices] = useState<string[]>([]);

  useEffect(() => {
    if (!item || !userId) return;
    const fetchSaved = async () => {
      if (item.type === 'event') {
        const { data } = await supabase.from('saved_events').select('event_id').eq('user_id', userId).eq('event_id', item.data.id).maybeSingle();
        setSavedEvents(data ? [item.data.id] : []);
      } else if (item.type === 'route') {
        const { data } = await supabase.from('saved_routes').select('route_id').eq('user_id', userId).eq('route_id', item.data.id).maybeSingle();
        setSavedRoutes(data ? [item.data.id] : []);
      } else if (item.type === 'service') {
        const { data } = await supabase.from('saved_services').select('service_id').eq('user_id', userId).eq('service_id', item.data.id).maybeSingle();
        setSavedServices(data ? [item.data.id] : []);
      }
    };
    fetchSaved();
  }, [item, userId]);

  if (!item) return null;

  const handleNavigate = () => {
    const d = item.data;
    const lat = (d as any).lat;
    const lng = (d as any).lng;
    const title = 'title' in d ? (d as any).title : (d as any).name;
    const geometry = item.type === 'route' ? ((d as any).geometry || null) : null;

    if (lat != null && lng != null) {
      onClose();
      navigate('/navigation', {
        state: {
          destLat: lat,
          destLng: lng,
          destTitle: title,
          geometry,
        },
      });
    } else {
      toast.error('Location not available for this item');
    }
  };

  const handleViewFull = () => {
    const d = item.data;
    onViewFull(item.type, d.id);
  };

  const handleSaveEvent = async (eventId: string) => {
    if (!userId) return;
    if (savedEvents.includes(eventId)) {
      await supabase.from('saved_events').delete().eq('event_id', eventId).eq('user_id', userId);
      setSavedEvents([]);
      toast.success('Removed from saved');
    } else {
      await supabase.from('saved_events').insert({ event_id: eventId, user_id: userId });
      setSavedEvents([eventId]);
      toast.success('Event saved');
    }
  };

  const handleSaveRoute = async (routeId: string) => {
    if (!userId) return;
    if (savedRoutes.includes(routeId)) {
      await supabase.from('saved_routes').delete().eq('route_id', routeId).eq('user_id', userId);
      setSavedRoutes([]);
      toast.success('Removed from saved');
    } else {
      await supabase.from('saved_routes').insert({ route_id: routeId, user_id: userId });
      setSavedRoutes([routeId]);
      toast.success('Route saved');
    }
  };

  const handleSaveService = async (serviceId: string) => {
    if (!userId) return;
    if (savedServices.includes(serviceId)) {
      await supabase.from('saved_services').delete().eq('service_id', serviceId).eq('user_id', userId);
      setSavedServices([]);
      toast.success('Removed from saved');
    } else {
      await supabase.from('saved_services').insert({ service_id: serviceId, user_id: userId });
      setSavedServices([serviceId]);
      toast.success('Service saved');
    }
  };

  return (
    <Drawer open={!!item} onClose={onClose} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="max-h-[85vh] bg-card border-t border-border/50 rounded-t-2xl md:fixed md:left-4 md:top-4 md:bottom-4 md:right-auto md:w-[400px] md:max-h-none md:rounded-2xl md:rounded-t-2xl md:border md:border-border/50 md:shadow-2xl">
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="overflow-y-auto px-5 pb-6 max-h-[calc(85vh-24px)] md:max-h-full md:pt-12">
          {item.type === 'event' && (
            <EventDetailContent
              event={item.data}
              onNavigate={handleNavigate}
              isSaved={savedEvents.includes(item.data.id)}
              onToggleSave={() => handleSaveEvent(item.data.id)}
            />
          )}
          {item.type === 'route' && (
            <RouteDetailContent
              route={item.data}
              onNavigate={handleNavigate}
              onViewFull={handleViewFull}
              onClose={onClose}
              isSaved={savedRoutes.includes(item.data.id)}
              onToggleSave={() => handleSaveRoute(item.data.id)}
            />
          )}
          {item.type === 'service' && (
            <ServiceDetailContent
              service={item.data}
              onNavigate={handleNavigate}
              onViewFull={handleViewFull}
              isSaved={savedServices.includes(item.data.id)}
              onToggleSave={() => handleSaveService(item.data.id)}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailBottomSheet;
