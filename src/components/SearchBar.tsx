import { Search, X, Sparkles } from 'lucide-react';
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
    "Scenic coastal routes near me",
    "JDM events in March",
    "Best mechanics for BMW",
    "Track days under £100",
    "Classic car shows this month",
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
        <div className="search-bar cursor-pointer py-4 px-4" onClick={onFocus}>
          <div className="relative">
            <Search className="w-6 h-6 text-muted-foreground flex-shrink-0" />
            <Sparkles className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
          </div>
          <span className="flex-1 text-muted-foreground text-base truncate">
            Ask anything about events, routes & more...
          </span>
        </div>
      )}

      {/* Expanded State */}
      {isSearchActive && (
        <div className="space-y-4 animate-fade-up">
          {/* AI Search Header */}
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">AI Discovery Search</span>
          </div>

          {/* Search Input */}
          <div className={`search-bar ${isFocused ? 'ring-2 ring-amber-500/30' : ''}`}>
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Try: 'Porsche meets near London this Saturday'"
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
              autoFocus
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <button 
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Example Prompts */}
          {!searchValue && (
            <div className="space-y-3 animate-fade-up">
              <p className="text-xs text-muted-foreground px-1">Try asking...</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="px-3 py-2 rounded-full bg-muted/80 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent hover:border-amber-500/30"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Active State */}
          {searchValue && (
            <div className="animate-fade-up space-y-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-xs text-muted-foreground">
                  Searching for "{searchValue}"
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/70 px-1">
                AI will find events, routes, services & clubs matching your request
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
