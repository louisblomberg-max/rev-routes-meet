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
  const [selectedSearchCategories, setSelectedSearchCategories] = useState<string[]>([]);

  const searchCategories = [
    { id: 'events', label: 'Events & Meets', icon: Calendar },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'clubs', label: 'Clubs', icon: Users },
  ];

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedSearchCategories.includes(categoryId)) {
      setSelectedSearchCategories(selectedSearchCategories.filter(c => c !== categoryId));
    } else {
      setSelectedSearchCategories([...selectedSearchCategories, categoryId]);
    }
  };

  const handleClose = () => {
    setSelectedSearchCategories([]);
    onClose();
  };

  const hasSelectedCategories = selectedSearchCategories.length > 0;

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
          {/* Search Input - only active when categories selected */}
          <div className={`search-bar ${hasSelectedCategories ? 'ring-2 ring-primary/20' : ''}`}>
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder={hasSelectedCategories ? `Search ${selectedSearchCategories.map(c => searchCategories.find(sc => sc.id === c)?.label).join(', ')}...` : 'Select a category below'}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
              autoFocus={hasSelectedCategories}
              disabled={!hasSelectedCategories}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {hasSelectedCategories && (
              <button 
                onClick={onFilterClick}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
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
              const isSelected = selectedSearchCategories.includes(cat.id);
              
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
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

          {/* Search Results - only shown when categories selected and searching */}
          {hasSelectedCategories && searchValue && (
            <div className="space-y-2 animate-fade-up">
              <p className="text-xs text-muted-foreground">
                Showing results for "{searchValue}" in {selectedSearchCategories.length} {selectedSearchCategories.length === 1 ? 'category' : 'categories'}
              </p>
              <p className="text-sm text-foreground">
                Results updating on map…
              </p>
            </div>
          )}

          {/* Prompt when categories selected but no search yet */}
          {hasSelectedCategories && !searchValue && (
            <div className="animate-fade-up">
              <p className="text-xs text-muted-foreground text-center">
                Start typing to search within selected {selectedSearchCategories.length === 1 ? 'category' : 'categories'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
