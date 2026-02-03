import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X, Star } from 'lucide-react';

export interface RoutesFilterState {
  distance: number | 'national' | 'continental' | 'global';
  types: string[];
  difficulty: string[];
  duration: string | null;
  surface: string[];
  minRating: number | null;
}

interface RoutesFiltersPanelProps {
  filters: RoutesFilterState;
  onFiltersChange: (filters: RoutesFilterState) => void;
}

const RoutesFiltersPanel = ({ filters, onFiltersChange }: RoutesFiltersPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const distancePresets = [
    { id: 'national', label: 'National' },
    { id: 'continental', label: 'Continental' },
    { id: 'global', label: 'Global' },
  ];

  const typeOptions = [
    { id: 'scenic', label: 'Scenic' },
    { id: 'coastal', label: 'Coastal' },
    { id: 'off-road', label: 'Off-road' },
    { id: 'twisties', label: 'Twisties' },
    { id: 'urban', label: 'Urban' },
    { id: 'track', label: 'Track' },
  ];

  const difficultyOptions = [
    { id: 'easy', label: 'Easy' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'challenging', label: 'Challenging' },
    { id: 'expert', label: 'Expert' },
  ];

  const durationOptions = [
    { id: 'under-1h', label: '< 1 hour' },
    { id: '1-2h', label: '1-2 hours' },
    { id: '2-4h', label: '2-4 hours' },
    { id: 'over-4h', label: '4+ hours' },
  ];

  const surfaceOptions = [
    { id: 'paved', label: 'Paved' },
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
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter(t => t !== typeId)
      : [...filters.types, typeId];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleDifficulty = (difficultyId: string) => {
    const newDifficulty = filters.difficulty.includes(difficultyId)
      ? filters.difficulty.filter(d => d !== difficultyId)
      : [...filters.difficulty, difficultyId];
    onFiltersChange({ ...filters, difficulty: newDifficulty });
  };

  const toggleSurface = (surfaceId: string) => {
    const newSurface = filters.surface.includes(surfaceId)
      ? filters.surface.filter(s => s !== surfaceId)
      : [...filters.surface, surfaceId];
    onFiltersChange({ ...filters, surface: newSurface });
  };

  const handleDistanceChange = (value: number[]) => {
    onFiltersChange({ ...filters, distance: value[0] });
  };

  const handleDistancePreset = (preset: 'national' | 'continental' | 'global') => {
    onFiltersChange({ 
      ...filters, 
      distance: filters.distance === preset ? 25 : preset 
    });
  };

  const handleDurationChange = (durationId: string) => {
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
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-12 w-full flex items-center justify-center gap-1.5 px-4 rounded-2xl border transition-all duration-300 ${
          isOpen
            ? 'bg-[#1E40AF]/80 text-white border-[#1E40AF]/80 shadow-lg'
            : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/50 shadow-md hover:border-[#1E40AF]/50 hover:bg-[#1E40AF]/10'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-[10px] font-semibold">Filters</span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-4 space-y-4 animate-fade-up max-h-[60vh] overflow-y-auto">
          {/* Header with close */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Routes</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
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
                  onClick={() => handleDistancePreset(preset.id as 'national' | 'continental' | 'global')}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.distance === preset.id
                      ? 'bg-[#1E40AF]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1E40AF]/10'
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
                    filters.types.includes(type.id)
                      ? 'bg-[#1E40AF]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1E40AF]/10'
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
                    filters.difficulty.includes(diff.id)
                      ? 'bg-[#1E40AF]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1E40AF]/10'
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
                    filters.duration === dur.id
                      ? 'bg-[#1E40AF]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1E40AF]/10'
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
                    filters.surface.includes(surf.id)
                      ? 'bg-[#1E40AF]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1E40AF]/10'
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
                      ? 'bg-[#1E40AF]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1E40AF]/10'
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
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-[#1E40AF]/80 text-white hover:bg-[#1E40AF] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RoutesFiltersPanel;
