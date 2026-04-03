import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapStyle } from '@/components/MapStyleButton';


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MAP_STYLE_URLS: Record<MapStyle, string> = {
  standard: 'mapbox://styles/mapbox/streets-v12',
  night: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

interface MapViewProps {
  onMapTap?: (lngLat: { lng: number; lat: number }) => void;
  mapStyle?: MapStyle;
  onMapReady?: (map: mapboxgl.Map) => void;
  onMoveEnd?: () => void;
  isDimmed?: boolean;
}

const MapView = ({
  onMapTap,
  mapStyle = 'standard',
  onMapReady,
  onMoveEnd,
  isDimmed,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const onMapTapRef = useRef(onMapTap);
  onMapTapRef.current = onMapTap;
  const onMoveEndRef = useRef(onMoveEnd);
  onMoveEndRef.current = onMoveEnd;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_URLS[mapStyle],
      center: [-1.5, 52.5],
      zoom: 6,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.current.on('load', () => {
      setMapLoaded(true);
      onMapReady?.(map.current!);
    });

    map.current.on('moveend', () => {
      onMoveEndRef.current?.();
    });

    // General map click — fires for non-pin taps
    map.current.on('click', (e) => {
      onMapTapRef.current?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserLocation(loc);
        map.current?.flyTo({ center: loc, zoom: 13, duration: 1500 });
      },
      () => {
        toast('Location unavailable', { description: 'Enable location services to see your position on the map.' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    try { map.current.getStyle(); } catch { return; }
    map.current.setStyle(MAP_STYLE_URLS[mapStyle]);
    map.current.once('style.load', () => {
      setMapLoaded(true);
    });
  }, [mapStyle]);

  // User location blue dot
  useEffect(() => {
    if (!map.current || !userLocation) return;
    userMarkerRef.current?.remove();
    const el = document.createElement('div');
    el.style.cssText = `
      width: 18px; height: 18px; border-radius: 50%;
      background: #4285F4; border: 3px solid white;
      box-shadow: 0 0 0 2px rgba(66,133,244,0.3), 0 2px 6px rgba(0,0,0,0.3);
    `;
    userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat(userLocation)
      .addTo(map.current);
  }, [userLocation, mapLoaded]);

  return (
    <div className={`absolute inset-0 transition-opacity duration-300 ${isDimmed ? 'opacity-40' : ''}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
