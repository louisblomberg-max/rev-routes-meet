/**
 * Route Creation Service — abstracted for future swap to native/Supabase.
 * Handles: Record Drive, Draw Route, Import GPX
 */

import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = mapboxgl.accessToken as string;
const DIRECTIONS_BASE = 'https://api.mapbox.com/directions/v5/mapbox/driving';

// ---- Types ----

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface DraftRoute {
  geometry: RouteGeometry;
  distance: number;  // meters
  duration: number;  // seconds
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  coordinates: [number, number][];
  distance: number;
  startTime: number | null;
  elapsed: number; // seconds
}

// ---- Snap to Roads ----

/**
 * Snap waypoints to roads via Mapbox Directions API.
 * Only called on explicit user action.
 */
export async function snapToRoads(
  waypoints: [number, number][],
): Promise<DraftRoute> {
  if (waypoints.length < 2) throw new Error('Need at least 2 waypoints');

  const coords = waypoints.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `${DIRECTIONS_BASE}/${coords}?` + new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    geometries: 'geojson',
    overview: 'full',
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API error: ${res.status}`);
  const data = await res.json();
  if (!data.routes?.length) throw new Error('No route found');

  const route = data.routes[0];
  const lineCoords = route.geometry.coordinates as [number, number][];
  return {
    geometry: route.geometry,
    distance: route.distance,
    duration: route.duration,
    startLat: lineCoords[0][1],
    startLng: lineCoords[0][0],
    endLat: lineCoords[lineCoords.length - 1][1],
    endLng: lineCoords[lineCoords.length - 1][0],
  };
}

// ---- Distance calculation (haversine) ----

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Calculate total distance of a coordinate array.
 */
export function calculateDistance(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
  }
  return total;
}

/**
 * Estimate duration based on average driving speed (~50 km/h).
 */
export function estimateDuration(distanceMeters: number): number {
  return distanceMeters / (50000 / 3600); // seconds
}

/**
 * Build a DraftRoute from raw coordinates (no snapping).
 */
export function buildDraftFromCoords(coords: [number, number][]): DraftRoute {
  const distance = calculateDistance(coords);
  return {
    geometry: { type: 'LineString', coordinates: coords },
    distance,
    duration: estimateDuration(distance),
    startLat: coords[0][1],
    startLng: coords[0][0],
    endLat: coords[coords.length - 1][1],
    endLng: coords[coords.length - 1][0],
  };
}

// ---- GPX Parsing (basic, extendable later) ----

/**
 * Parse a GPX file string into coordinates.
 * Handles <trkpt> elements with lat/lon attributes.
 */
export function parseGPX(gpxString: string): [number, number][] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(gpxString, 'application/xml');
  const points = doc.querySelectorAll('trkpt, rtept, wpt');
  const coords: [number, number][] = [];

  points.forEach(pt => {
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lon = parseFloat(pt.getAttribute('lon') || '0');
    if (lat && lon) coords.push([lon, lat]);
  });

  if (coords.length < 2) throw new Error('GPX file must contain at least 2 points');
  return coords;
}

// ---- Formatting helpers ----

export function formatRouteDistance(meters: number): string {
  if (meters >= 1609.34) return `${(meters / 1609.34).toFixed(1)} mi`;
  return `${Math.round(meters)} m`;
}

export function formatRouteDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
