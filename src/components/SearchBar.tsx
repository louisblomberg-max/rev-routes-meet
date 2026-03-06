import { Sparkles, X } from 'lucide-react';
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
          className="group cursor-pointer h-10 bg-card/80 backdrop-blur-md border border-border/30 rounded-xl shadow-card px-3.5 flex items-center gap-2.5 transition-all duration-200 hover:shadow-elevated hover:border-border/50 active:scale-[0.99]"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="flex-1 text-sm text-muted-foreground truncate">AI Search: events, routes, services...</span>
        </div>
      )}

      {/* Expanded State */}
      {isSearchActive && (
        <div className="bg-card border border-amber-500/30 rounded-xl shadow-elevated overflow-hidden animate-fade-up">
          {/* AI Header */}
          <div className="px-4 pt-3 pb-2 border-b border-border/50 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">AI Discovery</span>
          </div>
          
          {/* Search Input */}
          <div className="p-3">
            <div className={`flex items-center gap-3 bg-muted/50 rounded-lg px-4 py-3 transition-all ${isFocused ? 'ring-2 ring-amber-500/30 bg-background' : ''}`}>
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Ask anything about events, routes, services..."
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
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-sm text-foreground font-semibold">
                  AI searching "{searchValue}"
                </p>
              </div>
              <p className="text-caption">
                Intelligently finding events, routes, services & clubs...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;