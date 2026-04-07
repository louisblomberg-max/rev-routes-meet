import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import UniversalSearch from '@/components/UniversalSearch';
import mapboxgl from 'mapbox-gl';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import revnetLogo from '@/assets/revnet-logo-header.png';
import MapView from '@/components/MapView';

import CategoryChips from '@/components/CategoryChips';
import DetailBottomSheet, { DetailItem } from '@/components/discovery/DetailBottomSheet';
import BottomNavigation from '@/components/BottomNavigation';
import FloatingMapNav from '@/components/FloatingMapNav';
import YouTab from '@/components/YouTab';
import CommunityTab from '@/components/CommunityTab';
import MarketplaceTab from '@/components/MarketplaceTab';
import LocationButton from '@/components/LocationButton';
import HelpButton from '@/components/HelpButton';
import HelpSheet from '@/components/HelpSheet';
import type { MapStyle } from '@/components/MapStyleButton';
import EventsFiltersPanel, { EventsFilterState } from '@/components/EventsFiltersPanel';
import RoutesFiltersPanel, { RoutesFilterState } from '@/components/RoutesFiltersPanel';
import ServicesFiltersPanel, { ServicesFilterState } from '@/components/ServicesFiltersPanel';
import RouteLayer from '@/components/Map/RouteLayer';
import RoutePreviewLayer from '@/components/Map/RoutePreviewLayer';
import NavigationHUD from '@/components/NavigationHUD';
import { MapPin, useMap } from '@/contexts/MapContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

interface TappedLocation {
  lat: number;
  lng: number;
  name: string;
}

interface FriendLocation {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  lat: number;
  lng: number;
  heading: number;
  receivedAt: number;
  destination_title?: string | null;
}

const PIN_COLORS: Record<string, string> = {
  event: '#d30d37',
  events: '#d30d37',
  route: '#4f7fff',
  routes: '#4f7fff',
  service: '#ff8000',
  services: '#ff8000',
};

/* ── Haversine distance in km ── */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const milesToKm = (miles: number) => miles * 1.60934;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status: navStatus } = useNavigation();
  const { state } = useData();
  const { user: authUser } = useAuth();
  const { pins, setPins, setIsLoadingPins } = useMap();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTabState] = useState<Tab>(() => {
    if (tabParam && ['discovery', 'community', 'marketplace', 'you'].includes(tabParam)) return tabParam;
    const stored = sessionStorage.getItem('revnet_active_tab') as Tab | null;
    if (stored && ['discovery', 'community', 'marketplace', 'you'].includes(stored)) return stored;
    return 'discovery';
  });

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    sessionStorage.setItem('revnet_active_tab', tab);
    if (tab === 'discovery') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
    }
  };
  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing' || navStatus === 'arrived';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);

  /* ── User location state ── */
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  /* ── Search state ── */
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  /* ── Filter state ── */
  const [eventsFilters, setEventsFilters] = useState<EventsFilterState>({
    distance: 0, types: [], dateFilter: null, specificDate: undefined,
    vehicleTypes: [], vehicleBrands: [], vehicleCategories: [], vehicleAges: [], eventSize: null, entryFee: null, clubHosted: false,
    filterEventTypes: [], filterVehicleFocus: 'all', filterMeetStyles: [], filterFreeOnly: false,
    filterDateFrom: '', filterDateTo: '', filterGarageVehicleId: null, filterGarageVehicle: null, specificYears: [], filterSpecificBrands: [],
  });
  const [routesFilters, setRoutesFilters] = useState<RoutesFilterState>({
    distance: 0, types: [], difficulty: [], duration: null, surface: [],
  });
  const [servicesFilters, setServicesFilters] = useState<ServicesFilterState>({
    distance: 0, types: [], openNow: false,
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const initialFitDoneRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  // All pins from RPC (unfiltered) kept separately so category switch is instant
  const allPinsRef = useRef<any[]>([]);

  // Tap-to-navigate state
  const [tappedLocation, setTappedLocation] = useState<TappedLocation | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Friend live locations
  const [friendLocations, setFriendLocations] = useState<Record<string, FriendLocation>>({});
  const friendMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});

  // Empty state

  /* ── fetchAllPins: initial load without bounds filter ── */
  const fetchAllPins = useCallback(async () => {
    try {
      const [eventsRes, routesRes, servicesRes] = await Promise.all([
        supabase
          .from('events')
          .select('id, title, lat, lng, type, event_types, date_start, visibility, status, vehicle_focus, vehicle_brands, meet_style_tags, is_free, entry_fee, is_ticketed, ticket_price, location, banner_url, attendee_count, max_attendees, specific_years')
          .eq('visibility', 'public')
          .eq('status', 'published')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .limit(300),
        supabase
          .from('routes')
          .select('id, name, lat, lng, type, difficulty, surface_type, distance_meters, duration_minutes, rating, saves, drives, visibility, status')
          .eq('visibility', 'public')
          .eq('status', 'published')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .limit(300),
        supabase
          .from('services')
          .select('id, name, lat, lng, service_type, address, rating, review_count, visibility')
          .eq('visibility', 'public')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .limit(300),
      ]);

      const mapped = [
        ...(eventsRes.data || []).map(e => ({
          id: e.id, title: e.title, lat: Number(e.lat), lng: Number(e.lng),
          type: 'events', subtype: e.type,
          event_types: e.event_types, meet_style_tags: e.meet_style_tags, vehicle_focus: e.vehicle_focus, vehicle_brands: e.vehicle_brands,
          date_start: e.date_start, is_free: e.is_free, entry_fee: e.entry_fee,
          is_ticketed: e.is_ticketed, ticket_price: e.ticket_price,
          location: e.location, banner_url: e.banner_url, attendee_count: e.attendee_count, max_attendees: e.max_attendees, specific_years: e.specific_years,
        })),
        ...(routesRes.data || []).map(r => ({
          id: r.id, title: r.name, lat: Number(r.lat), lng: Number(r.lng),
          type: 'routes', subtype: r.type,
          difficulty: r.difficulty, surface_type: r.surface_type, distance_meters: r.distance_meters,
          duration_minutes: r.duration_minutes, rating: r.rating,
          saves: r.saves, drives: r.drives,
        })),
        ...(servicesRes.data || []).map(s => ({
          id: s.id, title: s.name, lat: Number(s.lat), lng: Number(s.lng),
          type: 'services', subtype: s.service_type,
          address: s.address, rating: s.rating, review_count: s.review_count,
        })),
      ].filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng));

      allPinsRef.current = mapped;
      setPins(mapped);

    } catch {
      // Don't show empty state on error
    }
  }, [setPins]);

  /* ── refreshPins: bounds-filtered refresh after initial load ── */
  const refreshPins = useCallback(async () => {
    const m = mapRef.current;
    if (!m || !m.loaded()) return;

    // On very first call, do unbounded fetch
    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      await fetchAllPins();
      return;
    }

    const bounds = m.getBounds();
    const north = bounds.getNorthEast().lat;
    const south = bounds.getSouthWest().lat;
    const east = bounds.getNorthEast().lng;
    const west = bounds.getSouthWest().lng;

    try {
      const [eventsRes, routesRes, servicesRes] = await Promise.all([
        supabase
          .from('events')
          .select('id, title, lat, lng, type, event_types, date_start, visibility, status, vehicle_focus, vehicle_brands, meet_style_tags, is_free, entry_fee, is_ticketed, ticket_price, location, banner_url, attendee_count, max_attendees, specific_years')
          .eq('visibility', 'public')
          .eq('status', 'published')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .gte('lat', south).lte('lat', north)
          .gte('lng', west).lte('lng', east)
          .limit(300),
        supabase
          .from('routes')
          .select('id, name, lat, lng, type, difficulty, surface_type, distance_meters, duration_minutes, rating, saves, drives, visibility, status')
          .eq('visibility', 'public')
          .eq('status', 'published')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .gte('lat', south).lte('lat', north)
          .gte('lng', west).lte('lng', east)
          .limit(300),
        supabase
          .from('services')
          .select('id, name, lat, lng, service_type, address, rating, review_count, visibility')
          .eq('visibility', 'public')
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .gte('lat', south).lte('lat', north)
          .gte('lng', west).lte('lng', east)
          .limit(300),
      ]);

      const mapped = [
        ...(eventsRes.data || []).map(e => ({
          id: e.id, title: e.title, lat: Number(e.lat), lng: Number(e.lng),
          type: 'events', subtype: e.type,
          event_types: e.event_types, meet_style_tags: e.meet_style_tags, vehicle_focus: e.vehicle_focus, vehicle_brands: e.vehicle_brands,
          date_start: e.date_start, is_free: e.is_free, entry_fee: e.entry_fee,
          is_ticketed: e.is_ticketed, ticket_price: e.ticket_price,
          location: e.location, banner_url: e.banner_url, attendee_count: e.attendee_count, max_attendees: e.max_attendees, specific_years: e.specific_years,
        })),
        ...(routesRes.data || []).map(r => ({
          id: r.id, title: r.name, lat: Number(r.lat), lng: Number(r.lng),
          type: 'routes', subtype: r.type,
          difficulty: r.difficulty, surface_type: r.surface_type, distance_meters: r.distance_meters,
          duration_minutes: r.duration_minutes, rating: r.rating,
          saves: r.saves, drives: r.drives,
        })),
        ...(servicesRes.data || []).map(s => ({
          id: s.id, title: s.name, lat: Number(s.lat), lng: Number(s.lng),
          type: 'services', subtype: s.service_type,
          address: s.address, rating: s.rating, review_count: s.review_count,
        })),
      ].filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng));

      allPinsRef.current = mapped;
      setPins(mapped);
    } catch {
      // silently retry on next viewport change
    }
  }, [setPins, fetchAllPins]);

  // Realtime subscriptions for new content
  useEffect(() => {
    let channel: any;
    try {
      channel = supabase
        .channel('map-realtime-inserts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, () => {
          refreshPins();
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'routes' }, () => {
          refreshPins();
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'services' }, () => {
          refreshPins();
        })
        .subscribe();
    } catch { /* realtime not available */ }

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [refreshPins]);

  // Friend live location tracking via RPC + realtime
  useEffect(() => {
    if (!authUser?.id) return;

    const loadFriendLocations = async () => {
      const { data } = await supabase.rpc('get_friend_locations', { p_user_id: authUser.id });
      if (data) {
        const locations: Record<string, FriendLocation> = {};
        data.forEach((f: any) => {
          locations[f.user_id] = {
            user_id: f.user_id,
            username: f.username,
            display_name: f.display_name,
            avatar_url: f.avatar_url,
            lat: f.lat,
            lng: f.lng,
            heading: f.heading || 0,
            receivedAt: Date.now(),
            destination_title: f.destination_title,
          };
        });
        setFriendLocations(locations);
      }
    };

    loadFriendLocations();

    const channel = supabase
      .channel('discovery-friend-locations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_location_sessions',
      }, () => {
        loadFriendLocations();
      })
      .subscribe();

    const interval = setInterval(loadFriendLocations, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [authUser?.id]);

  // Render friend markers on map
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    const render = () => {
      // Remove stale markers
      Object.keys(friendMarkersRef.current).forEach(uid => {
        if (!friendLocations[uid]) {
          friendMarkersRef.current[uid].remove();
          delete friendMarkersRef.current[uid];
        }
      });

      Object.values(friendLocations).forEach((friend) => {
        if (!friend.lat || !friend.lng) return;

        if (friendMarkersRef.current[friend.user_id]) {
          friendMarkersRef.current[friend.user_id].setLngLat([friend.lng, friend.lat]);
          const el = friendMarkersRef.current[friend.user_id].getElement();
          const inner = el.querySelector('.friend-inner') as HTMLElement;
          if (inner) inner.style.transform = `rotate(${(friend as any).bearing || friend.heading || 0}deg)`;
          return;
        }

        const el = document.createElement('div');
        el.style.cssText = 'position: relative; cursor: pointer;';

        // Pulse ring
        const pulse = document.createElement('div');
        pulse.style.cssText = `
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 52px; height: 52px; border-radius: 50%; border: 2px solid #22C55E;
          animation: friend-pulse 2s ease-out infinite; pointer-events: none;
        `;
        el.appendChild(pulse);

        // Destination bubble
        if (friend.destination_title) {
          const dest = document.createElement('div');
          dest.style.cssText = `
            position: absolute; bottom: 56px; left: 50%; transform: translateX(-50%);
            background: #185FA5; color: white; font-size: 8px; font-weight: 700;
            padding: 2px 7px; border-radius: 5px; white-space: nowrap;
            max-width: 100px; overflow: hidden; text-overflow: ellipsis;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          `;
          dest.textContent = `→ ${friend.destination_title}`;
          el.appendChild(dest);
        }

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'friend-inner';
        avatar.style.cssText = `
          width: 40px; height: 40px; border-radius: 50%; border: 3px solid #22C55E;
          overflow: hidden; background: #052e16;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          position: relative; z-index: 2; transition: transform 0.3s ease;
        `;

        if (friend.avatar_url) {
          const img = document.createElement('img');
          img.src = friend.avatar_url;
          img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
          avatar.appendChild(img);
        } else {
          const init = document.createElement('span');
          init.style.cssText = 'color: #22C55E; font-size: 14px; font-weight: 800;';
          init.textContent = (friend.display_name || friend.username || '?')[0].toUpperCase();
          avatar.appendChild(init);
        }
        el.appendChild(avatar);

        // Name label
        const label = document.createElement('div');
        label.style.cssText = `
          position: absolute; top: 44px; left: 50%; transform: translateX(-50%);
          background: rgba(0,0,0,0.75); color: white; font-size: 9px; font-weight: 700;
          padding: 2px 6px; border-radius: 4px; white-space: nowrap;
        `;
        label.textContent = friend.display_name || friend.username || 'Friend';
        el.appendChild(label);

        el.addEventListener('click', () => {
          mapRef.current?.flyTo({ center: [friend.lng, friend.lat], zoom: 15, duration: 800 });
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([friend.lng, friend.lat])
          .addTo(m);

        friendMarkersRef.current[friend.user_id] = marker;
      });
    };

    if (m.loaded()) render();
    else m.once('load', render);
  }, [friendLocations]);

  /* ── Fix 3 — applyEventFilters ── */
  const applyEventFilters = useCallback((pin: any): boolean => {
    if (pin.type !== 'events') return true;
    const ef = eventsFilters;

    // Event type filter — check both event_types array and single type/subtype
    if (ef.filterEventTypes && ef.filterEventTypes.length > 0) {
      const pinTypes = [...(pin.event_types || []), pin.subtype, pin.event_type].filter(Boolean).map((t: string) => t.toLowerCase());
      const hasMatch = ef.filterEventTypes.some((ft: string) => pinTypes.includes(ft.toLowerCase()));
      if (!hasMatch) return false;
    }

    // Vehicle focus filter
    if (ef.filterVehicleFocus && ef.filterVehicleFocus !== 'all') {
      const pinFocus = pin.vehicle_focus || 'all_welcome';
      // specific_makes, event_style, vehicle_era handled by their own filters below
      if (!['specific_makes', 'event_style', 'vehicle_era'].includes(ef.filterVehicleFocus)) {
        if (pinFocus !== 'all_welcome' && pinFocus !== ef.filterVehicleFocus) return false;
      }
    }

    // Event style (meet style tags) filter
    if (ef.filterMeetStyles && ef.filterMeetStyles.length > 0) {
      const pinStyles = (pin.meet_style_tags || []).map((s: string) => s.toLowerCase());
      if (pinStyles.length > 0) {
        const hasMatch = ef.filterMeetStyles.some((s: string) => pinStyles.includes(s.toLowerCase()));
        if (!hasMatch) return false;
      }
    }

    // Free entry only
    if (ef.filterFreeOnly && !pin.is_free) return false;

    // Date filter — from quick date button (specificDate) or manual range
    if (ef.specificDate && pin.date_start) {
      const eventDay = new Date(pin.date_start).toDateString();
      const filterDay = new Date(ef.specificDate).toDateString();
      if (eventDay !== filterDay) return false;
    }
    if (ef.filterDateFrom && pin.date_start) {
      if (new Date(pin.date_start) < new Date(ef.filterDateFrom)) return false;
    }
    if (ef.filterDateTo && pin.date_start) {
      if (new Date(pin.date_start) > new Date(ef.filterDateTo + 'T23:59:59')) return false;
    }

    // Garage vehicle compatibility
    if (ef.filterGarageVehicle) {
      const v = ef.filterGarageVehicle;
      const vf = pin.vehicle_focus || 'all_welcome';
      if (vf === 'cars_only' && !['car', 'classic', 'van', 'other'].includes((v.vehicle_type || '').toLowerCase())) return false;
      if (vf === 'motorcycles_only' && (v.vehicle_type || '').toLowerCase() !== 'motorcycle') return false;
      if (vf === 'specific_makes') {
        const eventMakes: string[] = (pin.vehicle_brands || []).map((b: string) => b.toLowerCase());
        if (eventMakes.length > 0 && !eventMakes.includes((v.make || '').toLowerCase())) return false;
      }
      if (vf === 'vehicle_era' && v.year) {
        const pinYears: string[] = pin.specific_years || [];
        if (pinYears.length > 0) {
          const yr = parseInt(v.year);
          const hasMatch = pinYears.some((era: string) => {
            if (era === 'Pre 50s') return yr < 1950;
            if (era === 'Pre 60s') return yr < 1960;
            if (era === 'Pre 70s') return yr < 1970;
            if (era === 'Pre 80s') return yr < 1980;
            if (era === 'Pre 90s') return yr < 1990;
            if (era === 'Pre 00s') return yr < 2000;
            return true;
          });
          if (!hasMatch) return false;
        }
      }
      // event_style and all_welcome: show for any vehicle
    }

    // Specific brand filter
    if (ef.filterVehicleFocus === 'specific_makes' && ef.filterSpecificBrands && ef.filterSpecificBrands.length > 0) {
      const pinBrands = (pin.vehicle_brands || []).map((b: string) => b.toLowerCase());
      if (pinBrands.length > 0) {
        const hasMatch = ef.filterSpecificBrands.some((b: string) => pinBrands.some((pb: string) => pb.includes(b.toLowerCase()) || b.toLowerCase().includes(pb)));
        if (!hasMatch) return false;
      }
    }

    // Year range filter
    if (ef.specificYears && ef.specificYears.length > 0) {
      const pinYears: string[] = pin.specific_years || [];
      if (pinYears.length > 0) {
        const hasMatch = ef.specificYears.some((y: string) => pinYears.includes(y));
        if (!hasMatch) return false;
      }
    }

    // Distance filter
    const dist = ef.distance;
    if (typeof dist === 'number' && dist > 0 && userLat && userLng && pin.lat && pin.lng) {
      const distKm = haversineKm(userLat, userLng, Number(pin.lat), Number(pin.lng));
      const distMiles = distKm * 0.621371;
      if (distMiles > dist) return false;
    }

    return true;
  }, [eventsFilters, userLat, userLng]);

  /* ── Fix 4 — applyRouteFilters ── */
  const applyRouteFilters = useCallback((pin: any): boolean => {
    if (pin.type !== 'routes') return true;
    const rf = routesFilters;

    // Type filter
    if (rf.types.length > 0) {
      const routeType = pin.route_type || pin.subtype || '';
      if (routeType && !rf.types.includes(routeType)) return false;
    }

    // Difficulty filter
    if (rf.difficulty.length > 0) {
      const diff = pin.difficulty || '';
      if (diff && !rf.difficulty.includes(diff)) return false;
    }

    // Duration filter
    if (rf.duration) {
      const mins = Number(pin.duration_minutes) || 0;
      if ((rf.duration === 'lt60' || rf.duration === 'under-1h') && mins >= 60) return false;
      if ((rf.duration === '60to120' || rf.duration === '1-2h') && (mins < 60 || mins > 120)) return false;
      if ((rf.duration === '120to240' || rf.duration === '2-4h') && (mins < 120 || mins > 240)) return false;
      if ((rf.duration === 'gt240' || rf.duration === 'over-4h') && mins < 240) return false;
    }

    // Surface filter
    if (rf.surface.length > 0) {
      const surfaceType = pin.surface_type || '';
      if (surfaceType && !rf.surface.includes(surfaceType)) return false;
    }

    // Distance filter
    const rdist = typeof rf.distance === 'number' ? rf.distance : 0;
    if (rdist > 0 && userLat && userLng && pin.lat && pin.lng) {
      if (haversineKm(userLat, userLng, Number(pin.lat), Number(pin.lng)) * 0.621371 > rdist) return false;
    }

    return true;
  }, [routesFilters, userLat, userLng]);

  /* ── Fix 5 — applyServiceFilters ── */
  const applyServiceFilters = useCallback((pin: any): boolean => {
    if (pin.type !== 'services') return true;
    const sf = servicesFilters;

    // Type filter — check service_types array OR types array
    if (sf.types.length > 0) {
      const pinTypes: string[] = pin.service_types || pin.types || [];
      if (pinTypes.length > 0 && !sf.types.some((t: string) => pinTypes.includes(t))) return false;
    }

    // Open now filter
    if (sf.openNow && !pin.is_24_7) return false;

    // Distance filter
    const sdist = typeof sf.distance === 'number' ? sf.distance : 0;
    if (sdist > 0 && userLat && userLng && pin.lat && pin.lng) {
      if (haversineKm(userLat, userLng, Number(pin.lat), Number(pin.lng)) * 0.621371 > sdist) return false;
    }

    return true;
  }, [servicesFilters, userLat, userLng]);


  /* ── Render DOM markers: apply all filters + category ── */
  const renderMarkers = useCallback(() => {
    const m = mapRef.current;
    if (!m) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // No category selected — show empty map
    if (!activeCategory) return;

    // Filter from allPinsRef (full dataset), not context pins
    const source = allPinsRef.current.length > 0 ? allPinsRef.current : pins;

    // Category tab filter
    let visiblePins = source.filter(p => p.type === activeCategory);

    // Apply type-specific filters
    visiblePins = visiblePins.filter(pin =>
      applyEventFilters(pin) && applyRouteFilters(pin) && applyServiceFilters(pin),
    );

    // Search filter — match title against search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      visiblePins = visiblePins.filter(p => p.title?.toLowerCase().includes(q));
    }

    visiblePins.forEach(pin => {
      const lat = Number(pin.lat);
      const lng = Number(pin.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const type = String(pin.type || '').toLowerCase().trim();
      const color = PIN_COLORS[type] || '#d30d37';
      const pinFull = type === 'events' && pin.attendee_count && pin.max_attendees && Number(pin.attendee_count) >= Number(pin.max_attendees);

      const el = document.createElement('div');
      el.style.cssText = `width:20px;height:20px;border-radius:50%;background-color:${color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);cursor:pointer;${pinFull ? 'opacity:0.45;' : ''}`;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const handler = handlePinClickRef.current;
        if (handler) handler(pin);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(m);

      markersRef.current.push(marker);
    });
  }, [pins, activeCategory, searchQuery, applyEventFilters, applyRouteFilters, applyServiceFilters]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    if (m.loaded()) {
      renderMarkers();
    } else {
      m.once('load', renderMarkers);
    }
  }, [renderMarkers]);

  // Re-render markers when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mapRef.current) {
        mapRef.current.resize();
        setTimeout(() => refreshPins(), 300);
        setTimeout(() => renderMarkers(), 600);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [renderMarkers, refreshPins]);

  useEffect(() => {
    const handleFocus = () => {
      if (mapRef.current) {
        mapRef.current.resize();
        setTimeout(() => refreshPins(), 300);
        setTimeout(() => renderMarkers(), 600);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [renderMarkers, refreshPins]);

  // Re-render pins when switching back to discovery tab
  useEffect(() => {
    if (activeTab === 'discovery') {
      setTimeout(() => {
        if (mapRef.current) mapRef.current.resize();
      }, 100);
      setTimeout(() => refreshPins(), 300);
      setTimeout(() => renderMarkers(), 600);
    }
  }, [activeTab]);

  // Auto-refresh pin data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'discovery' && activeCategory) refreshPins();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeTab, activeCategory]);

  // Center map on newly published item
  useEffect(() => {
    const navState = location.state as { centerOn?: { lat: number; lng: number }; category?: string; showServiceId?: string; showEventId?: string; showRouteId?: string; refreshMap?: boolean } | null;
    if (!navState) return;

    const map = mapRef.current;

    if (navState.centerOn && map) {
      const { lat, lng } = navState.centerOn;
      map.flyTo({ center: [lng, lat], zoom: 14, duration: 1200 });
      if (navState.category) setActiveCategory(navState.category);
      setTimeout(() => refreshPins(), 1400);
    } else if (navState.refreshMap) {
      setTimeout(() => refreshPins(), 500);
    }

    if (navState.showServiceId) {
      const service = state.services.find(s => s.id === navState.showServiceId);
      if (service) {
        setSelectedDetail({ type: 'service', data: service });
        setActiveCategory('services');
      }
    }
    if (navState.showEventId) {
      const event = state.events.find(e => e.id === navState.showEventId);
      if (event) {
        setSelectedDetail({ type: 'event', data: event });
        setActiveCategory('events');
        if (event.lat && event.lng && map) {
          map.flyTo({ center: [event.lng, event.lat], zoom: 14, duration: 1500 });
        }
      }
    }
    if (navState.showRouteId) {
      const route = state.routes.find(r => r.id === navState.showRouteId);
      if (route) {
        setSelectedDetail({ type: 'route', data: route });
        setActiveCategory('routes');
        if (route.lat && route.lng && map) {
          map.flyTo({ center: [route.lng, route.lat], zoom: 14, duration: 1500 });
        }
      }
    }

    window.history.replaceState({}, '');
  }, [location.state]);

  const handleLocateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14, duration: 1500,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleMapTap = async (lngLat: { lng: number; lat: number }) => {
    if (isNavigating) return;
    const { lng, lat } = lngLat;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=1&types=address,poi,place`,
      );
      const data = await response.json();
      const placeName = data.features?.[0]?.place_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setTappedLocation({ lat, lng, name: placeName });
      setShowLocationPopup(true);
    } catch {
      setTappedLocation({ lat, lng, name: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      setShowLocationPopup(true);
    }
  };

  const handlePinClick = async (pin: MapPin) => {
    if (isNavigating) return;
    setShowLocationPopup(false);

    if (pin.type === 'events') {
      let event = state.events.find(e => e.id === pin.id);
      if (!event) {
        const { data } = await supabase.from('events').select('*').eq('id', pin.id).maybeSingle();
        if (data) {
          event = {
            id: data.id, title: data.title, description: data.description || '',
            eventType: data.type || '', type: data.type || '',
            date: data.date_start || '', startDate: data.date_start || '',
            date_start: data.date_start, date_end: data.date_end,
            location: data.location || '', locationName: data.location || '',
            lat: data.lat, lng: data.lng,
            createdBy: data.created_by || '', created_by: data.created_by || '',
            bannerImage: data.banner_url || '', banner_url: data.banner_url,
            vehicleTypes: data.vehicle_types || [],
            vehicleBrands: data.vehicle_brands || [], vehicle_brands: data.vehicle_brands || [],
            vehicleCategories: data.vehicle_categories || [],
            vehicleAges: data.vehicle_ages || [],
            maxAttendees: data.max_attendees, max_attendees: data.max_attendees,
            entryFee: data.is_free ? 'Free' : `£${data.entry_fee}`,
            entryFeeType: data.is_free ? 'free' : 'paid', entryFeeAmount: data.entry_fee,
            entry_fee: data.entry_fee, is_free: data.is_free,
            visibility: data.visibility || 'public', createdAt: data.created_at || '',
            is_ticketed: data.is_ticketed, ticket_price: data.ticket_price,
            meet_style_tags: data.meet_style_tags || [],
            vehicle_focus: data.vehicle_focus || 'all_welcome',
            event_rules: data.event_rules,
            what3words: data.what3words,
            attendee_count: data.attendee_count || 0,
            series_id: data.series_id,
            waitlist_enabled: data.waitlist_enabled,
            photos: data.photos || [],
          } as any;
        }
      }
      if (event) setSelectedDetail({ type: 'event', data: event });
    } else if (pin.type === 'routes') {
      let route = state.routes.find(r => r.id === pin.id);
      if (!route) {
        const { data } = await supabase.from('routes').select('*').eq('id', pin.id).maybeSingle();
        if (data) {
          route = {
            id: data.id, name: data.name, description: data.description || '',
            type: data.type || '', difficulty: data.difficulty || '',
            distance: data.distance_meters ? `${(data.distance_meters / 1000).toFixed(1)} km` : '',
            durationMinutes: data.duration_minutes, vehicleType: data.vehicle_type || '',
            surfaceType: data.surface_type || '', safetyTags: data.safety_tags || [],
            lat: data.lat, lng: data.lng, createdBy: data.created_by || '',
            rating: data.rating, polyline: data.geometry ? JSON.stringify(data.geometry) : null,
            visibility: data.visibility || 'public', createdAt: data.created_at || '',
            elevationGain: data.elevation_gain,
          } as any;
        }
      }
      if (route) setSelectedDetail({ type: 'route', data: route });
    } else if (pin.type === 'services') {
      let service = state.services.find(s => s.id === pin.id);
      if (!service) {
        const { data } = await supabase.from('services').select('*').eq('id', pin.id).maybeSingle();
        if (data) {
          service = {
            id: data.id, name: data.name, description: data.description || '',
            category: data.service_type || '', serviceTypes: data.types || [],
            address: data.address || '', phone: data.phone || '', website: data.website || '',
            rating: data.rating, lat: data.lat, lng: data.lng,
            createdBy: data.created_by || '', createdAt: data.created_at || '',
            is_24_7: data.is_24_7, is_emergency: data.is_emergency,
            cover_url: data.cover_url, tagline: data.tagline,
          } as any;
        }
      }
      if (service) setSelectedDetail({ type: 'service', data: service });
    }
  };

  /* ── Stable ref for handlePinClick so marker listeners never go stale ── */
  const handlePinClickRef = useRef<(pin: any) => void>(() => {});
  useEffect(() => {
    handlePinClickRef.current = handlePinClick;
  });

  const handleCloseDetail = () => setSelectedDetail(null);

  const handleSearchSelectPin = useCallback((id: string, lat: number, lng: number, type: string) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1000 });
    }
    setActiveCategory(type);
    setTimeout(() => {
      const pin = allPinsRef.current.find(p => p.id === id);
      if (pin) handlePinClick(pin);
    }, 1200);
  }, [handlePinClick]);

  const handleViewFull = (type: string, id: string) => {
    setSelectedDetail(null);
    navigate(`/${type}/${id}`);
  };

  /* ── Fix 8 — Filter badge count ── */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    // Events
    if (eventsFilters.filterEventTypes.length > 0) count++;
    if (eventsFilters.filterVehicleFocus && eventsFilters.filterVehicleFocus !== 'all') count++;
    if (eventsFilters.filterMeetStyles.length > 0) count++;
    if (eventsFilters.filterFreeOnly) count++;
    if (eventsFilters.filterDateFrom || eventsFilters.filterDateTo) count++;
    if (eventsFilters.filterGarageVehicleId) count++;
    // Routes
    if (routesFilters.types.length > 0) count++;
    if (routesFilters.difficulty.length > 0) count++;
    if (routesFilters.duration) count++;
    if (routesFilters.surface.length > 0) count++;
    // Services
    if (servicesFilters.types.length > 0) count++;
    if (servicesFilters.openNow) count++;
    return count;
  }, [eventsFilters, routesFilters, servicesFilters]);

  const selectedRouteId = selectedDetail?.type === 'route' ? selectedDetail.data.id : null;
  const selectedRoutePolyline = selectedDetail?.type === 'route' ? (selectedDetail.data.polyline || null) : null;

  if (activeTab !== 'discovery') {
    return (
      <div className="mobile-container">
        {activeTab === 'community' && <CommunityTab />}
        {activeTab === 'marketplace' && <MarketplaceTab />}
        {activeTab === 'you' && <YouTab />}
        {/* Mobile: original bottom nav bar. Desktop: floating pill nav */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="hidden md:block">
          <FloatingMapNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container !overflow-visible" style={{ backgroundColor: 'hsl(var(--background-warm))' }}>
      <style>{`
        @keyframes friend-pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
        .mapboxgl-marker { z-index: 10 !important; }
      `}</style>
      <MapView
        onMapTap={(lngLat) => {
          handleMapTap(lngLat);
        }}
        isDimmed={false}
        mapStyle={mapStyle}
        onMapReady={(m) => {
          mapRef.current = m;
          refreshPins();
        }}
        onMoveEnd={() => {
          if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
          moveTimerRef.current = setTimeout(() => refreshPins(), 500);
        }}
      />

      <RouteLayer map={mapRef.current} />
      <RoutePreviewLayer map={mapRef.current} polyline={selectedRoutePolyline} routeId={selectedRouteId} />

      {/* ═══ MOBILE: Original full-width header ═══ */}
      {!isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-30 md:hidden pointer-events-none">
          <div className="pointer-events-auto backdrop-blur-xl border-b border-border/50 safe-top" style={{ backgroundColor: 'hsla(60, 31%, 93%, 0.95)' }}>
            <div className="px-3 pt-2 flex items-center gap-2">
              <div className="h-10 w-24 flex-shrink-0 flex items-center justify-center rounded-xl border border-black/20 shadow-sm overflow-hidden" style={{ backgroundColor: '#f3f3e8' }}>
                <img src={revnetLogo} alt="RevNet" className="h-full w-full object-contain scale-[2] translate-y-[3px]" />
              </div>
              <UniversalSearch onSelectPin={handleSearchSelectPin} variant="mobile" />
            </div>
            <div className="flex items-center justify-around py-2 px-3">
              <CategoryChips activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ DESKTOP: Floating search pill ═══ */}
      {!isNavigating && (
        <div className="hidden md:block absolute top-4 left-1/2 -translate-x-1/2 min-w-[520px] max-w-[640px] pointer-events-none" style={{ zIndex: 10000 }}>
          <div
            className="flex items-center gap-2 px-4 py-2 pointer-events-auto"
            style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', backdropFilter: 'blur(12px)' }}
          >
            <img src={revnetLogo} alt="RevNet" className="h-7 w-auto object-contain flex-shrink-0" />
            <UniversalSearch onSelectPin={handleSearchSelectPin} variant="desktop" />
          </div>
        </div>
      )}

      {/* ═══ DESKTOP: Floating category chips (no container) ═══ */}
      {!isNavigating && (
        <div
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-[320px]"
          style={{ top: '72px', zIndex: 9999, pointerEvents: 'none' }}
        >
          <div style={{ pointerEvents: 'auto', width: '100%' }}>
            <CategoryChips activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
        </div>
      )}

      {/* ═══ UNIFIED: Filter panels — works on both mobile and desktop ═══ */}
      {!isNavigating && activeCategory && (
        <div className="absolute left-0 right-0 z-30 md:left-1/2 md:-translate-x-1/2 md:w-[600px] pointer-events-none" style={{ top: '120px' }}>
          <div className="px-3 pt-2 pointer-events-auto">
            {activeCategory === 'events' && <EventsFiltersPanel filters={eventsFilters} onFiltersChange={setEventsFilters} />}
            {activeCategory === 'routes' && <RoutesFiltersPanel filters={routesFilters} onFiltersChange={setRoutesFilters} />}
            {activeCategory === 'services' && <ServicesFiltersPanel filters={servicesFilters} onFiltersChange={setServicesFilters} />}
          </div>
        </div>
      )}

      {/* ═══ Map utility buttons ═══ */}
      {!isNavigating && (
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-2.5">
          <HelpButton onClick={() => setIsHelpOpen(true)} />
          <LocationButton onClick={handleLocateUser} />
        </div>
      )}

      <HelpSheet open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {/* Hint when no category selected */}
      {!activeCategory && !isNavigating && (
        <div className="absolute top-[120px] md:top-[130px] left-0 right-0 z-20 flex justify-center pointer-events-none safe-top">
          <div className="bg-white/90 backdrop-blur-sm rounded-[20px] px-4 py-2 shadow-sm border border-border/30">
            <p className="text-[13px] text-muted-foreground">Select Events, Routes or Services to explore</p>
          </div>
        </div>
      )}

      {!isNavigating && selectedDetail && (
        <DetailBottomSheet item={selectedDetail} onClose={handleCloseDetail} onViewFull={handleViewFull} />
      )}

      {/* Tap-to-navigate popup */}
      {showLocationPopup && tappedLocation && !isNavigating && (
        <div className="absolute bottom-24 left-3 right-3 z-40 animate-fade-up pointer-events-none">
          <div className="pointer-events-auto bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 px-4 py-3 flex items-center gap-3">
            <span className="text-xl flex-shrink-0">📍</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{tappedLocation.name}</p>
              <p className="text-[10px] text-muted-foreground">Tap Navigate to get directions</p>
            </div>
            <button
              onClick={() => {
                setShowLocationPopup(false);
                navigate('/navigation', {
                  state: {
                    destLat: tappedLocation.lat,
                    destLng: tappedLocation.lng,
                    destTitle: tappedLocation.name,
                    geometry: null,
                  },
                });
              }}
              className="bg-foreground text-background text-xs font-medium px-3 py-2 rounded-xl flex-shrink-0"
            >
              Navigate
            </button>
            <button onClick={() => setShowLocationPopup(false)} className="text-muted-foreground text-xl flex-shrink-0 leading-none">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {isNavigating && <NavigationHUD />}

      {/* Mobile: original bottom nav bar */}
      {!isNavigating && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      {/* Desktop: floating pill nav */}
      {!isNavigating && (
        <div className="hidden md:block pointer-events-none">
          <div className="pointer-events-auto"><FloatingMapNav activeTab={activeTab} onTabChange={setActiveTab} /></div>
        </div>
      )}
    </div>
  );
};

export default Home;
