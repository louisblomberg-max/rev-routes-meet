import { useState, useMemo, useRef, useEffect } from 'react';
import { useGarage } from '@/contexts/GarageContext';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, SlidersHorizontal, X, Plus, Search, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export interface EventsFilterState {
  distance: number | 'national' | 'international';
  types: string[];
  dateFilter: string | null;
  specificDate: Date | undefined;
  vehicleTypes: string[];
  vehicleBrands: string[];
  vehicleCategories: string[];
  vehicleAges: string[];
  eventSize: string | null;
  entryFee: string | null;
  clubHosted: boolean;
}

interface EventsFiltersPanelProps {
  filters: EventsFilterState;
  onFiltersChange: (filters: EventsFilterState) => void;
}

const CAR_BRANDS = [
  'Abarth','Alfa Romeo','Alpine','Aston Martin','Audi','Bentley','BMW','Bugatti',
  'Cadillac','Chevrolet','Chrysler','Citroën','Cupra','Dacia','Dodge','Ferrari',
  'Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep',
  'Kia','Koenigsegg','Lamborghini','Land Rover','Lexus','Lotus','Maserati',
  'Mazda','McLaren','Mercedes-Benz','Mini','Mitsubishi','Nissan','Pagani',
  'Peugeot','Polestar','Porsche','Renault','Rolls Royce','Seat','Skoda',
  'Subaru','Suzuki','Tesla','Toyota','Vauxhall','Volkswagen','Volvo',
];

const BIKE_BRANDS = [
  'Aprilia','Benelli','BMW Motorrad','CFMoto','Ducati','Harley-Davidson','Honda',
  'Husqvarna','Indian','Kawasaki','KTM','Moto Guzzi','MV Agusta','Royal Enfield',
  'Suzuki','Triumph','Yamaha','Zero Motorcycles',
];

const POPULAR_CAR_BRANDS = ['BMW','Porsche','Mercedes-Benz','Audi','Ford','Ferrari','Lamborghini','Nissan'];
const POPULAR_BIKE_BRANDS = ['Ducati','Harley-Davidson','Honda','Kawasaki','Yamaha','Triumph','KTM','BMW Motorrad'];

const EventsFiltersPanel = ({ filters, onFiltersChange }: EventsFiltersPanelProps) => {
  const navigate = useNavigate();
  const { vehicles } = useGarage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const availableBrands = useMemo(() => {
    if (filters.vehicleTypes.length === 0) return [...CAR_BRANDS, ...BIKE_BRANDS.filter(b => !CAR_BRANDS.includes(b))];
    const brands = new Set<string>();
    for (const vt of filters.vehicleTypes) {
      if (vt === 'cars' || vt === 'big_stuff' || vt === 'military') CAR_BRANDS.forEach(b => brands.add(b));
      else if (vt === 'bikes') BIKE_BRANDS.forEach(b => brands.add(b));
    }
    return brands.size > 0 ? [...brands] : [...CAR_BRANDS, ...BIKE_BRANDS.filter(b => !CAR_BRANDS.includes(b))];
  }, [filters.vehicleTypes]);

  const popularBrands = useMemo(() => {
    if (filters.vehicleTypes.length === 0) return [...POPULAR_CAR_BRANDS, ...POPULAR_BIKE_BRANDS.filter(b => !POPULAR_CAR_BRANDS.includes(b))];
    const pBrands = new Set<string>();
    for (const vt of filters.vehicleTypes) {
      if (vt === 'cars' || vt === 'big_stuff' || vt === 'military') POPULAR_CAR_BRANDS.forEach(b => pBrands.add(b));
      else if (vt === 'bikes') POPULAR_BIKE_BRANDS.forEach(b => pBrands.add(b));
    }
    return pBrands.size > 0 ? [...pBrands] : [...POPULAR_CAR_BRANDS, ...POPULAR_BIKE_BRANDS.filter(b => !POPULAR_CAR_BRANDS.includes(b))];
  }, [filters.vehicleTypes]);

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    if (!query) {
      const rest = availableBrands.filter(b => !popularBrands.includes(b));
      return [...popularBrands, ...rest].filter(b => !filters.vehicleBrands.includes(b)).slice(0, 8);
    }
    return availableBrands
      .filter(b => b.toLowerCase().includes(query) && !filters.vehicleBrands.includes(b))
      .slice(0, 8);
  }, [brandSearch, availableBrands, popularBrands, filters.vehicleBrands]);

  const distancePresets = [
    { id: 'national', label: 'National' },
    { id: 'international', label: 'International' },
  ];

  // These IDs match EventType values in the model exactly
  const typeOptions = [
    { id: 'all', label: 'All' },
    { id: 'meets', label: 'Meets' },
    { id: 'shows', label: 'Shows' },
    { id: 'drive', label: 'Drive' },
    { id: 'track-day', label: 'Track Day' },
    { id: 'motorsport', label: 'Motorsport' },
    { id: 'autojumble', label: 'Autojumble' },
    { id: 'off-road', label: 'Off-Road' },
  ];

  const dateOptions = [
    { id: 'today', label: 'Today' },
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
  ];

  const vehicleTypeOptions = [
    { id: 'all', label: 'All' },
    { id: 'cars', label: 'Cars' },
    { id: 'bikes', label: 'Bikes' },
    { id: 'big_stuff', label: 'Big Stuff' },
    { id: 'military', label: 'Military' },
  ];

  // IDs match the structured vehicleCategories values
  const vehicleCategoryOptions = [
    { id: 'jdm', label: 'JDM' },
    { id: 'supercars', label: 'Supercars' },
    { id: 'muscle-car', label: 'Muscle Car' },
    { id: 'american', label: 'American' },
    { id: 'european', label: 'European' },
    { id: '4x4', label: '4x4' },
    { id: 'row', label: 'ROW' },
    { id: 'modern', label: 'Modern' },
    { id: 'classics', label: 'Classics' },
    { id: 'vintage', label: 'Vintage' },
  ];

  // IDs match the structured vehicleAge values
  const vehicleAgeOptions = [
    { id: 'all', label: 'All' },
    { id: 'pre_2000', label: "Pre 00's" },
    { id: 'pre_1990', label: "Pre 90's" },
    { id: 'pre_1980', label: "Pre 80's" },
    { id: 'pre_1970', label: "Pre 70's" },
    { id: 'pre_1960', label: "Pre 60's" },
    { id: 'pre_1950', label: "Pre 50's" },
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
    if (typeId === 'all') {
      onFiltersChange({ ...filters, types: [] });
      return;
    }
    const newTypes = filters.types.includes(typeId)
      ? filters.types.filter(t => t !== typeId)
      : [...filters.types.filter(t => t !== 'all'), typeId];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleVehicleType = (vehicleTypeId: string) => {
    if (vehicleTypeId === 'all') {
      onFiltersChange({ ...filters, vehicleTypes: [], vehicleBrands: [] });
      setBrandSearch('');
      return;
    }
    const isAlreadySelected = filters.vehicleTypes.includes(vehicleTypeId);
    const newTypes = isAlreadySelected
      ? filters.vehicleTypes.filter(t => t !== vehicleTypeId)
      : [...filters.vehicleTypes, vehicleTypeId];
    onFiltersChange({
      ...filters,
      vehicleTypes: newTypes,
      vehicleBrands: newTypes.length === 0 ? [] : filters.vehicleBrands,
    });
    setBrandSearch('');
  };

  const toggleVehicleCategory = (catId: string) => {
    const isSelected = filters.vehicleCategories.includes(catId);
    onFiltersChange({
      ...filters,
      vehicleCategories: isSelected
        ? filters.vehicleCategories.filter(c => c !== catId)
        : [...filters.vehicleCategories, catId],
    });
  };

  const toggleVehicleAge = (ageId: string) => {
    if (ageId === 'all') {
      onFiltersChange({ ...filters, vehicleAges: [] });
      return;
    }
    const isSelected = filters.vehicleAges.includes(ageId);
    onFiltersChange({
      ...filters,
      vehicleAges: isSelected
        ? filters.vehicleAges.filter(a => a !== ageId)
        : [...filters.vehicleAges, ageId],
    });
  };

  const addBrand = (brand: string) => {
    onFiltersChange({ ...filters, vehicleBrands: [...filters.vehicleBrands, brand] });
    setBrandSearch('');
  };

  const removeBrand = (brand: string) => {
    onFiltersChange({ ...filters, vehicleBrands: filters.vehicleBrands.filter(b => b !== brand) });
  };

  const handleDistanceChange = (value: number[]) => {
    onFiltersChange({ ...filters, distance: value[0] });
  };

  const handleDistancePreset = (preset: 'national' | 'international') => {
    onFiltersChange({
      ...filters,
      distance: filters.distance === preset ? 25 : preset,
    });
  };

  const handleDateFilter = (dateId: string) => {
    onFiltersChange({
      ...filters,
      dateFilter: filters.dateFilter === dateId ? null : dateId,
      specificDate: undefined,
    });
  };

  const handleSpecificDate = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateFilter: date ? 'specific' : null,
      specificDate: date,
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
                  : 'Date'}
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
            <h3 className="text-sm font-semibold text-foreground">Filter Events</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onFiltersChange({
                  distance: 25, types: [], dateFilter: null, specificDate: undefined,
                  vehicleTypes: [], vehicleBrands: [], vehicleCategories: [], vehicleAges: [], eventSize: null, entryFee: null, clubHosted: false,
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

          {/* Event Type Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Event Type</p>
            <div className="flex flex-wrap gap-1.5">
              {typeOptions.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    (type.id === 'all' && filters.types.length === 0) || filters.types.includes(type.id)
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
                    (vehicle.id === 'all' && filters.vehicleTypes.length === 0) || filters.vehicleTypes.includes(vehicle.id)
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
                  }`}
                >
                  {vehicle.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Brand Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">
              Specific Vehicle Brand
            </p>

            {(
              <div ref={brandRef} className="relative">
                {filters.vehicleBrands.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {filters.vehicleBrands.map((brand) => (
                      <span
                        key={brand}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-events/15 text-events text-[10px] font-semibold border border-events/30"
                      >
                        {brand}
                        <button
                          onClick={() => removeBrand(brand)}
                          className="w-3.5 h-3.5 rounded-full bg-events/20 hover:bg-events/40 flex items-center justify-center transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => {
                      setBrandSearch(e.target.value);
                      setIsBrandDropdownOpen(true);
                    }}
                    onFocus={() => setIsBrandDropdownOpen(true)}
                    placeholder="Search vehicle brand..."
                    className="w-full h-9 pl-8 pr-3 rounded-lg border border-border/60 bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-events/50 focus:ring-1 focus:ring-events/30 transition-all"
                  />
                </div>

                {isBrandDropdownOpen && filteredBrands.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-card border border-border/60 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {!brandSearch.trim() && (
                      <p className="px-3 pt-2 pb-1 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Popular</p>
                    )}
                    {filteredBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          addBrand(brand);
                          setIsBrandDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-events/10 transition-colors"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Vehicle Category Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Vehicle Category</p>
            <div className="flex flex-wrap gap-1.5">
              {vehicleCategoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleVehicleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    filters.vehicleCategories.includes(cat.id)
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Age Filter */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Vehicle Age</p>
            <div className="flex flex-wrap gap-1.5">
              {vehicleAgeOptions.map((age) => (
                <button
                  key={age.id}
                  onClick={() => toggleVehicleAge(age.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    (age.id === 'all' && filters.vehicleAges.length === 0) || filters.vehicleAges.includes(age.id)
                      ? 'bg-events/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-events/10'
                  }`}
                >
                  {age.label}
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
                      : 'Pick Date'}
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
                  onClick={() => onFiltersChange({ ...filters, eventSize: filters.eventSize === size.id ? null : size.id })}
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
                  onClick={() => onFiltersChange({ ...filters, entryFee: filters.entryFee === fee.id ? null : fee.id })}
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
              onCheckedChange={(checked) => onFiltersChange({ ...filters, clubHosted: checked })}
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
