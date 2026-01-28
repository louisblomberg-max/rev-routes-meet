import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import ItemDetailSheet, { SelectedItem } from '@/components/ItemDetailSheet';
import FloatingActionButton from '@/components/FloatingActionButton';
import SearchFilters, { SearchFilterState } from '@/components/SearchFilters';
import { mockPins, mockEvents, mockRoutes, mockServices, mockClubs } from '@/data/mockData';

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  // Determine if FAB should be visible
  const showFAB = !isSearchActive && !isFiltersOpen;

  return (
    <div className="mobile-container">
      {/* Map Background */}
      <MapView 
        activeCategory={activeCategory} 
        onPinClick={handlePinClick}
        selectedRouteId={selectedRouteId}
        showEmptyPrompt={!activeCategory && !selectedItem && !isSearchActive}
      />

      {/* Search Overlay - dims map when search is active */}
      {isSearchActive && (
        <div 
          className="absolute inset-0 bg-overlay/40 z-10 transition-opacity duration-200"
          onClick={handleCloseSearch}
        />
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 safe-top">
        <SearchBar 
          onFocus={() => setIsSearchActive(true)}
          onProfileClick={() => navigate('/profile')}
          isSearchActive={isSearchActive}
          onClose={handleCloseSearch}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onFilterClick={() => setIsFiltersOpen(true)}
        />

        {/* Category Chips - Only show when NOT in search mode */}
        {!isSearchActive && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1">
              <CategoryChips 
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
            {/* Filter button for browse mode - always visible */}
            <button
              onClick={() => setIsFiltersOpen(true)}
              className={`w-9 h-9 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-muted transition-colors ${
                activeCategory ? 'animate-scale-up' : ''
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>

      {/* Item Detail Sheet - Only when a pin is tapped and NOT in search mode */}
      {!isSearchActive && (
        <ItemDetailSheet 
          item={selectedItem}
          onClose={handleCloseDetail}
          onViewFull={handleViewFull}
        />
      )}

      {/* Floating Action Button - Hidden during search or when filters open */}
      {showFAB && (
        <FloatingActionButton 
          onAddEvent={() => navigate('/add/event')}
          onAddRoute={() => navigate('/add/route')}
          onAddService={() => navigate('/add/service')}
          onAddClub={() => navigate('/add/club')}
        />
      )}

      {/* Search Filters Modal */}
      <SearchFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        activeFilters={searchFilters}
        onFiltersChange={setSearchFilters}
        mode={isSearchActive ? 'search' : 'browse'}
        browseCategory={activeCategory}
      />
    </div>
  );
};

export default Home;
