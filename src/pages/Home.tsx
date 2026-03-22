import { useRef, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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
import { MapPin } from '@/contexts/MapContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { useData } from '@/contexts/DataContext';
import { useMapItems } from '@/hooks/useMapItems';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status: navStatus } = useNavigation();
  const { state } = useData();
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

  // Bridge DataContext → MapContext pins
  useMapItems();

  // Center map on newly published item or open a specific service (via navigation state)
  useEffect(() => {
    const navState = location.state as { centerOn?: { lat: number; lng: number }; category?: string; showServiceId?: string; showEventId?: string; showRouteId?: string } | null;
    if (navState?.centerOn && mapRef.current) {
      const { lat, lng } = navState.centerOn;
      mapRef.current.flyTo({ center: [lng, lat], zoom: 14, duration: 1500 });
      if (navState.category) {
        setActiveCategory(navState.category);
      }
    }
    if (navState?.showServiceId) {
      const service = state.services.find(s => s.id === navState.showServiceId);
      if (service) {
        setSelectedDetail({ type: 'service', data: service });
        setActiveCategory('services');
      }
    }
    if (navState?.showEventId) {
      const event = state.events.find(e => e.id === navState.showEventId);
      if (event) {
        setSelectedDetail({ type: 'event', data: event });
        setActiveCategory('events');
        if (event.lat && event.lng && mapRef.current) {
          mapRef.current.flyTo({ center: [event.lng, event.lat], zoom: 14, duration: 1500 });
        }
      }
    }
    if (navState?.showRouteId) {
      const route = state.routes.find(r => r.id === navState.showRouteId);
      if (route) {
        setSelectedDetail({ type: 'route', data: route });
        setActiveCategory('routes');
        if (route.lat && route.lng && mapRef.current) {
          mapRef.current.flyTo({ center: [route.lng, route.lat], zoom: 14, duration: 1500 });
        }
      }
    }
    if (navState) {
      window.history.replaceState({}, '');
    }
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

  const handlePinClick = (pin: MapPin) => {
    if (isNavigating) return;

    if (pin.type === 'events') {
      const event = state.events.find(e => e.id === pin.id);
      if (event) setSelectedDetail({ type: 'event', data: event });
    } else if (pin.type === 'routes') {
      const route = state.routes.find(r => r.id === pin.id);
      if (route) setSelectedDetail({ type: 'route', data: route });
    } else if (pin.type === 'services') {
      const service = state.services.find(s => s.id === pin.id);
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
      <MapView
        activeCategories={activeCategories}
        onPinClick={handlePinClick}
        selectedRouteId={selectedRouteId}
        showEmptyPrompt={false}
        isDimmed={false}
        markerOpacity={isNavigating ? 0.3 : 1}
        eventsFilters={eventsFilters}
        routesFilters={routesFilters}
        servicesFilters={servicesFilters}
        mapStyle={mapStyle}
        onMapReady={(m) => { mapRef.current = m; }}
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

          <div className="px-3 pt-2 flex justify-end">
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

      <NavigationHUD />

      {!isNavigating && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};

export default Home;
