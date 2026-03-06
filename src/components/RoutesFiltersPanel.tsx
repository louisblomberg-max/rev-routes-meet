import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal, X, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RoutesFilterState {
  distance: number | 'national' | 'international';
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

const chipBase = 'px-3.5 py-2 rounded-full text-[11px] font-medium border transition-all duration-200';
const chipActive = 'bg-primary text-primary-foreground border-primary';
const chipInactive = 'bg-secondary text-muted-foreground border-border/50 hover:border-border hover:text-foreground';

const RoutesFiltersPanel = ({ filters, onFiltersChange }: RoutesFiltersPanelProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const distancePresets = [
    { id: 'national', label: 'National' },
    { id: 'international', label: 'International' },
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

  const handleDistancePreset = (preset: 'national' | 'international') => {
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
      {/* Filter Bar Row - Glass Container */}
      <div className="flex items-center gap-2 bg-secondary/85 backdrop-blur-xl border border-border/30 rounded-[18px] p-1.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-9 flex-1 flex items-center justify-center gap-1.5 px-4 rounded-full border transition-all duration-300 ${
            isOpen ? chipActive : chipInactive
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">Filters</span>
        </button>

        <button
          onClick={() => navigate('/add/route')}
          className="h-9 flex items-center gap-1.5 px-3.5 rounded-full bg-primary text-primary-foreground shadow-glow-red hover:bg-primary/90 active:scale-[0.97] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium whitespace-nowrap">Add</span>
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/30 shadow-premium p-5 space-y-5 animate-fade-up max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Routes</h3>
            <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Distance */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Distance</p>
              <span className="text-xs text-muted-foreground">{getDistanceLabel()}</span>
            </div>
            <Slider value={[isDistanceNumeric ? distanceValue : 25]} onValueChange={handleDistanceChange} min={1} max={50} step={1} className="w-full" disabled={!isDistanceNumeric} />
            <div className="flex gap-2 mt-2">
              {distancePresets.map((preset) => (
                <button key={preset.id} onClick={() => handleDistancePreset(preset.id as 'national' | 'international')}
                  className={`flex-1 ${chipBase} ${filters.distance === preset.id ? chipActive : chipInactive}`}
                >{preset.label}</button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Type</p>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((type) => (
                <button key={type.id} onClick={() => toggleType(type.id)}
                  className={`${chipBase} ${filters.types.includes(type.id) ? chipActive : chipInactive}`}
                >{type.label}</button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Difficulty</p>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((diff) => (
                <button key={diff.id} onClick={() => toggleDifficulty(diff.id)}
                  className={`${chipBase} ${filters.difficulty.includes(diff.id) ? chipActive : chipInactive}`}
                >{diff.label}</button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Duration</p>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((dur) => (
                <button key={dur.id} onClick={() => handleDurationChange(dur.id)}
                  className={`${chipBase} ${filters.duration === dur.id ? chipActive : chipInactive}`}
                >{dur.label}</button>
              ))}
            </div>
          </div>

          {/* Surface */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Surface</p>
            <div className="flex flex-wrap gap-2">
              {surfaceOptions.map((surf) => (
                <button key={surf.id} onClick={() => toggleSurface(surf.id)}
                  className={`${chipBase} ${filters.surface.includes(surf.id) ? chipActive : chipInactive}`}
                >{surf.label}</button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Minimum Rating</p>
            <div className="flex gap-2">
              {ratingOptions.map((option) => (
                <button key={option.value} onClick={() => handleRatingChange(option.value)}
                  className={`flex-1 flex items-center justify-center gap-1 ${chipBase} ${filters.minRating === option.value ? chipActive : chipInactive}`}
                >
                  <Star className="w-3 h-3" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply */}
          <button onClick={() => setIsOpen(false)}
            className="w-full py-3 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-glow-red"
          >Apply Filters</button>
        </div>
      )}
    </div>
  );
};

export default RoutesFiltersPanel;
