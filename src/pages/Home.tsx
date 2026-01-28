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

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    // Could trigger actual search here
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    setSearchValue('');
  };

  return (
    <div className="mobile-container">
      {/* Map Background */}
      <MapView 
        activeCategory={activeCategory} 
        onPinClick={handlePinClick}
      />

      {/* Search Overlay - dims map when active */}
      {isSearchActive && (
        <div 
          className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-300"
          onClick={handleSearchClose}
        />
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 safe-top">
        <SearchBar 
          onFocus={() => setIsSearchActive(true)}
          onProfileClick={() => navigate('/profile')}
          isSearchActive={isSearchActive}
          onClose={handleSearchClose}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Category Chips - Show Clubs only when searching */}
        <div className={`mt-3 transition-all duration-300 ${isSearchActive ? 'opacity-100' : 'opacity-100'}`}>
          <CategoryChips 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            showClubs={isSearchActive}
          />
        </div>
      </div>

      {/* Bottom Sheet */}
      <BottomSheet 
        activeCategory={activeCategory}
        isExpanded={isBottomSheetExpanded}
        onToggle={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
        onItemClick={handleItemClick}
      />

      {/* Floating Action Button - Marketplace removed */}
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
