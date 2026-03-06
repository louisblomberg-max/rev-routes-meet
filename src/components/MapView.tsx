import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
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

const PIN_COLORS: Record<string, string> = {
  events: '#E53935',
  routes: '#5B8DEF',
  services: '#D4A24C',
  clubs: '#9B72CF',
};

interface MapViewProps {
  activeCategories?: string[];
  activeCategory?: string | null;
  onPinClick?: (pin: MapPin) => void;
  selectedRouteId?: string | null;
  showEmptyPrompt?: boolean;
  isDimmed?: boolean;
  markerOpacity?: number;
  eventsFilters?: EventsFilterState;
  routesFilters?: RoutesFilterState;
  servicesFilters?: ServicesFilterState;
  mapStyle?: MapStyle;
  onMapReady?: (map: mapboxgl.Map) => void;
}

// ── Helpers ──

/** Parse display dates like 'Sat, Mar 15 • 10:00 AM' into a Date object */
function parseDisplayDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Remove day name prefix and bullet separator: "Sat, Mar 15 • 10:00 AM" → "Mar 15 10:00 AM"
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '').replace(/\s*•\s*/, ' ');
  // Try parsing with current year
  const withYear = `${cleaned} ${new Date().getFullYear()}`;
  const parsed = new Date(withYear);
  if (!isNaN(parsed.getTime())) return parsed;
  // Fallback: try raw
  const raw = new Date(dateStr);
  return isNaN(raw.getTime()) ? null : raw;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function buildGeoJSON(pins: MapPin[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: pins.map(pin => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [pin.lng, pin.lat] },
      properties: {
        id: pin.id,
        type: pin.type,
        title: pin.title,
        // pass through extra props for click handler lookup
        ...Object.fromEntries(
          Object.entries(pin).filter(([k]) => !['lat', 'lng'].includes(k))
        ),
      },
    })),
  };
}

const SOURCE_ID = 'map-items';
const LAYER_IDS = ['events-layer', 'routes-layer', 'services-layer', 'clubs-layer'] as const;

function addSourceAndLayers(map: mapboxgl.Map) {
  if (map.getSource(SOURCE_ID)) return; // already added

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  // Create colored pin icons for each category using canvas
  const createPinIcon = (color: string, id: string) => {
    const size = 48;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size + 12;
    const ctx = canvas.getContext('2d')!;

    // Drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // Pin body (teardrop)
    ctx.beginPath();
    ctx.moveTo(size / 2, size + 4);
    ctx.bezierCurveTo(size / 2 - 2, size - 6, 4, size / 2 + 4, 4, size / 2 - 4);
    ctx.arc(size / 2, size / 2 - 4, size / 2 - 4, Math.PI, 0, false);
    ctx.bezierCurveTo(size - 4, size / 2 + 4, size / 2 + 2, size - 6, size / 2, size + 4);
    ctx.closePath();

    ctx.fillStyle = '#1C1C1E';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner dot
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2 - 4, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (!map.hasImage(id)) {
      map.addImage(id, imageData, { pixelRatio: 2 });
    }
  };

  createPinIcon(PIN_COLORS.events, 'pin-events');
  createPinIcon(PIN_COLORS.routes, 'pin-routes');
  createPinIcon(PIN_COLORS.services, 'pin-services');
  createPinIcon(PIN_COLORS.clubs, 'pin-clubs');

  // Symbol layers with pin icons
  const pinLayer = (id: string, type: string, iconImage: string): mapboxgl.SymbolLayerSpecification => ({
    id,
    type: 'symbol' as const,
    source: SOURCE_ID,
    filter: ['==', ['get', 'type'], type],
    layout: {
      'icon-image': iconImage,
      'icon-size': 0.8,
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-opacity': 0.95,
    },
  });

  map.addLayer(pinLayer('events-layer', 'events', 'pin-events'));
  map.addLayer(pinLayer('routes-layer', 'routes', 'pin-routes'));
  map.addLayer(pinLayer('services-layer', 'services', 'pin-services'));
  map.addLayer(pinLayer('clubs-layer', 'clubs', 'pin-clubs'));
}

const MapView = ({
  activeCategories,
  activeCategory,
  onPinClick,
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

  // Subscribe to realtime pin changes (Supabase-ready)
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

  // ── Initialize map ──
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
      layersAdded.current = false; // will be added on next render cycle
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
        // Reconstruct the pin from properties
        const geom = e.features[0].geometry as GeoJSON.Point;
        const pin: MapPin = {
          id: props.id,
          type: props.type,
          lat: geom.coordinates[1],
          lng: geom.coordinates[0],
          title: props.title,
        };
        // Copy extra properties
        for (const [k, v] of Object.entries(props)) {
          if (!['id', 'type', 'lat', 'lng', 'title'].includes(k)) {
            try { pin[k] = JSON.parse(v as string); } catch { pin[k] = v; }
          }
        }
        onPinClick?.(pin);
      });

      // Pointer cursor on hover
      map.current.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }

    // Center on user location on first load
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

  // ── Update map style ──
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const currentStyle = map.current.getStyle()?.name;
    // Only set if actually changed
    map.current.setStyle(MAP_STYLE_URLS[mapStyle]);
    // After style change, re-add layers
    map.current.once('style.load', () => {
      layersAdded.current = false;
      // Trigger a re-render to re-add source+layers
      setMapLoaded(prev => !prev);
      setTimeout(() => setMapLoaded(true), 50);
    });
  }, [mapStyle]);

  // ── Filter pins ──
  const getFilteredPins = useCallback((): MapPin[] => {
    if (isDimmed) return [];

    const categoryToFilter = activeCategories && activeCategories.length > 0
      ? activeCategories
      : activeCategory
        ? [activeCategory]
        : [];

    if (categoryToFilter.length === 0) return pins; // show all when no category selected

    return pins.filter(pin => {
      if (!categoryToFilter.includes(pin.type)) return false;

      if (pin.type === 'events' && eventsFilters) {
        if (eventsFilters.types.length > 0) {
          const typeMapping: Record<string, string> = {
            'meets': 'Meets', 'cars-coffee': 'Cars & Coffee', 'drive': 'Drive / Drive-Out',
            'group-drive': 'Group Drive', 'track-day': 'Track Day', 'show': 'Show / Exhibition',
          };
          const allowedTypes = eventsFilters.types.map(t => typeMapping[t]).filter(Boolean);
          if (allowedTypes.length > 0 && pin.eventType && !allowedTypes.includes(pin.eventType as string)) return false;
        }
        if (eventsFilters.vehicleTypes.length > 0 && !eventsFilters.vehicleTypes.includes('all-vehicles')) {
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
        // Event size filter
        if (eventsFilters.eventSize) {
          const attendees = typeof pin.attendees === 'number' ? pin.attendees : 0;
          if (eventsFilters.eventSize === 'small' && attendees >= 20) return false;
          if (eventsFilters.eventSize === 'medium' && (attendees < 20 || attendees > 50)) return false;
          if (eventsFilters.eventSize === 'large' && (attendees < 50 || attendees > 100)) return false;
          if (eventsFilters.eventSize === 'massive' && attendees < 100) return false;
        }
        // Entry fee filter
        if (eventsFilters.entryFee) {
          const fee = (pin as any).entryFee;
          if (eventsFilters.entryFee === 'free' && fee && fee !== 'Free' && fee !== '£0') return false;
          if (eventsFilters.entryFee === 'paid' && (!fee || fee === 'Free' || fee === '£0')) return false;
        }
        // Club hosted filter
        if (eventsFilters.clubHosted) {
          if (!(pin as any).clubId) return false;
        }
        // Date filter
        if (eventsFilters.dateFilter && eventsFilters.dateFilter !== 'specific') {
          const pinDate = pin.date ? parseDisplayDate(pin.date as string) : null;
          if (pinDate) {
            const now = new Date();
            if (eventsFilters.dateFilter === 'today' && !isSameDay(pinDate, now)) return false;
            if (eventsFilters.dateFilter === 'this-week') {
              const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
              if (pinDate < now || pinDate > weekEnd) return false;
            }
            if (eventsFilters.dateFilter === 'this-month') {
              if (pinDate.getMonth() !== now.getMonth() || pinDate.getFullYear() !== now.getFullYear()) return false;
            }
          }
        }
        if (eventsFilters.dateFilter === 'specific' && eventsFilters.specificDate) {
          const pinDate = pin.date ? parseDisplayDate(pin.date as string) : null;
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
        // Difficulty filter
        if (routesFilters.difficulty.length > 0) {
          const pinDifficulty = pin.difficulty as string | undefined;
          if (pinDifficulty && !routesFilters.difficulty.includes(pinDifficulty)) return false;
          if (!pinDifficulty) return false;
        }
        // Surface filter
        if (routesFilters.surface.length > 0) {
          const surfaceMapping: Record<string, string> = {
            'paved': 'tarmac', 'gravel': 'gravel', 'dirt': 'dirt', 'mixed': 'mixed',
          };
          const allowedSurfaces = routesFilters.surface.map(s => surfaceMapping[s]).filter(Boolean);
          const pinSurface = pin.surfaceType as string | undefined;
          if (pinSurface && !allowedSurfaces.includes(pinSurface)) return false;
          if (!pinSurface) return false;
        }
        // Duration filter
        if (routesFilters.duration) {
          const mins = typeof pin.durationMinutes === 'number' ? pin.durationMinutes : null;
          if (mins != null) {
            if (routesFilters.duration === 'under-1h' && mins >= 60) return false;
            if (routesFilters.duration === '1-2h' && (mins < 60 || mins > 120)) return false;
            if (routesFilters.duration === '2-4h' && (mins < 120 || mins > 240)) return false;
            if (routesFilters.duration === 'over-4h' && mins < 240) return false;
          } else {
            return false; // no duration data, exclude
          }
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

  // ── Update GeoJSON source when pins/filters change ──
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Ensure source + layers exist
    if (!layersAdded.current) {
      addSourceAndLayers(map.current);
      layersAdded.current = true;
    }

    const source = map.current.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const filtered = getFilteredPins();
    const geojson = buildGeoJSON(filtered);
    source.setData(geojson);

    // Update opacity
    for (const layerId of LAYER_IDS) {
      if (map.current.getLayer(layerId)) {
        map.current.setPaintProperty(layerId, 'icon-opacity', markerOpacity);
      }
    }
  }, [activeCategories, activeCategory, isDimmed, eventsFilters, routesFilters, servicesFilters, mapLoaded, pins, markerOpacity, getFilteredPins]);

  // ── Layer visibility based on category selection ──
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

  // ── User location blue dot ──
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
