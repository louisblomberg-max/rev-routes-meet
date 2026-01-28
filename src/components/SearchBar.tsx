import { Search, X } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

interface SearchBarProps {
  onFocus: () => void;
  onProfileClick: () => void;
  isSearchActive: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

const searchSuggestions = [
  "Porsche meets this weekend",
  "Scenic routes near me",
  "BMW specialist garage",
  "Motorbike clubs Southampton",
];

const SearchBar = ({ 
  onFocus, 
  onProfileClick, 
  isSearchActive, 
  onClose,
  searchValue,
  onSearchChange,
  onSuggestionClick 
}: SearchBarProps) => {
  return (
    <div className="space-y-3">
      <div className={`search-bar transition-all duration-300 ${isSearchActive ? 'ring-2 ring-primary/30 scale-[1.02]' : ''}`}>
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

      {/* Search Suggestions - Only visible when search is active and no text entered */}
      {isSearchActive && !searchValue && (
        <div className="bg-card rounded-xl shadow-lg border border-border p-3 animate-fade-up">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Try searching for...</p>
          <div className="space-y-1">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
