/**
 * RoutePreviewLayer — renders a route's polyline on the map when selected
 * from the discovery view (not navigation mode).
 */

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface RoutePreviewLayerProps {
  map: mapboxgl.Map | null;
  polyline: string | null; // JSON-stringified RouteGeometry or GeoJSON LineString
  routeId: string | null;
}

const PREVIEW_SOURCE = 'route-preview';
const PREVIEW_GLOW = 'route-preview-glow';
const PREVIEW_CASING = 'route-preview-casing';
const PREVIEW_LINE = 'route-preview-line';

const RoutePreviewLayer = ({ map, polyline, routeId }: RoutePreviewLayerProps) => {
  useEffect(() => {
    if (!map) return;

    const cleanup = () => {
      try {
        [PREVIEW_LINE, PREVIEW_CASING, PREVIEW_GLOW].forEach(l => {
          if (map.getLayer(l)) map.removeLayer(l);
        });
        if (map.getSource(PREVIEW_SOURCE)) map.removeSource(PREVIEW_SOURCE);
      } catch {}
    };

    if (!polyline || !routeId) {
      cleanup();
      return;
    }

    let geometry: GeoJSON.LineString | null = null;

    try {
      const parsed = JSON.parse(polyline);
      // Could be a RouteGeometry { type: 'LineString', coordinates: [...] }
      // or a raw GeoJSON LineString
      if (parsed.type === 'LineString' && Array.isArray(parsed.coordinates)) {
        geometry = parsed as GeoJSON.LineString;
      } else if (Array.isArray(parsed)) {
        // Array of [lng, lat] pairs
        geometry = { type: 'LineString', coordinates: parsed };
      }
    } catch {
      // Not valid JSON
      return;
    }

    if (!geometry || geometry.coordinates.length < 2) {
      cleanup();
      return;
    }

    const addPreview = () => {
      cleanup();

      map.addSource(PREVIEW_SOURCE, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry,
        },
      });

      // Glow
      map.addLayer({
        id: PREVIEW_GLOW,
        type: 'line',
        source: PREVIEW_SOURCE,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 14,
          'line-opacity': 0.12,
          'line-blur': 6,
        },
      });

      // Casing
      map.addLayer({
        id: PREVIEW_CASING,
        type: 'line',
        source: PREVIEW_SOURCE,
        paint: {
          'line-color': '#1d4ed8',
          'line-width': 6,
          'line-opacity': 0.35,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });

      // Main line
      map.addLayer({
        id: PREVIEW_LINE,
        type: 'line',
        source: PREVIEW_SOURCE,
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3.5,
          'line-opacity': 0.9,
        },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });

      // Fit bounds to the route
      const coords = geometry!.coordinates as [number, number][];
      if (coords.length >= 2) {
        const bounds = coords.reduce(
          (b, c) => b.extend(c),
          new mapboxgl.LngLatBounds(coords[0], coords[0]),
        );
        map.fitBounds(bounds, { padding: 100, duration: 1200 });
      }
    };

    if (map.isStyleLoaded()) {
      addPreview();
    } else {
      map.once('style.load', addPreview);
    }

    return cleanup;
  }, [map, polyline, routeId]);

  return null;
};

export default RoutePreviewLayer;
