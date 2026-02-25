/**
 * Route Creation Service — abstracted for future swap to native/Supabase.
 * Handles: Record Drive, Draw Route, Import GPX, Snap to Roads
 */

import mapboxgl from 'mapbox-gl';
import type { RouteDraft, RouteGeometry } from '@/models/route';

const DIRECTIONS_BASE = 'https://api.mapbox.com/directions/v5/mapbox/driving';

function getMapboxToken(): string {
  const token = mapboxgl.accessToken;
  if (!token) throw new Error('Mapbox access token not set');
  return typeof token === 'string' ? token : '';
}

// ---- Legacy types (kept for backward compat during migration) ----

export interface DraftRoute {
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  distance: number;
  duration: number;
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
  elapsed: number;
}

// ---- Snap to Roads (full route) ----

export async function snapToRoads(
  waypoints: [number, number][],
): Promise<DraftRoute> {
  if (waypoints.length < 2) throw new Error('Need at least 2 waypoints');

  const coords = waypoints.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `${DIRECTIONS_BASE}/${coords}?` + new URLSearchParams({
    access_token: getMapboxToken(),
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

// ---- Snap single segment between two points ----

export interface SnappedSegment {
  coordinates: [number, number][];
  distance: number;  // meters
  duration: number;  // seconds
}

/**
 * Snap a single segment between two points via Mapbox Directions API.
 */
export async function snapSegment(
  from: [number, number],
  to: [number, number],
): Promise<SnappedSegment> {
  const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`;
  const url = `${DIRECTIONS_BASE}/${coords}?` + new URLSearchParams({
    access_token: getMapboxToken(),
    geometries: 'geojson',
    overview: 'full',
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API error: ${res.status}`);
  const data = await res.json();
  if (!data.routes?.length) throw new Error('No route found for segment');

  const route = data.routes[0];
  return {
    coordinates: route.geometry.coordinates as [number, number][],
    distance: route.distance,
    duration: route.duration,
  };
}

/**
 * Build a complete snapped geometry from segments.
 * Each segment shares an endpoint with the next.
 */
export function mergeSegments(segments: SnappedSegment[]): {
  coordinates: [number, number][];
  totalDistance: number;
  totalDuration: number;
} {
  if (segments.length === 0) return { coordinates: [], totalDistance: 0, totalDuration: 0 };

  const coordinates: [number, number][] = [...segments[0].coordinates];
  let totalDistance = segments[0].distance;
  let totalDuration = segments[0].duration;

  for (let i = 1; i < segments.length; i++) {
    // Skip first point of subsequent segments (shared with previous endpoint)
    coordinates.push(...segments[i].coordinates.slice(1));
    totalDistance += segments[i].distance;
    totalDuration += segments[i].duration;
  }

  return { coordinates, totalDistance, totalDuration };
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

export function calculateDistance(coords: [number, number][]): number {
  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    total += haversine(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]);
  }
  return total;
}

export function estimateDuration(distanceMeters: number): number {
  return distanceMeters / (50000 / 3600); // ~50 km/h average
}

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

/**
 * Build a new-style RouteDraft from coordinates.
 */
export function buildRouteDraft(
  coords: [number, number][],
  waypoints: [number, number][],
  snapped: boolean,
  distance?: number,
  duration?: number,
): RouteDraft {
  const dist = distance ?? calculateDistance(coords);
  const dur = duration ?? estimateDuration(dist);
  return {
    geometry: {
      type: 'LineString',
      coordinates: coords,
      snapped,
      waypoints,
    },
    stats: { distanceMeters: dist, durationSeconds: dur },
    startLat: coords[0][1],
    startLng: coords[0][0],
    endLat: coords[coords.length - 1][1],
    endLng: coords[coords.length - 1][0],
  };
}

// ---- GPX Parsing ----

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

// ---- Reverse Geocoding ----

export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` + new URLSearchParams({
      access_token: getMapboxToken(),
      types: 'place,locality,neighborhood',
      limit: '1',
    });
    const res = await fetch(url);
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    return data.features?.[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
