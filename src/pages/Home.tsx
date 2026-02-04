import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ItemDetailSheet, { SelectedItem } from '@/components/ItemDetailSheet';
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
import { mockPins, mockEvents, mockRoutes, mockServices, mockClubs } from '@/data/mockData';
import revnetLogo from '@/assets/revnet-logo.png';

type Tab = 'discovery' | 'community' | 'marketplace' | 'you';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('discovery');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
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

  const handlePinClick = (pin: typeof mockPins[0]) => {
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
          rating: service.rating,
          distance: service.distance,
          reviewCount: service.reviewCount,
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

  const handleCloseSearch = () => {
    setIsSearchActive(false);
    setSearchValue('');
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
        isDimmed={isSearchActive}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-3 pt-3 safe-top">
        {/* Logo + Search row */}
        <div className="flex items-center gap-2">
          {/* RevNet Logo */}
          <img 
            src={revnetLogo} 
            alt="RevNet" 
            className="h-9 w-auto flex-shrink-0"
          />
          
          {/* Search Bar */}
          <div className="flex-1 min-w-0">
            <SearchBar 
              onFocus={() => setIsSearchActive(true)}
              isSearchActive={isSearchActive}
              onClose={handleCloseSearch}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
          </div>
        </div>

        {/* Category Chips - hidden during search */}
        {!isSearchActive && (
          <div className="mt-3 space-y-2">
            <CategoryChips 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            
            {/* Category-specific Inline Filters */}
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

      {/* Map Style Button - right side below tabs */}
      {!isSearchActive && (
        <div className="absolute right-4 top-[140px] z-10 safe-top">
          <MapStyleButton currentStyle={mapStyle} onStyleChange={setMapStyle} />
        </div>
      )}

      {/* Location & Help Buttons - hidden during search */}
      {!isSearchActive && (
        <div className="absolute right-4 bottom-36 z-20 flex flex-col gap-3">
          <HelpButton onClick={() => setIsHelpOpen(true)} />
          <LocationButton onClick={() => console.log('Center on location')} />
        </div>
      )}

      {/* Help Sheet */}
      <HelpSheet open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {/* Item Detail Sheet - hidden during search */}
      {!isSearchActive && (
        <ItemDetailSheet 
          item={selectedItem}
          onClose={handleCloseDetail}
          onViewFull={handleViewFull}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Home;
