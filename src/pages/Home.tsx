import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import BottomSheet from '@/components/BottomSheet';
import FloatingActionButton from '@/components/FloatingActionButton';
import SearchFilters, { SearchFilterState } from '@/components/SearchFilters';
import { mockPins } from '@/data/mockData';

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    contentTypes: [],
    distanceRadius: 25,
    dateFilter: null,
    tags: [],
  });

  const handlePinClick = (pin: typeof mockPins[0]) => {
    if (pin.type === 'events') {
      navigate(`/event/${pin.id}`);
    } else if (pin.type === 'routes') {
      navigate(`/route/${pin.id}`);
    } else if (pin.type === 'services') {
      navigate(`/service/${pin.id}`);
    }
  };

  const handleItemClick = (type: string, id: string) => {
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

  // Determine effective category for map and bottom sheet
  // In search mode, use content type filters if only one is selected
  const getEffectiveCategory = () => {
    if (isSearchActive) {
      if (searchFilters.contentTypes.length === 1) {
        return searchFilters.contentTypes[0];
      }
      return null; // Mixed results
    }
    return activeCategory;
  };

  const effectiveCategory = getEffectiveCategory();

  return (
    <div className="mobile-container">
      {/* Map Background */}
      <MapView 
        activeCategory={effectiveCategory} 
        onPinClick={handlePinClick}
      />

      {/* Search Overlay - dims map when search is active */}
      {isSearchActive && (
        <div 
          className="absolute inset-0 bg-overlay/30 z-10 transition-opacity duration-200"
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
            {/* Filter button for browse mode */}
            {activeCategory && (
              <button
                onClick={() => setIsFiltersOpen(true)}
                className="w-9 h-9 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-muted transition-colors animate-scale-up"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sheet - ONLY visible when NOT in search mode */}
      {!isSearchActive && (
        <BottomSheet 
          activeCategory={activeCategory}
          isExpanded={isBottomSheetExpanded}
          onToggle={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
          onItemClick={handleItemClick}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton 
        onAddEvent={() => navigate('/add/event')}
        onAddRoute={() => navigate('/add/route')}
        onAddService={() => navigate('/add/service')}
        onAddClub={() => navigate('/add/club')}
      />

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
