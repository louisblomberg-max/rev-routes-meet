/**
 * useMapItems — Bridges DataContext (events/routes/services) → MapContext pins.
 * Runs whenever repo data changes and syncs pins into MapContext.
 * Supabase-ready: replace this hook's data source with RPC calls later.
 */

import { useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useMap, type MapPin } from '@/contexts/MapContext';

export function useMapItems() {
  const { state } = useData();
  const { setPins } = useMap();

  const pins = useMemo<MapPin[]>(() => {
    const result: MapPin[] = [];

    // Events with valid lat/lng
    for (const ev of state.events) {
      if (ev.lat != null && ev.lng != null) {
        result.push({
          id: ev.id,
          type: 'events',
          lat: ev.lat,
          lng: ev.lng,
          title: ev.title,
          eventType: ev.eventType,
          vehicleType: ev.vehicleTypes?.[0] || ev.vehicleType,
          date: ev.date,
          location: ev.location,
          attendees: ev.attendees,
          createdBy: ev.createdBy,
          visibility: ev.visibility,
        });
      }
    }

    // Routes with valid lat/lng (start point)
    for (const rt of state.routes) {
      if (rt.lat != null && rt.lng != null) {
        result.push({
          id: rt.id,
          type: 'routes',
          lat: rt.lat,
          lng: rt.lng,
          title: rt.name,
          routeType: rt.type,
          rating: rt.rating,
          distance: rt.distance,
          vehicleType: rt.vehicleType,
          createdBy: rt.createdBy,
          visibility: rt.visibility,
        });
      }
    }

    // Services with valid lat/lng
    for (const svc of state.services) {
      if (svc.lat != null && svc.lng != null) {
        result.push({
          id: svc.id,
          type: 'services',
          lat: svc.lat,
          lng: svc.lng,
          title: svc.name,
          category: svc.category,
          rating: svc.rating,
          isOpen: svc.isOpen,
          address: svc.address,
          distance: svc.distance,
          createdBy: svc.createdBy,
          visibility: svc.visibility,
        });
      }
    }

    return result;
  }, [state.events, state.routes, state.services]);

  // Sync to MapContext
  useEffect(() => {
    setPins(pins);
  }, [pins, setPins]);

  return pins;
}
