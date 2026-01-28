import { X, Calendar, Route, Wrench, Users } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: SearchFilterState;
  onFiltersChange: (filters: SearchFilterState) => void;
  mode: 'search' | 'browse';
  browseCategory?: string | null;
}

export interface SearchFilterState {
  contentTypes: string[];
  distanceRadius: number;
  dateFilter: string | null;
  tags: string[];
}

const SearchFilters = ({ 
  isOpen, 
  onClose, 
  activeFilters, 
  onFiltersChange,
  mode,
  browseCategory 
}: SearchFiltersProps) => {
  if (!isOpen) return null;

  const contentTypeOptions = [
    { id: 'events', label: 'Events', icon: Calendar, chipClass: 'category-chip-events' },
    { id: 'routes', label: 'Routes', icon: Route, chipClass: 'category-chip-routes' },
    { id: 'services', label: 'Services', icon: Wrench, chipClass: 'category-chip-services' },
    { id: 'clubs', label: 'Clubs', icon: Users, chipClass: 'category-chip-clubs' },
  ];

  const dateOptions = [
    { id: 'today', label: 'Today' },
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
    { id: 'upcoming', label: 'All Upcoming' },
  ];

  const getContextualTags = () => {
    if (mode === 'browse' && browseCategory) {
      switch (browseCategory) {
        case 'routes':
          return [
            { id: 'scenic', label: 'Scenic' },
            { id: 'twisty', label: 'Twisty' },
            { id: 'highway', label: 'Highway' },
            { id: 'car', label: 'Car-friendly' },
            { id: 'bike', label: 'Bike-friendly' },
          ];
        case 'events':
          return [
            { id: 'porsche', label: 'Porsche' },
            { id: 'bmw', label: 'BMW' },
            { id: 'jdm', label: 'JDM' },
            { id: 'classic', label: 'Classic' },
            { id: 'supercar', label: 'Supercar' },
          ];
        case 'services':
          return [
            { id: 'garage', label: 'Garage' },
            { id: 'specialist', label: 'Specialist' },
            { id: 'detailing', label: 'Detailing' },
            { id: 'parts', label: 'Parts' },
            { id: 'tuning', label: 'Tuning' },
          ];
        case 'clubs':
          return [
            { id: 'local', label: 'Local' },
            { id: 'nationwide', label: 'Nationwide' },
            { id: 'porsche', label: 'Porsche' },
            { id: 'bmw', label: 'BMW' },
            { id: 'jdm', label: 'JDM' },
            { id: 'car', label: 'Car' },
            { id: 'bike', label: 'Bike' },
          ];
        default:
          return [];
      }
    }
    // Search mode - show brand tags
    return [
      { id: 'porsche', label: 'Porsche' },
      { id: 'bmw', label: 'BMW' },
      { id: 'mercedes', label: 'Mercedes' },
      { id: 'jdm', label: 'JDM' },
      { id: 'classic', label: 'Classic' },
      { id: 'motorbike', label: 'Motorbike' },
    ];
  };

  const toggleContentType = (typeId: string) => {
    const newTypes = activeFilters.contentTypes.includes(typeId)
      ? activeFilters.contentTypes.filter(t => t !== typeId)
      : [...activeFilters.contentTypes, typeId];
    onFiltersChange({ ...activeFilters, contentTypes: newTypes });
  };

  const toggleTag = (tagId: string) => {
    const newTags = activeFilters.tags.includes(tagId)
      ? activeFilters.tags.filter(t => t !== tagId)
      : [...activeFilters.tags, tagId];
    onFiltersChange({ ...activeFilters, tags: newTags });
  };

  const contextualTags = getContextualTags();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-overlay/40"
        onClick={onClose}
      />
      
      {/* Filter Panel */}
      <div className="relative w-full max-w-md bg-background rounded-t-3xl shadow-xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/40 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Content Type Filter - Only in search mode */}
          {mode === 'search' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Content Type</p>
              <div className="flex flex-wrap gap-2">
                {contentTypeOptions.map((type) => {
                  const Icon = type.icon;
                  const isActive = activeFilters.contentTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleContentType(type.id)}
                      className={`category-chip ${type.chipClass} ${isActive ? 'active' : ''} flex items-center gap-1.5`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="text-[11px]">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Distance Radius */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Distance</p>
              <span className="text-sm text-muted-foreground">{activeFilters.distanceRadius} miles</span>
            </div>
            <Slider
              value={[activeFilters.distanceRadius]}
              onValueChange={(value) => onFiltersChange({ ...activeFilters, distanceRadius: value[0] })}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          {/* Date Filter - Only for events or search mode */}
          {(mode === 'search' || browseCategory === 'events') && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Date</p>
              <div className="flex flex-wrap gap-2">
                {dateOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onFiltersChange({ 
                      ...activeFilters, 
                      dateFilter: activeFilters.dateFilter === option.id ? null : option.id 
                    })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeFilters.dateFilter === option.id
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {contextualTags.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Tags</p>
              <div className="flex flex-wrap gap-2">
                {contextualTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeFilters.tags.includes(tag.id)
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear & Apply Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onFiltersChange({
                contentTypes: [],
                distanceRadius: 25,
                dateFilter: null,
                tags: [],
              })}
              className="flex-1 py-3 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
