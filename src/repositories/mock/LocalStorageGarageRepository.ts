// ============================
// LocalStorage-backed Garage Repository
// ============================
// Persists per-user vehicle + preferences data in localStorage.
// Keys: revnet:user:{userId}:vehicles, revnet:user:{userId}:prefs

import type { IGarageRepository, GarageVehicle, UserPreferences } from '@/models/garage';
import { DEFAULT_PREFERENCES } from '@/models/garage';

const VEHICLES_KEY = (uid: string) => `revnet:user:${uid}:vehicles`;
const PREFS_KEY = (uid: string) => `revnet:user:${uid}:prefs`;
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export class LocalStorageGarageRepository implements IGarageRepository {
  // ---- Listeners for reactive updates ----
  private listeners = new Set<() => void>();
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private notify() { this.listeners.forEach(fn => fn()); }

  getVehicles(userId: string): GarageVehicle[] {
    return read<GarageVehicle[]>(VEHICLES_KEY(userId), []);
  }

  addVehicle(vehicle: Omit<GarageVehicle, 'id' | 'createdAt'>): GarageVehicle {
    const newV: GarageVehicle = { ...vehicle, id: uid(), createdAt: now() };
    const vehicles = this.getVehicles(vehicle.userId);
    // If this is primary, unset others
    if (newV.isPrimary) {
      vehicles.forEach(v => v.isPrimary = false);
    }
    // If first vehicle, make it primary
    if (vehicles.length === 0) newV.isPrimary = true;
    vehicles.push(newV);
    write(VEHICLES_KEY(vehicle.userId), vehicles);
    this.notify();
    return newV;
  }

  updateVehicle(vehicleId: string, patch: Partial<GarageVehicle>): GarageVehicle {
    // Find which user owns this vehicle
    // We need userId from the patch or iterate — for simplicity, we pass userId in patch
    const userId = patch.userId;
    if (!userId) throw new Error('userId required in patch for localStorage repo');
    const vehicles = this.getVehicles(userId);
    const idx = vehicles.findIndex(v => v.id === vehicleId);
    if (idx === -1) throw new Error('Vehicle not found');
    vehicles[idx] = { ...vehicles[idx], ...patch };
    if (patch.isPrimary) {
      vehicles.forEach((v, i) => { if (i !== idx) v.isPrimary = false; });
    }
    write(VEHICLES_KEY(userId), vehicles);
    this.notify();
    return vehicles[idx];
  }

  deleteVehicle(vehicleId: string): void {
    // We need to search all keys — for simplicity, we accept userId param via a wrapper
    // The hook will handle passing userId
    const keys = Object.keys(localStorage).filter(k => k.startsWith('revnet:user:') && k.endsWith(':vehicles'));
    for (const key of keys) {
      const vehicles = read<GarageVehicle[]>(key, []);
      const filtered = vehicles.filter(v => v.id !== vehicleId);
      if (filtered.length !== vehicles.length) {
        write(key, filtered);
        this.notify();
        return;
      }
    }
  }

  setPrimaryVehicle(vehicleId: string, userId: string): void {
    const vehicles = this.getVehicles(userId);
    vehicles.forEach(v => { v.isPrimary = v.id === vehicleId; });
    write(VEHICLES_KEY(userId), vehicles);
    this.notify();
  }

  getUserPreferences(userId: string): UserPreferences {
    return read<UserPreferences>(PREFS_KEY(userId), { ...DEFAULT_PREFERENCES, userId });
  }

  updateUserPreferences(userId: string, patch: Partial<UserPreferences>): UserPreferences {
    const current = this.getUserPreferences(userId);
    const updated = { ...current, ...patch, userId, updatedAt: now() };
    write(PREFS_KEY(userId), updated);
    this.notify();
    return updated;
  }
}
