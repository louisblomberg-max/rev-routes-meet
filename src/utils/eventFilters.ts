/**
 * Event filtering utility — queries structured RevEvent fields directly.
 * Designed for easy migration to Supabase server-side filtering.
 */
import type { RevEvent } from '@/models';
import type { EventsFilterState } from '@/components/EventsFiltersPanel';
import { startOfDay, endOfDay, addDays, startOfMonth, endOfMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns';

/** Haversine distance in miles between two lat/lng points */
function haversineDistanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Map filter event type IDs to model EventType values */
const FILTER_TYPE_MAP: Record<string, string> = {
  meets: 'meets',
  shows: 'shows',
  drive: 'drive',
  'track-day': 'track_day',
  motorsport: 'motorsport',
  autojumble: 'autojumble',
};

/** Map event size filter IDs to maxAttendees ranges */
function matchesEventSize(maxAttendees: number, sizeFilter: string): boolean {
  switch (sizeFilter) {
    case 'small': return maxAttendees < 20;
    case 'medium': return maxAttendees >= 20 && maxAttendees <= 50;
    case 'large': return maxAttendees > 50 && maxAttendees <= 100;
    case 'massive': return maxAttendees > 100;
    default: return true;
  }
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export function filterEvents(
  events: RevEvent[],
  filters: EventsFilterState,
  userLocation?: UserLocation | null,
): RevEvent[] {
  return events.filter(event => {
    // Distance filter
    if (typeof filters.distance === 'number' && userLocation && event.lat != null && event.lng != null) {
      const dist = haversineDistanceMiles(userLocation.lat, userLocation.lng, event.lat, event.lng);
      if (dist > filters.distance) return false;
    }

    // Event type filter
    if (filters.types.length > 0) {
      const allowedTypes = filters.types.map(t => FILTER_TYPE_MAP[t]).filter(Boolean);
      if (allowedTypes.length > 0 && !allowedTypes.includes(event.eventType)) return false;
    }

    // Vehicle type filter
    if (filters.vehicleTypes.length > 0) {
      const filterVType = filters.vehicleTypes[0]; // single-select
      // If event is 'all', it matches any filter. If filter is specific, event must match or be 'all'.
      if (filterVType === 'cars' && event.vehicleType !== 'cars' && event.vehicleType !== 'all') return false;
      if (filterVType === 'bikes' && event.vehicleType !== 'bikes' && event.vehicleType !== 'all') return false;
    }

    // Vehicle brand filter (any match)
    if (filters.vehicleBrands.length > 0) {
      const eventBrandsLower = event.vehicleBrands.map(b => b.toLowerCase());
      const hasMatch = filters.vehicleBrands.some(fb => eventBrandsLower.includes(fb.toLowerCase()));
      if (!hasMatch) return false;
    }

    // Vehicle category filter
    if (filters.vehicleCategory) {
      if (!event.vehicleCategories.includes(filters.vehicleCategory)) return false;
    }

    // Vehicle age filter
    if (filters.vehicleAge) {
      if (event.vehicleAge !== filters.vehicleAge) return false;
    }

    // Date filter
    if (filters.dateFilter) {
      const eventDate = event.startDate ? parseISO(event.startDate) : null;
      if (!eventDate) return false;
      const now = new Date();

      if (filters.dateFilter === 'today') {
        if (!isSameDay(eventDate, now)) return false;
      } else if (filters.dateFilter === 'this-week') {
        const weekEnd = addDays(now, 7);
        if (!isWithinInterval(eventDate, { start: startOfDay(now), end: endOfDay(weekEnd) })) return false;
      } else if (filters.dateFilter === 'this-month') {
        if (!isWithinInterval(eventDate, { start: startOfMonth(now), end: endOfMonth(now) })) return false;
      } else if (filters.dateFilter === 'specific' && filters.specificDate) {
        if (!isSameDay(eventDate, filters.specificDate)) return false;
      }
    }

    // Event size filter (based on maxAttendees)
    if (filters.eventSize) {
      if (!matchesEventSize(event.maxAttendees, filters.eventSize)) return false;
    }

    // Entry fee filter
    if (filters.entryFee) {
      if (filters.entryFee === 'free' && event.entryFeeType !== 'free') return false;
      if (filters.entryFee === 'paid' && event.entryFeeType !== 'paid') return false;
    }

    // Club hosted filter
    if (filters.clubHosted) {
      if (event.visibility !== 'club' && !event.clubId) return false;
    }

    return true;
  });
}
