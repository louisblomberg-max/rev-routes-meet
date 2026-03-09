import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, SlidersHorizontal, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface EventsFilterState {
  distance: number | 'national' | 'international';
  types: string[];
  dateFilter: string | null;
  specificDate: Date | undefined;
  vehicleTypes: string[];
  eventSize: string | null;
  entryFee: string | null;
  clubHosted: boolean;
}

interface EventsFiltersPanelProps {
  filters: EventsFilterState;
  onFiltersChange: (filters: EventsFilterState) => void;
}

const EventsFiltersPanel = ({ filters, onFiltersChange }: EventsFiltersPanelProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const distancePresets = [
    { id: 'national', label: 'National' },
    { id: 'international', label: 'International' },
  ];

  const typeOptions = [
    { id: 'all', label: 'All' },
    { id: 'meets', label: 'Meets' },
    { id: 'shows', label: 'Shows' },
    { id: 'drive', label: 'Drive' },
    { id: 'track-day', label: 'Track Day' },
    { id: 'motorsport', label: 'Motorsport' },
    { id: 'autojumble', label: 'Autojumble' },
  ];

  const dateOptions = [
    { id: 'today', label: 'Today' },
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
  ];

  const vehicleTypeOptions = [
    { id: 'all-vehicles', label: 'All' },
    { id: 'cars', label: 'Cars' },
    { id: 'bikes', label: 'Bikes' },
    { id: 'my-vehicles', label: 'My Vehicles' },
  ];

  const eventSizeOptions = [
    { id: 'small', label: '< 20' },
    { id: 'medium', label: '20-50' },
    { id: 'large', label: '50-100' },
    { id: 'massive', label: '100+' },
  ];

  const entryFeeOptions = [
    { id: 'free', label: 'Free' },
    { id: 'paid', label: 'Paid' },
  ];

  const toggleType = (typeId: string) => {
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter(t => t !== typeId)
      : [...filters.types, typeId];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleVehicleType = (vehicleTypeId: string) => {
    const newVehicleTypes = filters.vehicleTypes.includes(vehicleTypeId)
      ? filters.vehicleTypes.filter(v => v !== vehicleTypeId)
      : [...filters.vehicleTypes, vehicleTypeId];
    onFiltersChange({ ...filters, vehicleTypes: newVehicleTypes });
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

  const handleEventSizeChange = (sizeId: string) => {
    onFiltersChange({ 
      ...filters, 
      eventSize: filters.eventSize === sizeId ? null : sizeId 
    });
  };

  const handleEntryFeeChange = (feeId: string) => {
    onFiltersChange({ 
      ...filters, 
      entryFee: filters.entryFee === feeId ? null : feeId 
    });
  };

  const handleClubHostedChange = (checked: boolean) => {
    onFiltersChange({ ...filters, clubHosted: checked });
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
        {/* Quick Date Picker */}
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <button
              className={`h-10 flex items-center gap-1.5 px-3 rounded-xl border transition-all duration-300 ${
                filters.dateFilter === 'specific'
                  ? 'bg-events/80 text-white border-events/80 shadow-lg'
                  : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-events/50 hover:bg-events/10'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[10px] font-semibold whitespace-nowrap">
                {filters.specificDate 
                  ? format(filters.specificDate, 'MMM d')
                  : 'Date'
                }
              </span>
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

        {/* Filter Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-10 flex-1 flex items-center justify-center gap-1.5 px-4 rounded-xl border transition-all duration-300 ${
            isOpen
              ? 'bg-events/80 text-white border-events/80 shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-events/50 hover:bg-events/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Filters</span>
        </button>

        {/* Add Event Button */}
        <button
          onClick={() => navigate('/add/event')}
          className="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-events text-events-foreground shadow-sm hover:bg-events/90 active:scale-[0.97] transition-all"
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
            <h3 className="text-sm font-semibold text-foreground">Filter Events & Drives</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFiltersChange({
                  distance: 25, types: [], dateFilter: null, specificDate: undefined,
                  vehicleTypes: [], eventSize: null, entryFee: null, clubHosted: false,
                })}
                className="text-[10px] font-medium text-events hover:text-events/70 transition-colors"
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
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
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
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Type Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Vehicle Type</p>
            <div className="flex flex-wrap gap-1.5">
              {vehicleTypeOptions.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => toggleVehicleType(vehicle.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.vehicleTypes.includes(vehicle.id)
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
                  }`}
                >
                  {vehicle.label}
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
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
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
                        ? 'bg-events/80 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-events/10'
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

          {/* Event Size Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Event Size</p>
            <div className="flex gap-1.5">
              {eventSizeOptions.map((size) => (
                <button
                  key={size.id}
                  onClick={() => handleEventSizeChange(size.id)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.eventSize === size.id
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Entry Fee Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Entry Fee</p>
            <div className="flex gap-1.5">
              {entryFeeOptions.map((fee) => (
                <button
                  key={fee.id}
                  onClick={() => handleEntryFeeChange(fee.id)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.entryFee === fee.id
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
                  }`}
                >
                  {fee.label}
                </button>
              ))}
            </div>
          </div>

          {/* Club Hosted Toggle */}
          <div className="flex items-center justify-between py-1">
            <p className="text-xs font-medium text-foreground">Club Hosted Only</p>
            <Switch
              checked={filters.clubHosted}
              onCheckedChange={handleClubHostedChange}
              className="data-[state=checked]:bg-events"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 rounded-lg text-sm font-medium bg-events/80 text-white hover:bg-events transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsFiltersPanel;
