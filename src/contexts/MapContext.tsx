import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapPin {
  id: string;
  type: string;
  lat: number;
  lng: number;
  title: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

interface MapContextType {
  viewport: ViewportBounds | null;
  setViewport: (bounds: ViewportBounds) => void;
  zoom: number;
  setZoom: (z: number) => void;
  pins: MapPin[];
  setPins: (pins: MapPin[]) => void;
  isLoadingPins: boolean;
  setIsLoadingPins: (v: boolean) => void;
  fetchPinsForViewport: (bounds: ViewportBounds, categories: string[]) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [viewport, setViewport] = useState<ViewportBounds | null>(null);
  const [zoom, setZoom] = useState(10);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [isLoadingPins, setIsLoadingPins] = useState(false);

  const fetchPinsForViewport = useCallback(async (bounds: ViewportBounds, categories: string[]) => {
    setIsLoadingPins(true);
    try {
      const { data, error } = await supabase.rpc('get_pins_in_bounds', {
        north: bounds.north,
        south: bounds.south,
        east: bounds.east,
        west: bounds.west,
        categories,
      });
      if (!error && data) {
        setPins(data.map((pin: any) => ({
          id: pin.id,
          type: pin.type,
          lat: Number(pin.lat),
          lng: Number(pin.lng),
          title: pin.title,
          data: pin.data,
          ...pin.data,
        })));
      }
    } catch {
      toast.error('Failed to load map pins');
    }
    setIsLoadingPins(false);
  }, []);

  return (
    <MapContext.Provider value={{
      viewport, setViewport,
      zoom, setZoom,
      pins, setPins,
      isLoadingPins, setIsLoadingPins,
      fetchPinsForViewport,
    }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error('useMap must be used within a MapProvider');
  return context;
};
