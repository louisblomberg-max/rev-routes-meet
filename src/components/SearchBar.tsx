import { Search, X, Calendar, Route, Wrench, Users } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

interface SearchBarProps {
  onFocus: () => void;
  onProfileClick: () => void;
  isSearchActive: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  browseCategory: string | null;
  onBrowseCategoryChange: (category: string | null) => void;
}

const SearchBar = ({ 
  onFocus, 
  onProfileClick, 
  isSearchActive, 
  onClose,
  searchValue,
  onSearchChange,
  browseCategory,
  onBrowseCategoryChange,
}: SearchBarProps) => {
  const browseCategories = [
    { id: 'events', label: 'Meets & Events', icon: Calendar, chipClass: 'category-chip-events' },
    { id: 'routes', label: 'Routes', icon: Route, chipClass: 'category-chip-routes' },
    { id: 'services', label: 'Services', icon: Wrench, chipClass: 'category-chip-services' },
    { id: 'clubs', label: 'Clubs', icon: Users, chipClass: 'category-chip-clubs' },
  ];

  const suggestions = [
    "Porsche meets this weekend",
    "Scenic driving routes near me",
    "BMW specialist garage",
    "Motorbike clubs Southampton",
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (browseCategory === categoryId) {
      onBrowseCategoryChange(null);
    } else {
      onBrowseCategoryChange(categoryId);
    }
  };

  return (
    <div className="space-y-3">
      <div className={`search-bar transition-all duration-200 ${isSearchActive ? 'ring-2 ring-primary/20' : ''}`}>
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search routes, events, services…"
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          onFocus={onFocus}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {isSearchActive ? (
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        ) : (
          <ProfileAvatar onClick={onProfileClick} />
        )}
      </div>

      {/* Browse Mode Content */}
      {isSearchActive && (
        <div className="space-y-4 animate-fade-up">
          {/* Category Filters */}
          <div className="flex gap-1.5 flex-wrap">
            {browseCategories.map((category) => {
              const Icon = category.icon;
              const isActive = browseCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`category-chip ${category.chipClass} ${isActive ? 'active' : ''} flex items-center gap-1.5`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Suggestions */}
          {!searchValue && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Try searching for:</p>
              <div className="space-y-1.5">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSearchChange(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-white/80 hover:bg-white text-sm text-foreground transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 inline mr-2 text-muted-foreground" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
