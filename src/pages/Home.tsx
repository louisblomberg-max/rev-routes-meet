import { useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import MapView from '@/components/MapView';
import CategoryChips from '@/components/CategoryChips';
import ItemDetailSheet, { SelectedItem } from '@/components/ItemDetailSheet';
import BottomNavigation from '@/components/BottomNavigation';
import YouTab from '@/components/YouTab';
import CommunityTab from '@/components/CommunityTab';
import MarketplaceTab from '@/components/MarketplaceTab';
import LocationButton from '@/components/LocationButton';
import HelpButton from '@/components/HelpButton';
import FloatingActionButton from '@/components/FloatingActionButton';
import HelpSheet from '@/components/HelpSheet';
import MapStyleButton, { MapStyle } from '@/components/MapStyleButton';
import EventsFiltersPanel, { EventsFilterState } from '@/components/EventsFiltersPanel';
import RoutesFiltersPanel, { RoutesFilterState } from '@/components/RoutesFiltersPanel';
import ServicesFiltersPanel, { ServicesFilterState } from '@/components/ServicesFiltersPanel';
import RouteLayer from '@/components/Map/RouteLayer';
import NavigationSheet from '@/components/NavigationSheet';
import { mockEvents, mockRoutes, mockServices, mockClubs } from '@/data/mockData';
import { MapPin } from '@/contexts/MapContext';
import { useNavigation } from '@/contexts/NavigationContext';
import revnetLogoDark from '@/assets/revnet-logo-dark.png';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

const Home = () => {
  const navigate = useNavigate();
  const { status: navStatus } = useNavigation();
  const [activeTab, setActiveTab] = useState<Tab>('discovery');
  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
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

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    if (!activeCategory) return 0;
    let count = 0;
    if (activeCategory === 'events') {
      if (eventsFilters.types.length) count += eventsFilters.types.length;
      if (eventsFilters.dateFilter) count++;
      if (eventsFilters.vehicleTypes.length) count += eventsFilters.vehicleTypes.length;
      if (eventsFilters.eventSize) count++;
      if (eventsFilters.entryFee) count++;
      if (eventsFilters.clubHosted) count++;
      if (typeof eventsFilters.distance !== 'number' || eventsFilters.distance !== 25) count++;
    } else if (activeCategory === 'routes') {
      if (routesFilters.types.length) count += routesFilters.types.length;
      if (routesFilters.difficulty.length) count += routesFilters.difficulty.length;
      if (routesFilters.duration) count++;
      if (routesFilters.surface.length) count += routesFilters.surface.length;
      if (routesFilters.minRating) count++;
      if (typeof routesFilters.distance !== 'number' || routesFilters.distance !== 25) count++;
    } else if (activeCategory === 'services') {
      if (servicesFilters.types.length) count += servicesFilters.types.length;
      if (servicesFilters.minRating) count++;
      if (servicesFilters.openNow) count++;
      if (typeof servicesFilters.distance !== 'number' || servicesFilters.distance !== 25) count++;
    }
    return count;
  }, [activeCategory, eventsFilters, routesFilters, servicesFilters]);

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
    if (pin.type === 'events') {
      const event = mockEvents.find(e => e.id === pin.id);
      if (event) {
        setSelectedItem({
          type: 'event',
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          vehicleType: event.vehicleType,
          eventType: event.eventType,
          attendees: event.attendees,
        });
      }
    } else if (pin.type === 'routes') {
      const route = mockRoutes.find(r => r.id === pin.id);
      if (route) {
        setSelectedItem({
          type: 'route',
          id: route.id,
          name: route.name,
          distance: route.distance,
          routeType: route.type,
          vehicleType: route.vehicleType,
          rating: route.rating,
        });
      }
    } else if (pin.type === 'services') {
      const service = mockServices.find(s => s.id === pin.id);
      if (service) {
        setSelectedItem({
          type: 'service',
          id: service.id,
          name: service.name,
          category: service.category,
          serviceTypes: service.serviceTypes,
          rating: service.rating,
          distance: service.distance,
          reviewCount: service.reviewCount,
          openingHours: service.openingHours,
          phone: service.phone,
          address: service.address,
          isOpen: service.isOpen,
          priceRange: service.priceRange,
        });
      }
    } else if (pin.type === 'clubs') {
      const club = mockClubs.find(c => c.id === pin.id);
      if (club) {
        setSelectedItem({
          type: 'club',
          id: club.id,
          name: club.name,
          location: club.location,
          members: club.members,
        });
      }
    }
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const handleViewFull = (type: string, id: string) => {
    navigate(`/${type}/${id}`);
  };

  const selectedRouteId = selectedItem?.type === 'route' ? selectedItem.id : null;
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
        isDimmed={isNavigating}
        markerOpacity={isNavigating ? 0.3 : 1}
        eventsFilters={eventsFilters}
        routesFilters={routesFilters}
        servicesFilters={servicesFilters}
        mapStyle={mapStyle}
        onMapReady={(m) => { mapRef.current = m; }}
      />

      {/* Navigation Route Layer */}
      <RouteLayer map={mapRef.current} />

      {/* Top gradient overlay for readability */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 via-black/20 to-transparent z-20 pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-6 pt-3 safe-top">
        {/* Centered Logo */}
        <div className="flex justify-center">
          <img 
            src={revnetLogoDark} 
            alt="RevNet" 
            className="h-9 w-auto"
          />
        </div>

        {/* Segmented Control - centered */}
        <div className="flex justify-center mt-4">
          <CategoryChips 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Active Filter Chip */}
        {activeFilterCount > 0 && activeCategory && (
          <div className="flex justify-center mt-3 animate-fade-up">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-xl text-white text-[11px] font-semibold shadow-md shadow-primary/30 transition-all hover:bg-primary active:scale-95">
              <SlidersHorizontal className="w-3 h-3" />
              {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''} Active
            </button>
          </div>
        )}

        {/* Category-specific Inline Filters */}
        {activeCategory && (
          <div className="mt-3">
            {activeCategory === 'events' && (
              <EventsFiltersPanel
                filters={eventsFilters}
                onFiltersChange={setEventsFilters}
              />
            )}
            {activeCategory === 'routes' && (
              <RoutesFiltersPanel
                filters={routesFilters}
                onFiltersChange={setRoutesFilters}
              />
            )}
            {activeCategory === 'services' && (
              <ServicesFiltersPanel
                filters={servicesFilters}
                onFiltersChange={setServicesFilters}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom gradient overlay above nav */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/40 via-black/15 to-transparent z-10 pointer-events-none" />

      {/* Right-side controls stack */}
      <div className="absolute right-6 bottom-28 z-20 flex flex-col items-center gap-4">
        <MapStyleButton currentStyle={mapStyle} onStyleChange={setMapStyle} />
        <LocationButton onClick={handleLocateUser} />
        <HelpButton onClick={() => setIsHelpOpen(true)} />
        <FloatingActionButton
          onAddEvent={() => navigate('/add/event')}
          onAddRoute={() => navigate('/add/route')}
          onAddService={() => navigate('/add/service')}
          onAddClub={() => navigate('/add/club')}
        />
      </div>

      {/* Help Sheet */}
      <HelpSheet open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {/* Item Detail Sheet */}
      <ItemDetailSheet 
        item={selectedItem}
        onClose={handleCloseDetail}
        onViewFull={handleViewFull}
      />

      {/* Navigation Sheet */}
      <NavigationSheet />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Home;
