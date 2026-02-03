import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, SlidersHorizontal, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface EventsFilterState {
  distance: number | 'national' | 'continental' | 'global';
  types: string[];
  dateFilter: string | null;
  specificDate: Date | undefined;
}

interface EventsFiltersPanelProps {
  filters: EventsFilterState;
  onFiltersChange: (filters: EventsFilterState) => void;
}

const EventsFiltersPanel = ({ filters, onFiltersChange }: EventsFiltersPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const distancePresets = [
    { id: 'national', label: 'National' },
    { id: 'continental', label: 'Continental' },
    { id: 'global', label: 'Global' },
  ];

  const typeOptions = [
    { id: 'meets', label: 'Meets' },
    { id: 'events', label: 'Events' },
    { id: 'track-days', label: 'Track Days' },
    { id: 'drives', label: 'Drives' },
  ];

  const dateOptions = [
    { id: 'today', label: 'Today' },
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
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

  const handleDistancePreset = (preset: 'national' | 'continental' | 'global') => {
    onFiltersChange({ 
      ...filters, 
      distance: filters.distance === preset ? 25 : preset 
    });
  };

  const handleDateFilter = (dateId: string) => {
    onFiltersChange({ 
      ...filters, 
      dateFilter: filters.dateFilter === dateId ? null : dateId,
      specificDate: undefined
    });
  };

  const handleSpecificDate = (date: Date | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateFilter: date ? 'specific' : null,
      specificDate: date 
    });
    if (date) setIsDatePickerOpen(false);
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
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
          isOpen
            ? 'bg-[#7B1E22]/80 text-white border-[#7B1E22]/80'
            : 'bg-card text-muted-foreground border-border hover:border-[#7B1E22]/50 hover:bg-[#7B1E22]/10'
        }`}
      >
        <SlidersHorizontal className="w-5 h-5" />
        <span className="text-sm font-medium">Filters</span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-4 space-y-4 animate-fade-up">
          {/* Header with close */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Events & Drives</h3>
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
                      ? 'bg-[#1B4D3E]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1B4D3E]/10'
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
                      ? 'bg-[#1B4D3E]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1B4D3E]/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Date</p>
            <div className="flex flex-wrap gap-1.5">
              {dateOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleDateFilter(option.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.dateFilter === option.id
                      ? 'bg-[#1B4D3E]/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-[#1B4D3E]/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              
              {/* Specific Date Picker */}
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all flex items-center gap-1 ${
                      filters.dateFilter === 'specific'
                        ? 'bg-[#1B4D3E]/80 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-[#1B4D3E]/10'
                    }`}
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {filters.specificDate 
                      ? format(filters.specificDate, 'MMM d, yyyy')
                      : 'Pick Date'
                    }
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.specificDate}
                    onSelect={handleSpecificDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-[#1B4D3E]/80 text-white hover:bg-[#1B4D3E] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsFiltersPanel;
