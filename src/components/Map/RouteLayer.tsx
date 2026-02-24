/**
 * RouteLayer — renders navigation route line + markers on the Mapbox map.
 * Separated from MapView so navigation logic stays isolated.
 */

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useNavigation } from '@/contexts/NavigationContext';

interface RouteLayerProps {
  map: mapboxgl.Map | null;
}

const ROUTE_SOURCE = 'nav-route';
const ROUTE_LAYER = 'nav-route-line';
const ROUTE_CASING = 'nav-route-casing';

const RouteLayer = ({ map }: RouteLayerProps) => {
  const { route, destination, userPosition, status } = useNavigation();
  const startMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const destMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);

  // Add/update route line
  useEffect(() => {
    if (!map || !route) {
      // Clean up if no route
      cleanup(map);
      return;
    }

    const addRoute = () => {
      // Remove existing
      if (map.getLayer(ROUTE_LAYER)) map.removeLayer(ROUTE_LAYER);
      if (map.getLayer(ROUTE_CASING)) map.removeLayer(ROUTE_CASING);
      if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE);

      map.addSource(ROUTE_SOURCE, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry,
        },
      });

      // Casing (outline)
      map.addLayer({
        id: ROUTE_CASING,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#1a56db',
          'line-width': 10,
          'line-opacity': 0.3,
        },
      });

      // Main route line
      map.addLayer({
        id: ROUTE_LAYER,
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 5,
          'line-opacity': 0.9,
        },
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
      });

      // Fit to route bounds
      const coords = route.geometry.coordinates as [number, number][];
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 80, duration: 1000 });
    };

    if (map.isStyleLoaded()) {
      addRoute();
    } else {
      map.once('style.load', addRoute);
    }

    return () => {
      cleanup(map);
    };
  }, [map, route]);

  // Destination marker
  useEffect(() => {
    destMarkerRef.current?.remove();
    if (!map || !destination) return;

    const el = document.createElement('div');
    el.style.cssText = `
      width: 36px; height: 36px; border-radius: 50%;
      background: #ef4444; border: 3px solid white;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
    `;
    el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

    destMarkerRef.current = new mapboxgl.Marker({ element: el })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map);

    return () => { destMarkerRef.current?.remove(); };
  }, [map, destination]);

  // User position marker (pulsing blue dot)
  useEffect(() => {
    if (!map || !userPosition || status === 'idle') {
      userMarkerRef.current?.remove();
      return;
    }

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50%;
        background: #3b82f6; border: 3px solid white;
        box-shadow: 0 0 0 6px rgba(59,130,246,0.25), 0 2px 8px rgba(0,0,0,0.3);
      `;
      userMarkerRef.current = new mapboxgl.Marker({ element: el }).addTo(map);
    }

    userMarkerRef.current.setLngLat([userPosition.lng, userPosition.lat]);
  }, [map, userPosition, status]);

  return null;
};

function cleanup(map: mapboxgl.Map | null) {
  if (!map) return;
  try {
    if (map.getLayer(ROUTE_LAYER)) map.removeLayer(ROUTE_LAYER);
    if (map.getLayer(ROUTE_CASING)) map.removeLayer(ROUTE_CASING);
    if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE);
  } catch {}
}

export default RouteLayer;
