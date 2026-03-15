import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RoutesFilterState {
  distance: number | 'national' | 'international';
  types: string[];
  difficulty: string[];
  duration: string | null;
  surface: string[];
}

interface RoutesFiltersPanelProps {
  filters: RoutesFilterState;
  onFiltersChange: (filters: RoutesFilterState) => void;
}

const RoutesFiltersPanel = ({ filters, onFiltersChange }: RoutesFiltersPanelProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const distancePresets = [
    { id: 'national', label: 'National' },
    { id: 'international', label: 'International' },
  ];

  const typeOptions = [
    { id: 'all', label: 'All' },
    { id: 'scenic', label: 'Scenic' },
    { id: 'coastal', label: 'Coastal' },
    { id: 'off-road', label: 'Off-road' },
    { id: 'twisties', label: 'Twisties' },
    { id: 'urban', label: 'Urban' },
    { id: 'track', label: 'Track' },
  ];

  const difficultyOptions = [
    { id: 'all', label: 'All' },
    { id: 'easy', label: 'Easy' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'challenging', label: 'Challenging' },
    { id: 'expert', label: 'Expert' },
  ];

  const durationOptions = [
    { id: 'all', label: 'All' },
    { id: 'under-1h', label: '< 1 hour' },
    { id: '1-2h', label: '1-2 hours' },
    { id: '2-4h', label: '2-4 hours' },
    { id: 'over-4h', label: '4+ hours' },
  ];

  const surfaceOptions = [
    { id: 'all', label: 'All' },
    { id: 'tarmac', label: 'Tarmac' },
    { id: 'gravel', label: 'Gravel' },
    { id: 'dirt', label: 'Dirt' },
    { id: 'mixed', label: 'Mixed' },
  ];

  const ratingOptions = [
    { value: 4, label: '4+' },
    { value: 3, label: '3+' },
    { value: 2, label: '2+' },
  ];

  const toggleType = (typeId: string) => {
    if (typeId === 'all') {
      onFiltersChange({ ...filters, types: [] });
      return;
    }
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter(t => t !== typeId)
      : [...filters.types, typeId];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleDifficulty = (difficultyId: string) => {
    if (difficultyId === 'all') {
      onFiltersChange({ ...filters, difficulty: [] });
      return;
    }
    const newDifficulty = filters.difficulty.includes(difficultyId)
      ? filters.difficulty.filter(d => d !== difficultyId)
      : [...filters.difficulty, difficultyId];
    onFiltersChange({ ...filters, difficulty: newDifficulty });
  };

  const toggleSurface = (surfaceId: string) => {
    if (surfaceId === 'all') {
      onFiltersChange({ ...filters, surface: [] });
      return;
    }
    const newSurface = filters.surface.includes(surfaceId)
      ? filters.surface.filter(s => s !== surfaceId)
      : [...filters.surface, surfaceId];
    onFiltersChange({ ...filters, surface: newSurface });
  };

  const handleDistanceChange = (value: number[]) => {
    onFiltersChange({ ...filters, distance: value[0] });
  };

  const handleDistancePreset = (preset: 'national' | 'international') => {
    onFiltersChange({ 
      ...filters, 
      distance: filters.distance === preset ? 25 : preset 
    });
  };

  const handleDurationChange = (durationId: string) => {
    if (durationId === 'all') {
      onFiltersChange({ ...filters, duration: null });
      return;
    }
    onFiltersChange({ 
      ...filters, 
      duration: filters.duration === durationId ? null : durationId 
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ 
      ...filters, 
      minRating: filters.minRating === rating ? null : rating 
    });
  };

  const isDistanceNumeric = typeof filters.distance === 'number';
  const distanceValue: number = isDistanceNumeric ? (filters.distance as number) : 25;
  const getDistanceLabel = () => {
    if (isDistanceNumeric) return `${filters.distance} miles`;
    const preset = filters.distance as string;
    return preset.charAt(0).toUpperCase() + preset.slice(1);
  };

  return (
    <div className="space-y-2 animate-fade-up">
      {/* Filter Bar Row */}
      <div className="flex items-center gap-2">
        {/* Filter Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-10 flex-1 flex items-center justify-center gap-1.5 px-4 rounded-xl border transition-all duration-300 ${
            isOpen
              ? 'bg-routes/80 text-white border-routes/80 shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-routes/50 hover:bg-routes/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Filters</span>
        </button>

        {/* Add Route Button */}
        <button
          onClick={() => navigate('/add/route')}
          className="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-routes text-routes-foreground shadow-sm hover:bg-routes/90 active:scale-[0.97] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-semibold whitespace-nowrap">Add</span>
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-4 space-y-4 animate-fade-up max-h-[60vh] overflow-y-auto">
          {/* Header with close */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Routes</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFiltersChange({
                  distance: 25, types: [], difficulty: [], duration: null, surface: [], minRating: null,
                })}
                className="text-[10px] font-medium text-routes hover:text-routes/70 transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Distance Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Distance</p>
              <span className="text-xs text-muted-foreground">{getDistanceLabel()}</span>
            </div>
            <Slider
              value={[isDistanceNumeric ? distanceValue : 25]}
              onValueChange={handleDistanceChange}
              min={1}
              max={50}
              step={1}
              className="w-full"
              disabled={!isDistanceNumeric}
            />
            <div className="flex gap-1.5 mt-2">
              {distancePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleDistancePreset(preset.id as 'national' | 'international')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.distance === preset.id
                      ? 'bg-routes/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-routes/10'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {typeOptions.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    (type.id === 'all' && filters.types.length === 0) || filters.types.includes(type.id)
                      ? 'bg-routes/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-routes/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Difficulty</p>
            <div className="flex flex-wrap gap-1.5">
              {difficultyOptions.map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => toggleDifficulty(diff.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    (diff.id === 'all' && filters.difficulty.length === 0) || filters.difficulty.includes(diff.id)
                      ? 'bg-routes/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-routes/10'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Duration</p>
            <div className="flex flex-wrap gap-1.5">
              {durationOptions.map((dur) => (
                <button
                  key={dur.id}
                  onClick={() => handleDurationChange(dur.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    (dur.id === 'all' && filters.duration === null) || filters.duration === dur.id
                      ? 'bg-routes/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-routes/10'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surface Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Surface</p>
            <div className="flex flex-wrap gap-1.5">
              {surfaceOptions.map((surf) => (
                <button
                  key={surf.id}
                  onClick={() => toggleSurface(surf.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    (surf.id === 'all' && filters.surface.length === 0) || filters.surface.includes(surf.id)
                      ? 'bg-routes/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-routes/10'
                  }`}
                >
                  {surf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Minimum Rating</p>
            <div className="flex gap-1.5">
              {ratingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleRatingChange(option.value)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.minRating === option.value
                      ? 'bg-routes/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-routes/10'
                  }`}
                >
                  <Star className="w-3 h-3" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-routes/80 text-white hover:bg-routes transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RoutesFiltersPanel;
