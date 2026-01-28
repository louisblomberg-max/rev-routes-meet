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

  const getSuggestions = () => {
    switch (browseCategory) {
      case 'events':
        return ["Porsche meet this weekend", "JDM nights near me", "Classic car shows"];
      case 'routes':
        return ["Scenic driving routes near me", "Twisty roads for bikes", "Coastal drives"];
      case 'services':
        return ["BMW specialist garage", "Performance tuning shop", "Detailing services"];
      case 'clubs':
        return ["Porsche clubs", "BMW enthusiasts", "Motorbike groups"];
      default:
        return [];
    }
  };

  const getPlaceholder = () => {
    switch (browseCategory) {
      case 'events':
        return "Search meets & events…";
      case 'routes':
        return "Search routes…";
      case 'services':
        return "Search services…";
      case 'clubs':
        return "Search clubs…";
      default:
        return "Search nearby…";
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (browseCategory === categoryId) {
      onBrowseCategoryChange(null);
    } else {
      onBrowseCategoryChange(categoryId);
    }
    onSearchChange('');
  };

  const suggestions = getSuggestions();

  return (
    <div className="space-y-3">
      {/* Collapsed State */}
      {!isSearchActive && (
        <div className="search-bar cursor-pointer" onClick={onFocus}>
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-muted-foreground">Search nearby…</span>
          <div onClick={(e) => { e.stopPropagation(); onProfileClick(); }}>
            <ProfileAvatar onClick={() => {}} />
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isSearchActive && (
        <div className="space-y-4 animate-fade-up">
          {/* Search Input */}
          <div className="search-bar ring-2 ring-primary/20">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder={getPlaceholder()}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={!browseCategory}
            />
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Step 1: Category Selection */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {browseCategory ? 'Searching in:' : 'Step 1: Choose a category'}
            </p>
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
          </div>

          {/* Step 2: Search Suggestions (only after category selected) */}
          {browseCategory && !searchValue && suggestions.length > 0 && (
            <div className="space-y-2 animate-fade-up">
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

          {/* Guidance when no category selected */}
          {!browseCategory && (
            <div className="text-center py-4 animate-fade-up">
              <p className="text-sm text-muted-foreground">
                Select a category above to start searching
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
