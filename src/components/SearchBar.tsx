import { Search, X } from 'lucide-react';
import { useState } from 'react';
import ProfileAvatar from './ProfileAvatar';

interface SearchBarProps {
  onFocus: () => void;
  onProfileClick: () => void;
  isSearchActive: boolean;
  onClose: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const SearchBar = ({ 
  onFocus, 
  onProfileClick, 
  isSearchActive, 
  onClose,
  searchValue,
  onSearchChange 
}: SearchBarProps) => {
  return (
    <div className="search-bar">
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
  );
};

export default SearchBar;
