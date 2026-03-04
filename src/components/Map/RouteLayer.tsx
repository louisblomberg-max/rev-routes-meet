/**
 * RouteLayer — renders navigation route line + markers on the Mapbox map.
 * Enhanced with glow effect and proper layer ordering.
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useNavigation } from '@/contexts/NavigationContext';

interface RouteLayerProps {
  map: mapboxgl.Map | null;
}

const ROUTE_SOURCE = 'nav-route';
const ROUTE_GLOW = 'nav-route-glow';
const ROUTE_CASING = 'nav-route-casing';
const ROUTE_LAYER = 'nav-route-line';

const RouteLayer = ({ map }: RouteLayerProps) => {
  const { route, destination, userPosition, status } = useNavigation();
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Add/update route line
  useEffect(() => {
    if (!map || !route) {
      cleanup(map);
      return;
    }

    const addRoute = () => {
      // Remove existing
      [ROUTE_LAYER, ROUTE_CASING, ROUTE_GLOW].forEach(l => {
        if (map.getLayer(l)) map.removeLayer(l);
      });
      if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE);

      map.addSource(ROUTE_SOURCE, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        },
      });

      // Glow (outermost)
      map.addLayer({
        id: ROUTE_GLOW,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 16,
          'line-opacity': 0.15,
          'line-blur': 8,
        },
      });

      // Casing
      map.addLayer({
        id: ROUTE_CASING,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 8,
          'line-opacity': 0.4,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Main line
      map.addLayer({
        id: ROUTE_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.95,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Fit bounds
      const coords = route.geometry.coordinates as [number, number][];
      if (coords.length > 0) {
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0]),
        );
        map.fitBounds(bounds, { padding: 80, duration: 1000 });
      }
    };

    if (map.isStyleLoaded()) {
      addRoute();
    } else {
      map.once('style.load', addRoute);
    }

    return () => { cleanup(map); };
  }, [map, route]);

  // Destination marker — matches category pin style
  useEffect(() => {
    destMarkerRef.current?.remove();
    if (!map || !destination || destination.lat == null || destination.lng == null) return;

    const PIN_COLORS: Record<string, string> = {
      events: '#ef4444',
      routes: '#3b82f6',
      services: '#059669',
      clubs: '#7c3aed',
    };
    const color = PIN_COLORS[destination.itemType || 'routes'] || '#3b82f6';

    const el = document.createElement('div');
    el.style.cssText = `
      width: 20px; height: 20px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 0 0 3px ${color}40, 0 2px 6px rgba(0,0,0,0.3);
    `;

    destMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map);

    return () => { destMarkerRef.current?.remove(); };
  }, [map, destination]);

  // User navigation marker (pulsing blue)
  useEffect(() => {
    if (!map || !userPosition || status === 'idle') {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 22px; height: 22px; border-radius: 50%;
        background: #3b82f6; border: 3px solid white;
        box-shadow: 0 0 0 6px rgba(59,130,246,0.25), 0 2px 8px rgba(0,0,0,0.3);
        transition: transform 0.3s ease;
      `;
      userMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userPosition.lng, userPosition.lat]);
    }
  }, [map, userPosition, status]);

  return null;
};

function cleanup(map: mapboxgl.Map | null) {
  if (!map) return;
  try {
    [ROUTE_LAYER, ROUTE_CASING, ROUTE_GLOW].forEach(l => {
      if (map.getLayer(l)) map.removeLayer(l);
    });
    if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE);
  } catch {}
}

export default RouteLayer;
