import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal, X, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ServicesFilterState {
  distance: number | 'national' | 'international';
  types: string[];
  minRating: number | null;
  openNow: boolean;
}

interface ServicesFiltersPanelProps {
  filters: ServicesFilterState;
  onFiltersChange: (filters: ServicesFilterState) => void;
}

const ServicesFiltersPanel = ({ filters, onFiltersChange }: ServicesFiltersPanelProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const distancePresets = [
    { id: 'national', label: 'National' },
    { id: 'international', label: 'International' },
  ];

  const typeOptions = [
    { id: 'mechanics', label: 'Mechanics' },
    { id: 'detailing', label: 'Detailing' },
    { id: 'parts', label: 'Parts' },
    { id: 'tyres', label: 'Tyres' },
    { id: 'mot', label: 'MOT' },
    { id: 'tuning', label: 'Tuning' },
    { id: 'bodywork', label: 'Bodywork' },
    { id: 'car-wash', label: 'Car Wash' },
    { id: 'ev-charging', label: 'EV Charging' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'wheels', label: 'Wheels' },
    { id: 'glass-repair', label: 'Glass Repair' },
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

  const handleDistanceChange = (value: number[]) => {
    onFiltersChange({ ...filters, distance: value[0] });
  };

  const handleDistancePreset = (preset: 'national' | 'international') => {
    onFiltersChange({ 
      ...filters, 
      distance: filters.distance === preset ? 25 : preset 
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ 
      ...filters, 
      minRating: filters.minRating === rating ? null : rating 
    });
  };

  const handleOpenNowChange = (checked: boolean) => {
    onFiltersChange({ ...filters, openNow: checked });
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
              ? 'bg-services/80 text-white border-services/80 shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-services/50 hover:bg-services/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Filters</span>
        </button>

        {/* Add Service Button */}
        <button
          onClick={() => navigate('/add/service')}
          className="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-services text-services-foreground shadow-sm hover:bg-services/90 active:scale-[0.97] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-semibold whitespace-nowrap">Add</span>
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-4 space-y-4 animate-fade-up">
          {/* Header with close */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Services</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFiltersChange({
                  distance: 25, types: [], minRating: null, openNow: false,
                })}
                className="text-[10px] font-medium text-services hover:text-services/70 transition-colors"
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
                      ? 'bg-services/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-services/10'
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
                      ? 'bg-services/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-services/10'
                  }`}
                >
                  {type.label}
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
                      ? 'bg-services/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-services/10'
                  }`}
                >
                  <Star className="w-3 h-3" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Open Now Toggle */}
          <div className="flex items-center justify-between py-1">
            <p className="text-xs font-medium text-foreground">Open Now</p>
            <Switch
              checked={filters.openNow}
              onCheckedChange={handleOpenNowChange}
              className="data-[state=checked]:bg-services"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-services/80 text-white hover:bg-services transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesFiltersPanel;
