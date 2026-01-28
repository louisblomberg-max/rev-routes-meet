import { Search, X, SlidersHorizontal, Calendar, Route, Wrench, Users } from 'lucide-react';
import { useState } from 'react';

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
  const [selectedSearchCategory, setSelectedSearchCategory] = useState<string | null>(null);

  const searchCategories = [
    { id: 'events', label: 'Events & Meets', icon: Calendar },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'clubs', label: 'Clubs', icon: Users },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedSearchCategory(selectedSearchCategory === categoryId ? null : categoryId);
  };

  const handleClose = () => {
    setSelectedSearchCategory(null);
    onClose();
  };

  const hasSelectedCategory = selectedSearchCategory !== null;

  return (
    <div className="space-y-3">
      {/* Collapsed State */}
      {!isSearchActive && (
        <div className="search-bar cursor-pointer py-2 px-3" onClick={onFocus}>
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-muted-foreground text-xs truncate">Search events, routes, services or clubs</span>
        </div>
      )}

      {/* Expanded State */}
      {isSearchActive && (
        <div className="space-y-4 animate-fade-up">
          {/* Search Input - only active when category selected */}
          <div className={`search-bar ${hasSelectedCategory ? 'ring-2 ring-primary/20' : ''}`}>
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder={hasSelectedCategory ? `Search ${searchCategories.find(c => c.id === selectedSearchCategory)?.label}...` : 'Select a category below'}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
              autoFocus={hasSelectedCategory}
              disabled={!hasSelectedCategory}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <button 
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Category Selection Boxes */}
          <div className="grid grid-cols-4 gap-2">
            {searchCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedSearchCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 transition-all ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium text-center leading-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Results - only shown when category selected and searching */}
          {hasSelectedCategory && searchValue && (
            <div className="space-y-2 animate-fade-up">
              <p className="text-xs text-muted-foreground">
                Showing results for "{searchValue}" in {searchCategories.find(c => c.id === selectedSearchCategory)?.label}
              </p>
              <p className="text-sm text-foreground">
                Results updating on map…
              </p>
            </div>
          )}

          {/* Prompt when category selected but no search yet */}
          {hasSelectedCategory && !searchValue && (
            <div className="animate-fade-up">
              <p className="text-xs text-muted-foreground text-center">
                Start typing to search {searchCategories.find(c => c.id === selectedSearchCategory)?.label}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
