import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EventsFilterState } from '@/components/EventsFiltersPanel';
import { RoutesFilterState } from '@/components/RoutesFiltersPanel';
import { ServicesFilterState } from '@/components/ServicesFiltersPanel';
import { MapStyle } from '@/components/MapStyleButton';
import { useMap, MapPin } from '@/contexts/MapContext';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

mapboxgl.accessToken = 'pk.eyJ1IjoicmV2bmV0LS1jbHViIiwiYSI6ImNtbTB0NXU4dDAyN3Qyb3BqaWVrOHE0cmEifQ.p7f7SJBFBuRK-lShWYjGpg';

const MAP_STYLE_URLS: Record<MapStyle, string> = {
  standard: 'mapbox://styles/mapbox/streets-v12',
  night: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
};

interface MapViewProps {
  activeCategories?: string[];
  activeCategory?: string | null;
  onPinClick?: (pin: MapPin) => void;
  selectedRouteId?: string | null;
  showEmptyPrompt?: boolean;
  isDimmed?: boolean;
  eventsFilters?: EventsFilterState;
  routesFilters?: RoutesFilterState;
  servicesFilters?: ServicesFilterState;
  mapStyle?: MapStyle;
  onMapReady?: (map: mapboxgl.Map) => void;
}

const PIN_COLORS: Record<string, string> = {
  events: '#ef4444',
  routes: '#3b82f6',
  services: '#059669',
  clubs: '#7c3aed',
};

const MapView = ({
  activeCategories,
  activeCategory,
  onPinClick,
  selectedRouteId,
  isDimmed,
  eventsFilters,
  routesFilters,
  servicesFilters,
  mapStyle = 'standard',
  onMapReady,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { pins, setPins, setViewport, setZoom: setMapZoom, fetchPinsForViewport } = useMap();

  // Subscribe to realtime pin changes
  useRealtimeSubscription({
    channel: 'pins',
    enabled: true,
    onInsert: (payload: unknown) => {
      const newPin = payload as MapPin;
      setPins([...pins, newPin]);
    },
    onUpdate: (payload: unknown) => {
      const updated = payload as MapPin;
      setPins(pins.map(p => p.id === updated.id ? updated : p));
    },
    onDelete: (payload: unknown) => {
      const deleted = payload as { id: string };
      setPins(pins.filter(p => p.id !== deleted.id));
    },
  });

  // Track viewport bounds on map move
  const handleViewportChange = useCallback(() => {
    if (!map.current) return;
    const bounds = map.current.getBounds();
    setViewport({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
    setMapZoom(map.current.getZoom());
  }, [setViewport, setMapZoom]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_URLS[mapStyle],
      center: [-1.8, 51.5], // Default UK center
      zoom: 10,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.current.on('load', () => {
      setMapLoaded(true);
      onMapReady?.(map.current!);
      handleViewportChange();
    });

    map.current.on('moveend', handleViewportChange);

    // Center on user location on first load
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 13,
          duration: 1500,
        });
      },
      () => {}, // silently fail
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(MAP_STYLE_URLS[mapStyle]);
  }, [mapStyle]);

  // Filter pins from context
  const getFilteredPins = useCallback((): MapPin[] => {
    if (isDimmed) return [];

    const categoryToFilter = activeCategories && activeCategories.length > 0
      ? activeCategories
      : activeCategory
        ? [activeCategory]
        : [];

    if (categoryToFilter.length === 0) return [];

    return pins.filter(pin => {
      if (!categoryToFilter.includes(pin.type)) return false;

      // Category-specific filtering using pin metadata
      if (pin.type === 'events' && eventsFilters) {
        if (eventsFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'meets': 'Meets', 'cars-coffee': 'Cars & Coffee', 'drive': 'Drive / Drive-Out',
            'group-drive': 'Group Drive', 'track-day': 'Track Day', 'show': 'Show / Exhibition',
          };
          const allowedTypes = eventsFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && pin.eventType && !allowedTypes.includes(pin.eventType as string)) return false;
        }
        if (eventsFilters.vehicleTypes.length > 0) {
          const vehicleTypeMapping: Record<string, string[]> = {
            'cars': ['All Welcome', 'Cars Only', 'European Cars', 'Classic Cars'],
            'motorcycles': ['All Welcome', 'Motorcycles Only'],
            'classic': ['Classic Cars', 'All Welcome'],
            'supercars': ['Supercars Only', 'European Cars', 'All Welcome'],
            'jdm': ['JDM Only', 'All Welcome'],
            'euro': ['European Cars', 'All Welcome'],
            'american': ['American Muscle', 'All Welcome'],
            'off-road': ['Off-road', 'All Welcome'],
          };
          const allowedVehicles = eventsFilters.vehicleTypes.flatMap(v => vehicleTypeMapping[v] || []);
          if (allowedVehicles.length > 0 && pin.vehicleType && !allowedVehicles.includes(pin.vehicleType as string)) return false;
        }
      }

      if (pin.type === 'routes' && routesFilters) {
        if (routesFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'scenic': 'Scenic', 'coastal': 'Coastal', 'off-road': 'Off-road',
            'twisties': 'Twisty', 'urban': 'Urban', 'track': 'Track', 'mixed': 'Mixed',
          };
          const allowedTypes = routesFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && pin.routeType && !allowedTypes.includes(pin.routeType as string)) return false;
        }
        if (routesFilters.minRating && typeof pin.rating === 'number' && pin.rating < routesFilters.minRating) return false;
      }

      if (pin.type === 'services' && servicesFilters) {
        if (servicesFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'mechanics': 'Mechanic', 'detailing': 'Detailing', 'parts': 'Parts',
            'tyres': 'Tyres', 'mot': 'MOT', 'tuning': 'Tuning', 'bodywork': 'Bodywork',
            'car-wash': 'Car Wash', 'fuel': 'Fuel', 'ev-charging': 'EV Charging',
          };
          const allowedTypes = servicesFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && pin.category && !allowedTypes.includes(pin.category as string)) return false;
        }
        if (servicesFilters.minRating && typeof pin.rating === 'number' && pin.rating < servicesFilters.minRating) return false;
        if (servicesFilters.openNow && !pin.isOpen) return false;
      }

      return true;
    });
  }, [pins, activeCategories, activeCategory, isDimmed, eventsFilters, routesFilters, servicesFilters]);

  // Update markers when filters/pins change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filteredPins = getFilteredPins();

    filteredPins.forEach(pin => {
      const lng = pin.lng;
      const lat = pin.lat;

      const el = document.createElement('div');
      el.className = 'mapbox-pin';
      el.style.cssText = `
        width: 32px; height: 32px; border-radius: 50%;
        background: ${PIN_COLORS[pin.type] || '#666'};
        border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer; transition: transform 0.2s;
        display: flex; align-items: center; justify-content: center;
      `;
      el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
      el.addEventListener('click', () => onPinClick?.(pin));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [activeCategories, activeCategory, isDimmed, eventsFilters, routesFilters, servicesFilters, mapLoaded, pins]);

  return (
    <div className={`absolute inset-0 transition-opacity duration-300 ${isDimmed ? 'opacity-40' : ''}`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default MapView;
