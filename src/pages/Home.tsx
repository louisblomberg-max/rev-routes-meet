import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { useNavigate } from 'react-router-dom';
import revnetLogoNew from '@/assets/revnet-logo-new.png';
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
  // Convert single category to array for MapView compatibility
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

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="bg-card/95 backdrop-blur-xl border-b border-border/50 safe-top">
          {/* Search Bar + Logo */}
          <div className="max-w-md mx-auto px-3 pt-2 flex items-center gap-2">
            <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-xl border border-white/60 shadow-sm overflow-hidden">
              <img src={revnetLogoNew} alt="RevNet" className="h-8 w-8 object-contain" />
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
          {/* Category Chips */}
          <div className="max-w-md mx-auto flex items-center justify-around py-2 px-3">
            <CategoryChips 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>
          
        {/* Category-specific Inline Filters */}
        {activeCategory && (
          <div className="px-3 pt-2">
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

      {/* Right-side controls stack */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-2.5">
        <MapStyleButton currentStyle={mapStyle} onStyleChange={setMapStyle} />
        <HelpButton onClick={() => setIsHelpOpen(true)} />
        <LocationButton onClick={handleLocateUser} />
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
