/**
 * useMapItems — Fetches map pins directly from Supabase via get_pins_in_bounds RPC.
 * Syncs pins into MapContext whenever viewport or categories change.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMap, type MapPin } from '@/contexts/MapContext';
import { supabase } from '@/integrations/supabase/client';

// Normalize RPC type names ('event'→'events', 'route'→'routes', 'service'→'services')
const normalizeType = (t: string): string => {
  if (t === 'event') return 'events';
  if (t === 'route') return 'routes';
  if (t === 'service') return 'services';
  return t;
};

export function useMapItems() {
  const { viewport, setPins, setIsLoadingPins } = useMap();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastFetchRef = useRef<string>('');

  const fetchPins = useCallback(async (bounds: NonNullable<typeof viewport>) => {
    // Deduplicate identical fetches
    const key = `${bounds.north.toFixed(4)},${bounds.south.toFixed(4)},${bounds.east.toFixed(4)},${bounds.west.toFixed(4)}`;
    if (key === lastFetchRef.current) return;
    lastFetchRef.current = key;

    setIsLoadingPins(true);
    try {
      const { data, error } = await supabase.rpc('get_pins_in_bounds', {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
        categories: ['events', 'routes', 'services'],
      });

      if (error) {
        console.error('[useMapItems] RPC error:', error);
        return;
      }

      if (data) {
        const pins: MapPin[] = data.map((pin: any) => {
          const pinData = typeof pin.data === 'string' ? JSON.parse(pin.data) : (pin.data || {});
          return {
            id: pin.id,
            type: normalizeType(pin.type),
            lat: Number(pin.lat),
            lng: Number(pin.lng),
            title: pin.title,
            // Spread RPC data fields for filtering
            ...pinData,
          };
        });
        setPins(pins);
      }
    } catch (err) {
      console.error('[useMapItems] Fetch error:', err);
    } finally {
      setIsLoadingPins(false);
    }
  }, [setPins, setIsLoadingPins]);

  // Fetch pins when viewport changes (debounced)
  useEffect(() => {
    if (!viewport) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPins(viewport);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [viewport, fetchPins]);
}
