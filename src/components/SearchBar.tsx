import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onFocus: () => void;
  isSearchActive: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
}

const SearchBar = ({ 
  onFocus, 
  isSearchActive, 
  onClose,
  searchValue,
  onSearchChange,
}: Omit<SearchBarProps, 'onFilterClick'>) => {
  const [isFocused, setIsFocused] = useState(false);

  const examplePrompts = [
    "Porsche meets this weekend",
    "Scenic coastal routes",
    "JDM events in March",
    "Best mechanics for BMW",
  ];

  const handleClose = () => {
    setIsFocused(false);
    onClose();
  };

  const handleExampleClick = (prompt: string) => {
    onSearchChange(prompt);
  };

  return (
    <div className="space-y-3">
      {/* Collapsed State */}
      {!isSearchActive && (
        <div 
          onClick={onFocus}
          className="group cursor-pointer h-11 bg-card border border-border/50 rounded-lg shadow-card px-4 flex items-center gap-3 transition-all duration-200 hover:shadow-elevated hover:border-border active:scale-[0.99]"
        >
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="flex-1 text-sm text-muted-foreground truncate">Search events, routes, services...</span>
        </div>
      )}

      {/* Expanded State */}
      {isSearchActive && (
        <div className="bg-card border border-border/50 rounded-xl shadow-elevated overflow-hidden animate-fade-up">
          {/* Search Input */}
          <div className="p-3">
            <div className={`flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3 transition-all ${isFocused ? 'ring-2 ring-primary/30 bg-background' : ''}`}>
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium"
                autoFocus
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <button 
                onClick={handleClose}
                className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-border transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Example Prompts */}
          {!searchValue && (
            <div className="px-3 pb-4 space-y-2">
              <p className="text-label px-1">Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="px-3 py-1.5 rounded-md bg-muted text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Active State */}
          {searchValue && (
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm text-foreground font-semibold">
                  Searching "{searchValue}"
                </p>
              </div>
              <p className="text-caption">
                Finding events, routes, services & clubs...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;