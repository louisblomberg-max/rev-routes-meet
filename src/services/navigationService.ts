/**
 * Navigation Service — abstracted for future swap to native Mapbox Navigation SDK.
 * Uses Mapbox Directions API (driving profile) with turn-by-turn steps.
 */

import mapboxgl from 'mapbox-gl';

export interface NavigationStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuver: {
    type: string;
    modifier?: string;
    bearing_after?: number;
    bearing_before?: number;
    location: [number, number];
  };
}

export interface NavigationRoute {
  geometry: GeoJSON.LineString;
  distance: number; // meters
  duration: number; // seconds
  steps: NavigationStep[];
}

export interface NavigationDestination {
  lat: number;
  lng: number;
  title: string;
}

const MAPBOX_TOKEN = mapboxgl.accessToken as string;
const DIRECTIONS_BASE = 'https://api.mapbox.com/directions/v5/mapbox/driving';

/**
 * Fetch a driving route from origin to destination.
 * Only called on explicit user action (Navigate button).
 */
export async function fetchRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<NavigationRoute> {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${DIRECTIONS_BASE}/${coords}?` + new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    geometries: 'geojson',
    overview: 'full',
    steps: 'true',
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions API error: ${res.status}`);

  const data = await res.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  const steps: NavigationStep[] = route.legs[0].steps.map((s: any) => ({
    instruction: s.maneuver.instruction,
    distance: s.distance,
    duration: s.duration,
    maneuver: {
      type: s.maneuver.type,
      modifier: s.maneuver.modifier,
      bearing_after: s.maneuver.bearing_after,
      bearing_before: s.maneuver.bearing_before,
      location: s.maneuver.location,
    },
  }));

  return {
    geometry: route.geometry,
    distance: route.distance,
    duration: route.duration,
    steps,
  };
}

/**
 * Get user's current GPS position via browser geolocation.
 */
export function getUserPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

/**
 * Watch user position continuously. Returns a cleanup function.
 */
export function watchUserPosition(
  onUpdate: (pos: { lat: number; lng: number }) => void,
  onError?: (err: GeolocationPositionError) => void,
): () => void {
  const id = navigator.geolocation.watchPosition(
    (pos) => onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    onError,
    { enableHighAccuracy: true },
  );
  return () => navigator.geolocation.clearWatch(id);
}

/**
 * Check if user is off-route (distance from nearest point on route > threshold).
 * Simple implementation: checks distance to each step maneuver location.
 */
export function isOffRoute(
  userPos: { lat: number; lng: number },
  route: NavigationRoute,
  thresholdMeters = 100,
): boolean {
  const coords = route.geometry.coordinates;
  let minDist = Infinity;

  for (const coord of coords) {
    const dist = haversineDistance(userPos.lat, userPos.lng, coord[1], coord[0]);
    if (dist < minDist) minDist = dist;
    if (minDist < thresholdMeters) return false; // early exit
  }

  return minDist > thresholdMeters;
}

/**
 * Find the index of the current step based on user position.
 */
export function getCurrentStepIndex(
  userPos: { lat: number; lng: number },
  steps: NavigationStep[],
): number {
  let closest = 0;
  let minDist = Infinity;

  for (let i = 0; i < steps.length; i++) {
    const loc = steps[i].maneuver.location;
    const dist = haversineDistance(userPos.lat, userPos.lng, loc[1], loc[0]);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }

  return closest;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Open external maps app with destination coordinates.
 */
export function openExternalMaps(destination: NavigationDestination) {
  const { lat, lng, title } = destination;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    window.open(`maps://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(title)}`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }
}

/**
 * Format distance for display.
 */
export function formatDistance(meters: number): string {
  if (meters >= 1609.34) {
    return `${(meters / 1609.34).toFixed(1)} mi`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Format duration for display.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
