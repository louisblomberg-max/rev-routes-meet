// ============================
// Garage & Preferences Models (Supabase-ready)
// ============================

export interface GarageVehicle {
  id: string;
  userId: string;
  vehicleType: 'car' | 'motorcycle';
  make: string;
  model: string;
  year?: number;
  trim?: string;
  engine?: string;
  transmission?: 'manual' | 'auto' | 'dct' | 'cvt';
  drivetrain?: 'fwd' | 'rwd' | 'awd' | '4wd';
  colour?: string;
  numberPlate?: string;
  mileage?: number;
  tags: string[];
  modsText?: string;
  photos: string[];
  visibility: 'public' | 'friends' | 'private';
  isPrimary: boolean;
  createdAt: string;
}

export const ENTHUSIAST_TAGS = [
  'Classic', 'Supercar', 'JDM', 'Euro', 'American', 'Track',
  'Off-road', 'Drift', 'EV', 'Modified', 'Stock', 'Project',
  'Show Car', 'Daily',
] as const;

export type EnthusiastTag = typeof ENTHUSIAST_TAGS[number];

export const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'auto', label: 'Automatic' },
  { value: 'dct', label: 'DCT' },
  { value: 'cvt', label: 'CVT' },
] as const;

export const DRIVETRAIN_OPTIONS = [
  { value: 'fwd', label: 'FWD' },
  { value: 'rwd', label: 'RWD' },
  { value: 'awd', label: 'AWD' },
  { value: '4wd', label: '4WD' },
] as const;

export interface UserPreferences {
  userId: string;
  interests: string[];         // 'events', 'routes', 'services', 'clubs', 'marketplace'
  vehicleTypes: string[];      // 'car', 'motorcycle'
  styleTags: string[];         // EnthusiastTag[]
  discoveryRadius?: number;
  notifications: {
    newEventsNearby: boolean;
    friendsNearby: boolean;
    clubAnnouncements: boolean;
    marketplaceMessages: boolean;
    sosAlerts: boolean;
  };
  updatedAt: string;
}

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId'> = {
  interests: [],
  vehicleTypes: [],
  styleTags: [],
  notifications: {
    newEventsNearby: true,
    friendsNearby: false,
    clubAnnouncements: false,
    marketplaceMessages: false,
    sosAlerts: true,
  },
  updatedAt: new Date().toISOString(),
};

// ---- Repository Interface ----
export interface IGarageRepository {
  getVehicles(userId: string): GarageVehicle[];
  addVehicle(vehicle: Omit<GarageVehicle, 'id' | 'createdAt'>): GarageVehicle;
  updateVehicle(vehicleId: string, patch: Partial<GarageVehicle>): GarageVehicle;
  deleteVehicle(vehicleId: string): void;
  setPrimaryVehicle(vehicleId: string, userId: string): void;
  getUserPreferences(userId: string): UserPreferences;
  updateUserPreferences(userId: string, patch: Partial<UserPreferences>): UserPreferences;
}

// ---- Recommendation helpers ----
export function getRecommendationBullets(
  vehicles: GarageVehicle[],
  tags: string[],
  vehicleTypes: string[],
): string[] {
  const bullets: string[] = [];
  
  // Make-based
  const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))];
  if (makes.length > 0) {
    const makeStr = makes.slice(0, 2).join(' & ');
    bullets.push(`${makeStr} meets and events nearby`);
  }

  // Tag-based
  if (tags.includes('Track') || tags.includes('Drift')) bullets.push('Track days and performance events');
  if (tags.includes('JDM')) bullets.push('JDM community events and clubs');
  if (tags.includes('Euro')) bullets.push('Euro specialist services');
  if (tags.includes('Classic')) bullets.push('Classic car shows and restoration services');
  if (tags.includes('Supercar')) bullets.push('Supercar rallies and luxury meets');
  if (tags.includes('Off-road')) bullets.push('Off-road trails and adventure routes');
  if (tags.includes('EV')) bullets.push('EV charging stations and EV-friendly services');
  if (tags.includes('Modified')) bullets.push('Tuning shops and modification specialists');

  // Vehicle type
  if (vehicleTypes.includes('motorcycle')) bullets.push('Biker-friendly routes and ride-outs');
  
  // Generic scenic
  if (bullets.length < 3) bullets.push('Scenic driving routes near you');
  if (bullets.length < 3) bullets.push('Trusted garages and mechanics');

  return bullets.slice(0, 4);
}
