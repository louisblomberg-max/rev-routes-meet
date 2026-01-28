import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import CategoryToggles from '@/components/CategoryToggles';
import ItemDetailSheet, { SelectedItem } from '@/components/ItemDetailSheet';
import BottomNavigation from '@/components/BottomNavigation';
import YouTab from '@/components/YouTab';
import ContributeTab from '@/components/ContributeTab';
import LocationButton from '@/components/LocationButton';
import SearchFilters, { SearchFilterState } from '@/components/SearchFilters';
import { mockPins, mockEvents, mockRoutes, mockServices, mockClubs } from '@/data/mockData';

type Tab = 'discovery' | 'you' | 'contribute';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('discovery');
  const [activeCategories, setActiveCategories] = useState<string[]>(['events', 'routes', 'services']);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    contentTypes: [],
    distanceRadius: 25,
    dateFilter: null,
    tags: [],
  });

  const handlePinClick = (pin: typeof mockPins[0]) => {
    // Find the full item data based on pin type and id
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
    setSearchFilters({
      contentTypes: [],
      distanceRadius: 25,
      dateFilter: null,
      tags: [],
    });
  };

  // Get the selected route ID for highlighting on map
  const selectedRouteId = selectedItem?.type === 'route' ? selectedItem.id : null;

  // Determine primary category for filtering context
  const primaryCategory = activeCategories.length === 1 ? activeCategories[0] : null;

  // Discovery Tab Content
  if (activeTab !== 'discovery') {
    return (
      <div className="mobile-container">
        {activeTab === 'you' && <YouTab />}
        {activeTab === 'contribute' && <ContributeTab />}
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
        showEmptyPrompt={activeCategories.length === 0 && !selectedItem && !isSearchActive}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 safe-top">
        {/* Logo + Search + Profile row */}
        <div className="flex items-center gap-3">
          {/* RevNet Logo */}
          <div className="flex-shrink-0">
            <span className="text-lg font-bold text-foreground">RevNet</span>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1">
            <SearchBar 
              onFocus={() => setIsSearchActive(true)}
              onProfileClick={() => setActiveTab('you')}
              isSearchActive={isSearchActive}
              onClose={handleCloseSearch}
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onFilterClick={() => setIsFiltersOpen(true)}
            />
          </div>
        </div>

        {/* Category Toggles + Filter button */}
        {!isSearchActive && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1">
              <CategoryToggles 
                activeCategories={activeCategories}
                onCategoriesChange={setActiveCategories}
              />
            </div>
            {/* Filter button */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="w-9 h-9 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-muted transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Location Button - Google Maps style */}
      <div className="absolute right-4 bottom-36 z-20">
        <LocationButton onClick={() => console.log('Center on location')} />
      </div>

      {/* Item Detail Sheet - Fixed bottom sheet when pin is tapped */}
      <ItemDetailSheet 
        item={selectedItem}
        onClose={handleCloseDetail}
        onViewFull={handleViewFull}
      />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Search Filters Modal */}
      <SearchFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        activeFilters={searchFilters}
        onFiltersChange={setSearchFilters}
        mode={isSearchActive ? 'search' : 'browse'}
        browseCategory={primaryCategory}
      />
    </div>
  );
};

export default Home;
