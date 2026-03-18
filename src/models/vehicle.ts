// ============================
// Vehicle Data Model (Supabase-ready)
// ============================
// All field names use snake_case to match future DB columns.

export interface VehicleFormData {
  // Step 1 — Basics
  vehicle_type: 'car' | 'motorcycle';
  brand: string;
  model: string;
  year: number | null;

  // Step 2 — Core Details
  fuel_type: string;
  transmission: string;
  drivetrain: string;
  engine_size: string;
  power: string;
  category: string[];

  // Step 3 — Personalisation
  nickname: string;
  description: string;
  images: string[];       // URLs or base64 previews (frontend-only for now)
  modifications: string[];
  usage: string;
  visibility: 'public' | 'friends' | 'private';
  is_active: boolean;
}

export const EMPTY_VEHICLE: VehicleFormData = {
  vehicle_type: 'car',
  brand: '',
  model: '',
  year: null,
  fuel_type: '',
  transmission: '',
  drivetrain: '',
  engine_size: '',
  power: '',
  category: [],
  nickname: '',
  description: '',
  images: [],
  modifications: [],
  usage: '',
  visibility: 'public',
  is_active: false,
};

// ---- Brand lists ----
export const CAR_BRANDS = [
  'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Dacia', 'Dodge',
  'Ferrari', 'Fiat', 'Ford', 'Genesis', 'Honda', 'Hyundai', 'Infiniti',
  'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus',
  'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini',
  'Mitsubishi', 'Nissan', 'Opel', 'Pagani', 'Peugeot', 'Porsche',
  'Renault', 'Rolls-Royce', 'Seat', 'Škoda', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen', 'Volvo',
] as const;

export const MOTORCYCLE_BRANDS = [
  'Aprilia', 'Benelli', 'BMW', 'Ducati', 'Harley-Davidson', 'Honda',
  'Husqvarna', 'Indian', 'Kawasaki', 'KTM', 'Moto Guzzi', 'MV Agusta',
  'Royal Enfield', 'Suzuki', 'Triumph', 'Yamaha',
] as const;

// ---- Category / Style tags ----
export const CAR_CATEGORIES = [
  'JDM', 'European', 'American', 'Classic', 'Supercar', 'Modified', 'Daily', 'Track',
] as const;

export const MOTORCYCLE_CATEGORIES = [
  'Sport', 'Naked', 'Touring', 'Cruiser', 'Adventure', 'Supermoto', 'Classic',
] as const;

// ---- Fuel / Transmission / Drivetrain ----
export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
] as const;

export const TRANSMISSION_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
] as const;

export const DRIVETRAIN_TYPES = [
  { value: 'fwd', label: 'FWD' },
  { value: 'rwd', label: 'RWD' },
  { value: 'awd', label: 'AWD' },
] as const;

// ---- Modification presets ----
export const MOD_PRESETS = [
  'Performance Mods', 'Exhaust', 'Wheels', 'Suspension', 'Cosmetic Mods',
] as const;

// ---- Usage options ----
export const USAGE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'track', label: 'Track' },
  { value: 'show', label: 'Show' },
] as const;
