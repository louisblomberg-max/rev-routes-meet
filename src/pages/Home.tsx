import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { useNavigate } from 'react-router-dom';
import revnetLogoNew from '@/assets/revnet-logo-new.png';
import MapView from '@/components/MapView';

import CategoryChips from '@/components/CategoryChips';
import PlaceSheet, { PlaceItem } from '@/components/PlaceSheet';
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
import NavigationHUD from '@/components/NavigationHUD';
import { mockEvents, mockRoutes, mockServices, mockClubs } from '@/data/mockData';
import { MapPin } from '@/contexts/MapContext';
import { useNavigation } from '@/contexts/NavigationContext';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

const Home = () => {
  const navigate = useNavigate();
  const { status: navStatus } = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>('discovery');
  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [eventsFilters, setEventsFilters] = useState<EventsFilterState>({
    distance: 25,
    types: [],
    dateFilter: null,
    specificDate: undefined,
    vehicleTypes: [],
    eventSize: null,
    entryFee: null,
    clubHosted: false,
  });
  const [routesFilters, setRoutesFilters] = useState<RoutesFilterState>({
    distance: 25,
    types: [],
    difficulty: [],
    duration: null,
    surface: [],
    minRating: null,
  });
  const [servicesFilters, setServicesFilters] = useState<ServicesFilterState>({
    distance: 25,
    types: [],
    minRating: null,
    openNow: false,
  });
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const handleLocateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
          duration: 1500,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePinClick = (pin: MapPin) => {
    // Close any existing place sheet when navigating
    if (isNavigating) return;

    if (pin.type === 'events') {
      const event = mockEvents.find(e => e.id === pin.id);
      if (event) {
        setSelectedPlace({
          type: 'event',
          id: event.id,
          title: event.title,
          lat: pin.lat,
          lng: pin.lng,
          date: event.date,
          subtitle: event.location,
          distance: '2.5 mi',
        });
      }
    } else if (pin.type === 'routes') {
      const route = mockRoutes.find(r => r.id === pin.id);
      if (route) {
        setSelectedPlace({
          type: 'route',
          id: route.id,
          title: route.name,
          lat: pin.lat,
          lng: pin.lng,
          rating: route.rating,
          subtitle: `${route.distance} · ${route.type}`,
          distance: route.distance,
        });
      }
    } else if (pin.type === 'services') {
      const service = mockServices.find(s => s.id === pin.id);
      if (service) {
        setSelectedPlace({
          type: 'service',
          id: service.id,
          title: service.name,
          lat: pin.lat,
          lng: pin.lng,
          rating: service.rating,
          subtitle: service.address,
          distance: service.distance,
          isOpen: service.isOpen,
        });
      }
    } else if (pin.type === 'clubs') {
      const club = mockClubs.find(c => c.id === pin.id);
      if (club) {
        setSelectedPlace({
          type: 'club',
          id: club.id,
          title: club.name,
          lat: pin.lat,
          lng: pin.lng,
          subtitle: club.location,
        });
      }
    }
  };

  const handleClosePlace = () => {
    setSelectedPlace(null);
  };

  const handleViewFull = (type: string, id: string) => {
    setSelectedPlace(null);
    navigate(`/${type}/${id}`);
  };

  const selectedRouteId = selectedPlace?.type === 'route' ? selectedPlace.id : null;
  const activeCategories = activeCategory ? [activeCategory] : [];

  // Non-discovery tabs
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
    <div className="mobile-container">
      {/* Map Background */}
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

      {/* Navigation Route Layer */}
      <RouteLayer map={mapRef.current} />

      {/* Top Bar — hidden during navigation */}
      {!isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="bg-card/95 backdrop-blur-xl border-b border-border/50 safe-top">
            <div className="max-w-md mx-auto px-3 pt-2 flex items-center gap-2">
              <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-xl border border-white/60 shadow-sm overflow-hidden">
                <img src={revnetLogoNew} alt="RevNet" className="h-9 w-9 object-contain" />
              </div>
              <div className="h-10 flex-1 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-xl px-3 border border-white/60 shadow-sm">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search events, routes, services..."
                  className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="max-w-md mx-auto flex items-center justify-around py-2 px-3">
              <CategoryChips
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
          </div>

          {activeCategory && (
            <div className="px-3 pt-2">
              {activeCategory === 'events' && (
                <EventsFiltersPanel filters={eventsFilters} onFiltersChange={setEventsFilters} />
              )}
              {activeCategory === 'routes' && (
                <RoutesFiltersPanel filters={routesFilters} onFiltersChange={setRoutesFilters} />
              )}
              {activeCategory === 'services' && (
                <ServicesFiltersPanel filters={servicesFilters} onFiltersChange={setServicesFilters} />
              )}
            </div>
          )}

          <div className="px-3 pt-2 flex justify-end">
            <MapStyleButton currentStyle={mapStyle} onStyleChange={setMapStyle} />
          </div>
        </div>
      )}

      {/* Right-side controls stack — hidden during navigation */}
      {!isNavigating && (
        <div className="absolute right-3 bottom-56 z-20 flex flex-col items-center gap-2.5">
          <HelpButton onClick={() => setIsHelpOpen(true)} />
          <LocationButton onClick={handleLocateUser} />
        </div>
      )}

      {/* Help Sheet */}
      <HelpSheet open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {/* Place Sheet (marker tap) — hidden during navigation */}
      {!isNavigating && (
        <PlaceSheet
          item={selectedPlace}
          onClose={handleClosePlace}
          onViewFull={handleViewFull}
        />
      )}

      {/* Navigation HUD (previewing + navigating) */}
      <NavigationHUD />

      {/* Bottom Navigation — hidden during navigation */}
      {!isNavigating && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};

export default Home;
