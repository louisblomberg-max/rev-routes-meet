import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, X, RefreshCw } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import revnetLogoNew from '@/assets/revnet-logo-header.png';
import MapView from '@/components/MapView';

import CategoryChips from '@/components/CategoryChips';
import DetailBottomSheet, { DetailItem } from '@/components/discovery/DetailBottomSheet';
import BottomNavigation from '@/components/BottomNavigation';
import YouTab from '@/components/YouTab';
import CommunityTab from '@/components/CommunityTab';
import MarketplaceTab from '@/components/MarketplaceTab';
import LocationButton from '@/components/LocationButton';
import HelpButton from '@/components/HelpButton';
import HelpSheet from '@/components/HelpSheet';
import MapStyleButton, { MapStyle } from '@/components/MapStyleButton';
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
  event: '#CC2222',
  events: '#CC2222',
  route: '#185FA5',
  routes: '#185FA5',
  service: '#C2700A',
  services: '#C2700A',
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status: navStatus } = useNavigation();
  const { state } = useData();
  const { user: authUser } = useAuth();
  const { pins, setPins, setIsLoadingPins } = useMap();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTabState] = useState<Tab>(tabParam && ['discovery', 'community', 'marketplace', 'you'].includes(tabParam) ? tabParam : 'discovery');

  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    if (tab === 'discovery') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab }, { replace: true });
    }
  };
  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing' || navStatus === 'arrived';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<DetailItem | null>(null);
  const [eventsFilters, setEventsFilters] = useState<EventsFilterState>({
    distance: 25, types: [], dateFilter: null, specificDate: undefined,
    vehicleTypes: [], vehicleBrands: [], vehicleCategories: [], vehicleAges: [], eventSize: null, entryFee: null, clubHosted: false,
    filterEventTypes: [], filterVehicleFocus: 'all', filterMeetStyles: [], filterFreeOnly: false,
    filterDateFrom: '', filterDateTo: '', filterGarageVehicleId: null, filterGarageVehicle: null,
  });
  const [routesFilters, setRoutesFilters] = useState<RoutesFilterState>({
    distance: 25, types: [], difficulty: [], duration: null, surface: [],
  });
  const [servicesFilters, setServicesFilters] = useState<ServicesFilterState>({
    distance: 25, types: [], openNow: false,
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Tap-to-navigate state
  const [tappedLocation, setTappedLocation] = useState<TappedLocation | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  // Friend live locations
  const [friendLocations, setFriendLocations] = useState<Record<string, FriendLocation>>({});
  const friendMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});

  const refreshPins = useCallback(async () => {
    const m = mapRef.current;
    if (!m) return;
    if (!m.loaded()) {
      m.once('load', () => refreshPins());
      return;
    }
    const bounds = m.getBounds();
    if (!bounds) return;

    console.log('[Map] Fetching pins — activeCategory:', activeCategory || 'all');
    setIsLoadingPins(true);
    try {
      const { data, error } = await supabase.rpc('get_pins_in_bounds', {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        categories: ['events', 'routes', 'services'],
      });
      if (error) {
        console.error('[Map] RPC error:', error);
      } else if (data) {
        console.log('[Map] Raw pins from RPC:', data.length);
        const normalizeType = (t: string) => {
          if (t === 'event') return 'events';
          if (t === 'route') return 'routes';
          if (t === 'service') return 'services';
          return t;
        };
        let mapped = data.map((pin: any) => {
          const pinData = typeof pin.data === 'string' ? JSON.parse(pin.data) : (pin.data || {});
          return {
            id: pin.id,
            type: normalizeType(pin.type),
            lat: Number(pin.lat),
            lng: Number(pin.lng),
            title: pin.title,
            ...pinData,
          };
        });
        // Client-side category filter
        if (activeCategory) {
          mapped = mapped.filter((p: any) => p.type === activeCategory);
        }
        console.log('[Map] Filtered pins:', mapped.length);
        setPins(mapped);
      }
    } catch (err) {
      console.error('[Map] fetchPins error:', err);
    } finally {
      setIsLoadingPins(false);
    }
  }, [activeCategory, setPins, setIsLoadingPins]);

  // Realtime subscriptions for new content
  useEffect(() => {
    const channel = supabase
      .channel('map-realtime-inserts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, () => {
        console.log('[Map] New event added — refreshing pins');
        refreshPins();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'routes' }, () => {
        console.log('[Map] New route added — refreshing pins');
        refreshPins();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'services' }, () => {
        console.log('[Map] New service added — refreshing pins');
        refreshPins();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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

  // Re-fetch pins when category changes
  useEffect(() => {
    if (mapRef.current) {
      refreshPins();
    }
  }, [activeCategory, refreshPins]);

  // Event filter function
  const applyEventFilters = useCallback((pin: any): boolean => {
    if (pin.type !== 'events') return true;
    const d = pin;
    // The event sub-type (meets, shows, etc.) is spread from pin.data into the pin object as 'event_type' or 'type' from the RPC data.
    // pin.type is always 'events' (the category). The actual sub-type comes from the RPC data field.
    const eventSubType = d.event_type || d.subtype || '';

    const ef = eventsFilters;
    if (ef.filterEventTypes.length > 0 && eventSubType && !ef.filterEventTypes.includes(eventSubType)) return false;
    if (ef.filterVehicleFocus !== 'all') {
      if (ef.filterVehicleFocus === 'cars_only' && d.vehicle_focus !== 'cars_only') return false;
      if (ef.filterVehicleFocus === 'motorcycles_only' && d.vehicle_focus !== 'motorcycles_only') return false;
    }
    if (ef.filterMeetStyles.length > 0) {
      const eventTags: string[] = d.meet_style_tags || [];
      if (!ef.filterMeetStyles.some((tag: string) => eventTags.includes(tag))) return false;
    }
    if (ef.filterFreeOnly && !d.is_free) return false;
    if (ef.filterDateFrom && d.date_start) {
      if (new Date(d.date_start) < new Date(ef.filterDateFrom)) return false;
    }
    if (ef.filterDateTo && d.date_start) {
      if (new Date(d.date_start) > new Date(ef.filterDateTo + 'T23:59:59')) return false;
    }
    if (ef.filterGarageVehicle) {
      const vf = d.vehicle_focus || 'all_welcome';
      if (vf === 'all_welcome') return true;
      if (vf === 'cars_only' && ef.filterGarageVehicle.vehicle_type !== 'car') return false;
      if (vf === 'motorcycles_only' && ef.filterGarageVehicle.vehicle_type !== 'motorcycle') return false;
      if (vf === 'specific_makes') {
        const eventMakes: string[] = (d.vehicle_brands || []).map((m: string) => m.toLowerCase());
        if (!eventMakes.includes(ef.filterGarageVehicle.make.toLowerCase())) return false;
      }
    }
    return true;
  }, [eventsFilters]);

  // Route filter function
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
      const mins = pin.duration_minutes || 0;
      if (rf.duration === 'under-30' && mins >= 30) return false;
      if (rf.duration === '30-60' && (mins < 30 || mins > 60)) return false;
      if (rf.duration === '1-2h' && (mins < 60 || mins > 120)) return false;
      if (rf.duration === '2h+' && mins < 120) return false;
    }
    // Surface filter
    if (rf.surface.length > 0) {
      const surfaceType = pin.surface_type || '';
      if (surfaceType && !rf.surface.includes(surfaceType)) return false;
    }
    return true;
  }, [routesFilters]);

  // Service filter function
  const applyServiceFilters = useCallback((pin: any): boolean => {
    if (pin.type !== 'services') return true;
    const sf = servicesFilters;
    // Type filter
    if (sf.types.length > 0) {
      const serviceType = pin.service_type || pin.subtype || '';
      if (serviceType && !sf.types.includes(serviceType)) return false;
    }
    // Open now filter — only apply if the pin has opening hours data
    if (sf.openNow && pin.is_24_7 === false && !pin.is_open) return false;
    return true;
  }, [servicesFilters]);

  // Render DOM markers for pins
  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    const doRender = () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      const visiblePins = pins.filter(pin => applyEventFilters(pin) && applyRouteFilters(pin) && applyServiceFilters(pin));
      console.log('[Map] Rendering', visiblePins.length, 'of', pins.length, 'pins as DOM markers (event+route+service filters)');

      visiblePins.forEach(pin => {
        const lat = Number(pin.lat);
        const lng = Number(pin.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const type = String(pin.type || '').toLowerCase().trim();
        const color = PIN_COLORS[type] || '#CC2222';

        const el = document.createElement('div');
        el.style.cssText = `
          width: 16px; height: 16px;
          background-color: ${color}; border: 2.5px solid white;
          border-radius: 50%; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        `;

        el.addEventListener('mouseenter', () => {
          el.style.borderColor = color;
          el.style.boxShadow = '0 3px 12px rgba(0,0,0,0.5)';
        });
        el.addEventListener('mouseleave', () => {
          el.style.borderColor = 'white';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
        });

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          handlePinClick(pin);
        });

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .addTo(m);

        markersRef.current.push(marker);
      });

      console.log('[Map] Rendered', markersRef.current.length, 'markers');
    };

    if (m.loaded()) {
      doRender();
    } else {
      m.once('load', doRender);
    }
  }, [pins, applyEventFilters]);

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
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14, duration: 1500,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapTap = async (lngLat: { lng: number; lat: number }) => {
    if (isNavigating) return;
    const { lng, lat } = lngLat;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=1&types=address,poi,place`
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
            eventType: data.type || '', date: data.date_start || '', startDate: data.date_start || '',
            location: data.location || '', locationName: data.location || '',
            lat: data.lat, lng: data.lng, createdBy: data.created_by || '',
            bannerImage: data.banner_url || '', vehicleTypes: data.vehicle_types || [],
            vehicleBrands: data.vehicle_brands || [], vehicleCategories: data.vehicle_categories || [],
            vehicleAges: data.vehicle_ages || [], maxAttendees: data.max_attendees,
            entryFee: data.is_free ? 'Free' : `£${data.entry_fee}`,
            entryFeeType: data.is_free ? 'free' : 'paid', entryFeeAmount: data.entry_fee,
            visibility: data.visibility || 'public', createdAt: data.created_at || '',
            is_ticketed: data.is_ticketed, ticket_price: data.ticket_price,
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

  const handleCloseDetail = () => setSelectedDetail(null);

  const handleViewFull = (type: string, id: string) => {
    setSelectedDetail(null);
    navigate(`/${type}/${id}`);
  };

  const selectedRouteId = selectedDetail?.type === 'route' ? selectedDetail.data.id : null;
  const selectedRoutePolyline = selectedDetail?.type === 'route' ? (selectedDetail.data.polyline || null) : null;
  const activeCategories = activeCategory ? [activeCategory] : [];

  if (activeTab !== 'discovery') {
    return (
      <div className="mobile-container">
        {activeTab === 'community' && <CommunityTab />}
        {activeTab === 'marketplace' && <MarketplaceTab />}
        {activeTab === 'you' && <YouTab />}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="mobile-container" style={{ backgroundColor: 'hsl(var(--background-warm))' }}>
      <style>{`
        @keyframes friend-pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
        }
      `}</style>
      <MapView
        onMapTap={(lngLat) => {
          // Check if we clicked near a marker — if so, ignore
          // The marker click handlers use stopPropagation so this only fires for empty areas
          handleMapTap(lngLat);
        }}
        isDimmed={false}
        mapStyle={mapStyle}
        onMapReady={(m) => {
          console.log('[Home] Map ready, fetching pins');
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

      {!isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="backdrop-blur-xl border-b border-border/50 safe-top" style={{ backgroundColor: 'hsla(60, 31%, 93%, 0.95)' }}>
            <div className="max-w-md mx-auto px-3 pt-2 flex items-center gap-2">
              <div className="h-10 w-24 flex-shrink-0 flex items-center justify-center rounded-xl border border-black/20 shadow-sm overflow-hidden" style={{ backgroundColor: '#f3f3e8' }}>
                <img src={revnetLogoNew} alt="RevNet" className="h-full w-full object-contain scale-[2] translate-y-[3px]" />
              </div>
              <div className="h-10 flex-1 min-w-0 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-xl px-3 border border-black/20 shadow-sm">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search events, routes, services..."
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="max-w-md mx-auto flex items-center justify-around py-2 px-3">
              <CategoryChips activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </div>
          </div>

          {activeCategory && (
            <div className="px-3 pt-2">
              {activeCategory === 'events' && <EventsFiltersPanel filters={eventsFilters} onFiltersChange={setEventsFilters} />}
              {activeCategory === 'routes' && <RoutesFiltersPanel filters={routesFilters} onFiltersChange={setRoutesFilters} />}
              {activeCategory === 'services' && <ServicesFiltersPanel filters={servicesFilters} onFiltersChange={setServicesFilters} />}
            </div>
          )}

          <div className="px-3 pt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                console.log('[Map] Manual refresh triggered');
                refreshPins();
              }}
              className="bg-white/90 backdrop-blur-md border border-border/50 rounded-xl px-3 py-2 text-xs font-medium shadow-sm flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh pins
            </button>
            <MapStyleButton currentStyle={mapStyle} onStyleChange={setMapStyle} />
          </div>
        </div>
      )}

      {!isNavigating && (
        <div className="absolute right-3 bottom-56 z-20 flex flex-col items-center gap-2.5">
          <HelpButton onClick={() => setIsHelpOpen(true)} />
          <LocationButton onClick={handleLocateUser} />
        </div>
      )}


      <HelpSheet open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {!isNavigating && (
        <DetailBottomSheet item={selectedDetail} onClose={handleCloseDetail} onViewFull={handleViewFull} />
      )}

      {/* Tap-to-navigate popup */}
      {showLocationPopup && tappedLocation && !isNavigating && (
        <div className="absolute bottom-24 left-3 right-3 z-40 animate-fade-up">
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 px-4 py-3 flex items-center gap-3">
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

      <NavigationHUD />

      {!isNavigating && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};

export default Home;
