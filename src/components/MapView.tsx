import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { EventsFilterState } from '@/components/EventsFiltersPanel';
import { RoutesFilterState } from '@/components/RoutesFiltersPanel';
import { ServicesFilterState } from '@/components/ServicesFiltersPanel';
import { MapStyle } from '@/components/MapStyleButton';
import { useMap, MapPin } from '@/contexts/MapContext';

if (!import.meta.env.VITE_MAPBOX_TOKEN) {
  console.error('VITE_MAPBOX_TOKEN environment variable is not set');
}
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
}


const MapView = ({
  activeCategories,
  activeCategory,
  onPinClick,
  onMapTap,
  selectedRouteId,
  isDimmed,
  markerOpacity = 1,
  eventsFilters,
  routesFilters,
  servicesFilters,
  mapStyle = 'standard',
  onMapReady,
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const layersAdded = useRef(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { pins, setPins, setViewport, setZoom: setMapZoom } = useMap();
  const onMapTapRef = useRef(onMapTap);
  onMapTapRef.current = onMapTap;

  useRealtimeSubscription({ table: 'events', enabled: true });
  useRealtimeSubscription({ table: 'routes', enabled: true });
  useRealtimeSubscription({ table: 'services', enabled: true });

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

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_URLS[mapStyle],
      center: [-1.8, 51.5],
      zoom: 10,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

    map.current.on('load', () => {
      setMapLoaded(true);
      layersAdded.current = false;
      onMapReady?.(map.current!);
      handleViewportChange();
    });

    map.current.on('moveend', handleViewportChange);

    // Click handler for GeoJSON layers
    for (const layerId of LAYER_IDS) {
      map.current.on('click', layerId, (e) => {
        if (!e.features?.length) return;
        const props = e.features[0].properties;
        if (!props) return;
        const geom = e.features[0].geometry as GeoJSON.Point;
        const pin: MapPin = {
          id: props.id,
          type: props.type,
          lat: geom.coordinates[1],
          lng: geom.coordinates[0],
          title: props.title,
        };
        for (const [k, v] of Object.entries(props)) {
          if (!['id', 'type', 'lat', 'lng', 'title'].includes(k)) {
            try { pin[k] = JSON.parse(v as string); } catch { pin[k] = v; }
          }
        }
        onPinClick?.(pin);
      });

      map.current.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }

    // General map click — fires for non-pin taps
    map.current.on('click', (e) => {
      if (!map.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [...LAYER_IDS],
      });
      if (features.length > 0) return; // clicked a pin, ignore
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
      layersAdded.current = false;
      setMapLoaded(prev => !prev);
      setTimeout(() => setMapLoaded(true), 50);
    });
  }, [mapStyle]);

  // Filter pins
  const getFilteredPins = useCallback((): MapPin[] => {
    if (isDimmed) return [];

    const categoryToFilter = activeCategories && activeCategories.length > 0
      ? activeCategories
      : activeCategory
        ? [activeCategory]
        : [];

    if (categoryToFilter.length === 0) return pins;

    return pins.filter(pin => {
      if (!categoryToFilter.includes(pin.type)) return false;

      if (pin.type === 'events' && eventsFilters) {
        if (eventsFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'meets': 'meets', 'shows': 'shows', 'drive': 'drive',
            'track-day': 'track_day', 'motorsport': 'motorsport', 'autojumble': 'autojumble', 'off-road': 'off_road',
          };
          const allowedTypes = eventsFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && pin.eventType && !allowedTypes.includes(pin.eventType as string)) return false;
        }
        if (eventsFilters.vehicleTypes.length > 0) {
          const pinVType = pin.vehicleType as string;
          if (pinVType !== 'all' && !eventsFilters.vehicleTypes.includes(pinVType)) return false;
        }
        if (eventsFilters.vehicleBrands.length > 0) {
          const pinBrands = (pin.vehicleBrands as string[] || []).map(b => b.toLowerCase());
          const hasMatch = eventsFilters.vehicleBrands.some(fb => pinBrands.includes(fb.toLowerCase()));
          if (!hasMatch) return false;
        }
        if (eventsFilters.vehicleCategories.length > 0) {
          const pinCategories = pin.vehicleCategories as string[] || [];
          const hasMatch = eventsFilters.vehicleCategories.some(fc => pinCategories.includes(fc));
          if (!hasMatch) return false;
        }
        if (eventsFilters.vehicleAges.length > 0) {
          const pinAge = pin.vehicleAge as string;
          const pinAges = pin.vehicleAges as string[] || [];
          const allAges = pinAges.length > 0 ? pinAges : (pinAge ? [pinAge] : []);
          const hasMatch = eventsFilters.vehicleAges.some(fa => allAges.includes(fa));
          if (!hasMatch) return false;
        }
        if (eventsFilters.eventSize) {
          const maxAtt = typeof pin.maxAttendees === 'number' ? pin.maxAttendees : 0;
          if (eventsFilters.eventSize === 'small' && maxAtt >= 20) return false;
          if (eventsFilters.eventSize === 'medium' && (maxAtt < 20 || maxAtt > 50)) return false;
          if (eventsFilters.eventSize === 'large' && (maxAtt < 50 || maxAtt > 100)) return false;
          if (eventsFilters.eventSize === 'massive' && maxAtt < 100) return false;
        }
        if (eventsFilters.entryFee) {
          const feeType = pin.entryFeeType as string;
          if (eventsFilters.entryFee === 'free' && feeType !== 'free') return false;
          if (eventsFilters.entryFee === 'paid' && feeType !== 'paid') return false;
        }
        if (eventsFilters.clubHosted) {
          if (pin.visibility !== 'club' && !(pin as any).clubId) return false;
        }
        if (eventsFilters.dateFilter) {
          const startDateStr = pin.startDate as string;
          const pinDate = startDateStr ? new Date(startDateStr) : null;
          if (pinDate && !isNaN(pinDate.getTime())) {
            const now = new Date();
            if (eventsFilters.dateFilter === 'today' && !isSameDay(pinDate, now)) return false;
            if (eventsFilters.dateFilter === 'this-week') {
              const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
              if (pinDate < now || pinDate > weekEnd) return false;
            }
            if (eventsFilters.dateFilter === 'this-month') {
              if (pinDate.getMonth() !== now.getMonth() || pinDate.getFullYear() !== now.getFullYear()) return false;
            }
          } else if (eventsFilters.dateFilter !== 'specific') {
            return false;
          }
        }
        if (eventsFilters.dateFilter === 'specific' && eventsFilters.specificDate) {
          const startDateStr = pin.startDate as string;
          const pinDate = startDateStr ? new Date(startDateStr) : null;
          if (!pinDate || !isSameDay(pinDate, eventsFilters.specificDate)) return false;
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
        if (routesFilters.difficulty.length > 0) {
          const pinDifficulty = pin.difficulty as string | undefined;
          if (pinDifficulty && !routesFilters.difficulty.includes(pinDifficulty)) return false;
          if (!pinDifficulty) return false;
        }
        if (routesFilters.surface.length > 0) {
          const surfaceMapping: Record<string, string> = {
            'paved': 'tarmac', 'gravel': 'gravel', 'dirt': 'dirt', 'mixed': 'mixed',
          };
          const allowedSurfaces = routesFilters.surface.map(s => surfaceMapping[s]).filter(Boolean);
          const pinSurface = pin.surfaceType as string | undefined;
          if (pinSurface && !allowedSurfaces.includes(pinSurface)) return false;
          if (!pinSurface) return false;
        }
        if (routesFilters.duration) {
          const mins = typeof pin.durationMinutes === 'number' ? pin.durationMinutes : null;
          if (mins != null) {
            if (routesFilters.duration === 'under-1h' && mins >= 60) return false;
            if (routesFilters.duration === '1-2h' && (mins < 60 || mins > 120)) return false;
            if (routesFilters.duration === '2-4h' && (mins < 120 || mins > 240)) return false;
            if (routesFilters.duration === 'over-4h' && mins < 240) return false;
          } else {
            return false;
          }
        }
      }

      if (pin.type === 'services' && servicesFilters) {
        if (servicesFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'mechanics': 'Mechanic', 'detailing': 'Detailing', 'parts': 'Parts',
            'tyres': 'Tyres', 'mot': 'MOT', 'tuning': 'Tuning', 'bodywork': 'Bodywork',
            'car-wash': 'Car Wash', 'ev-charging': 'EV Charging',
            'accessories': 'Accessories', 'wheels': 'Wheels', 'glass-repair': 'Glass Repair',
            'fuel-petrol': 'Fuel & Petrol',
          };
          const allowedTypes = servicesFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && pin.category && !allowedTypes.includes(pin.category as string)) return false;
        }
        if (servicesFilters.openNow && !pin.isOpen) return false;
      }

      return true;
    });
  }, [pins, activeCategories, activeCategory, isDimmed, eventsFilters, routesFilters, servicesFilters]);

  // Update GeoJSON source
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (!layersAdded.current) {
      addSourceAndLayers(map.current);
      layersAdded.current = true;
    }

    const source = map.current.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const filtered = getFilteredPins();
    const geojson = buildGeoJSON(filtered);
    source.setData(geojson);

    for (const layerId of LAYER_IDS) {
      if (map.current.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, 'circle-opacity', markerOpacity);
        map.current.setPaintProperty(layerId, 'circle-stroke-opacity', markerOpacity);
      }
    }
  }, [activeCategories, activeCategory, isDimmed, eventsFilters, routesFilters, servicesFilters, mapLoaded, pins, markerOpacity, getFilteredPins]);

  // Layer visibility
  useEffect(() => {
    if (!map.current || !mapLoaded || !layersAdded.current) return;

    const categoryToFilter = activeCategories && activeCategories.length > 0
      ? activeCategories
      : activeCategory
        ? [activeCategory]
        : [];

    const typeToLayer: Record<string, string> = {
      events: 'events-layer',
      routes: 'routes-layer',
      services: 'services-layer',
      clubs: 'clubs-layer',
    };

    for (const [type, layerId] of Object.entries(typeToLayer)) {
      if (map.current.getLayer(layerId)) {
        const visible = categoryToFilter.length === 0 || categoryToFilter.includes(type);
        map.current.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    }
  }, [activeCategories, activeCategory, mapLoaded]);

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
