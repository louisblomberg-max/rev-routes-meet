import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  onFocus: () => void;
  isSearchActive: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
}

const SearchBar = ({ 
  onFocus, 
  isSearchActive, 
  onClose,
  searchValue,
  onSearchChange,
  onFilterClick,
}: Omit<SearchBarProps, 'onProfileClick'>) => {
  const searchCategories = [
    { id: 'events', label: 'Meets & Events' },
    { id: 'routes', label: 'Routes' },
    { id: 'services', label: 'Services' },
    { id: 'clubs', label: 'Clubs' },
  ];
  const searchSuggestions = [
    "Porsche meets this weekend",
    "Scenic driving routes near me",
    "BMW specialist garage",
    "Motorbike clubs Southampton",
  ];

  const recentSearches = [
    "Cars and coffee London",
    "Classic car routes",
  ];

  const popularSearches = [
    "JDM meets",
    "Track days UK",
  ];

  return (
    <div className="space-y-3">
      {/* Collapsed State - Simplified for logo layout */}
      {!isSearchActive && (
        <div className="search-bar cursor-pointer py-2 px-3" onClick={onFocus}>
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-muted-foreground text-xs truncate">Search events, routes, services or clubs</span>
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
              placeholder="Search events, routes, services or clubs…"
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button 
              onClick={onFilterClick}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Search Category Options */}
          <div className="flex flex-wrap gap-2">
            {searchCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSearchChange(cat.label)}
                className="px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Suggestions (only when empty) */}
          {!searchValue && (
            <div className="space-y-4 animate-fade-up max-h-[50vh] overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Recent</p>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={`recent-${index}`}
                        onClick={() => onSearchChange(search)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-card/60 hover:bg-card text-sm text-foreground transition-colors"
                      >
                        <Search className="w-3.5 h-3.5 inline mr-2 text-muted-foreground" />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Popular</p>
                <div className="space-y-1">
                  {popularSearches.map((search, index) => (
                    <button
                      key={`popular-${index}`}
                      onClick={() => onSearchChange(search)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-card/60 hover:bg-card text-sm text-foreground transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 inline mr-2 text-muted-foreground" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested Searches */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Try searching for</p>
                <div className="space-y-1">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => onSearchChange(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-card/60 hover:bg-card text-sm text-foreground transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 inline mr-2 text-muted-foreground" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results Preview (when typing) */}
          {searchValue && (
            <div className="space-y-2 animate-fade-up">
              <p className="text-xs text-muted-foreground">
                Showing results for "{searchValue}"
              </p>
              <p className="text-sm text-foreground">
                Results updating on map…
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
