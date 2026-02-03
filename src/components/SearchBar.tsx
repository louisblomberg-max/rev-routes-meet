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
        <div 
          onClick={onFocus}
          className="group cursor-pointer h-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-3 flex items-center gap-2.5 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
              <Search className="w-4 h-4 text-white" />
            </div>
            <Sparkles className="w-3 h-3 text-amber-500 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">AI Discovery Search</p>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isSearchActive && (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden animate-fade-up">
          {/* AI Search Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-amber-700">AI Discovery</span>
            </div>
            <button 
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-3">
            <div className={`flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3 transition-all ${isFocused ? 'ring-2 ring-amber-400/40 bg-white' : ''}`}>
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
            </div>
          </div>

          {/* Example Prompts */}
          {!searchValue && (
            <div className="px-3 pb-4 space-y-2">
              <p className="text-xs text-muted-foreground px-1 font-medium">Try asking...</p>
              <div className="flex flex-wrap gap-1.5">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="px-3 py-1.5 rounded-full bg-muted/60 text-xs text-muted-foreground hover:bg-amber-100 hover:text-amber-700 transition-all"
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
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-sm text-foreground font-medium">
                  Searching for "{searchValue}"
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
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
