// ============================
// Route Domain Models
// ============================
// Designed 1:1 with future Supabase schema.

export interface Waypoint {
  lng: number;
  lat: number;
  /** Index in the waypoints array */
  index: number;
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][];
  /** Whether this geometry has been snapped to roads */
  snapped: boolean;
  /** Original waypoints placed by the user */
  waypoints: [number, number][];
}

export interface RouteStats {
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteVisibility {
  level: 'public' | 'friends' | 'club' | 'private';
  clubId?: string;
  clubName?: string;
}

export interface RouteMedia {
  photoUrls: string[];
}

/**
 * In-progress route draft — local state only.
 * Created during Record/Draw/Import, refined in Edit & Publish.
 */
export interface RouteDraft {
  geometry: RouteGeometry;
  stats: RouteStats;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;

  // Metadata (filled in Edit & Publish)
  name?: string;
  description?: string;
  bestTime?: string;
  tips?: string;
  vehicleTypes?: string[];
  routeType?: string;
  difficulty?: string;
  surfaceType?: string;
  safetyTags?: string[];
  visibility?: RouteVisibility;
  media?: RouteMedia;
}

/**
 * Published route — stored in repository.
 * Maps 1:1 to future Supabase `routes` table.
 */
export interface PublishedRoute {
  id: string;
  name: string;
  description: string;
  visibility: RouteVisibility;
  vehicleTypes: string[];
  routeType: string;
  difficulty: string;
  surfaceType: string;
  safetyTags: string[];
  geometry: RouteGeometry;
  stats: RouteStats;
  media: RouteMedia;
  bestTime: string;
  tips: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data structure for the publish form submission.
 */
export interface PublishRouteFormData {
  name: string;
  description: string;
  bestTime: string;
  tips: string;
  vehicleTypeMode: 'all' | 'selected';
  vehicleTypes: string[];
  routeType: string;
  difficulty: string;
  surfaceType: string;
  safetyTags: string[];
  visibility: RouteVisibility;
  photos: string[];
  draft: RouteDraft;
}
