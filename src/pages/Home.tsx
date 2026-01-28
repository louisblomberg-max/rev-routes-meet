import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import BottomSheet from '@/components/BottomSheet';
import FloatingActionButton from '@/components/FloatingActionButton';
import { mockPins } from '@/data/mockData';

const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [browseCategory, setBrowseCategory] = useState<string | null>(null);

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
    setBrowseCategory(null);
  };

  // Use browse category when in search mode, otherwise use home category
  const effectiveCategory = isSearchActive ? browseCategory : activeCategory;

  return (
    <div className="mobile-container">
      {/* Map Background */}
      <MapView 
        activeCategory={effectiveCategory} 
        onPinClick={handlePinClick}
      />

      {/* Search Overlay */}
      {isSearchActive && (
        <div 
          className="absolute inset-0 bg-black/30 z-10 transition-opacity duration-200"
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
          browseCategory={browseCategory}
          onBrowseCategoryChange={setBrowseCategory}
        />

        {/* Category Chips - Only show when NOT in search mode */}
        {!isSearchActive && (
          <div className="mt-3">
            <CategoryChips 
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <BottomSheet 
        activeCategory={effectiveCategory}
        isExpanded={isBottomSheetExpanded}
        onToggle={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
        onItemClick={handleItemClick}
      />

      {/* Floating Action Button */}
      <FloatingActionButton 
        onAddEvent={() => navigate('/add/event')}
        onAddRoute={() => navigate('/add/route')}
        onAddService={() => navigate('/add/service')}
        onCommunityHub={() => navigate('/community')}
      />
    </div>
  );
};

export default Home;
