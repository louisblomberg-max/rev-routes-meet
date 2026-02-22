import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

  const fetchPinsForViewport = useCallback((_bounds: ViewportBounds, _categories: string[]) => {
    // Placeholder for backend geo-query
    // Will be replaced with Supabase RPC call: 
    // supabase.rpc('get_pins_in_bounds', { north, south, east, west, categories })
    setIsLoadingPins(true);
    setTimeout(() => {
      setPins([]); // No mock data - user-generated content only
      setIsLoadingPins(false);
    }, 100);
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
