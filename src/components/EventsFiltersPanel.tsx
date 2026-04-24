import { useState, useEffect, useMemo, Component, type ReactNode, type ErrorInfo } from 'react';
import { SlidersHorizontal, X, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Slider } from '@/components/ui/slider';
import { getMakesByType } from '@/data/vehicles';

// Error boundary to prevent white screen if this panel crashes
class FilterErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { /* swallow */ }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

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
  // New fields matching AddEvent
  filterEventTypes: string[];
  filterVehicleFocus: string;
  filterMeetStyles: string[];
  filterFreeOnly: boolean;
  filterDateFrom: string;
  filterDateTo: string;
  filterGarageVehicleId: string | null;
  filterGarageVehicle: any | null;
  specificYears: string[];
  filterSpecificBrands: string[];
}

interface EventsFiltersPanelProps {
  filters: EventsFilterState;
  onFiltersChange: (filters: EventsFilterState) => void;
}

// Constants matching AddEvent exactly
const EVENT_TYPES = [
  { id: 'Meets', label: 'Meets' },
  { id: 'Shows', label: 'Shows' },
  { id: 'Drive', label: 'Drive Out' },
  { id: 'Track Day', label: 'Track Day' },
  { id: 'Motorsport', label: 'Motorsport' },
  { id: 'Autojumble', label: 'Autojumble' },
  { id: 'Off-Road', label: 'Off-Road' },
  { id: 'Other', label: 'Other' },
];

const VEHICLE_FOCUS_OPTIONS = [
  { id: 'all', label: 'All welcome' },
  { id: 'cars_only', label: 'Cars only' },
  { id: 'motorcycles_only', label: 'Motorcycles only' },
  { id: 'specific_makes', label: 'Specific Brand' },
];

const MEET_STYLE_TAGS = [
  'JDM', 'Supercars', 'Muscle Car', 'American', 'European',
  '4x4', 'Classics', 'Vintage', 'Modified', 'Show & Shine',
  'Track Focus', 'Charity', 'Family Friendly', 'Electric', 'Stance',
];

function safeFormatDate(date: Date | undefined | null, fmt: string): string {
  if (!date) return '';
  try { return format(date instanceof Date ? date : new Date(date), fmt); }
  catch { return ''; }
}

const EventsFiltersPanelInner = ({ filters, onFiltersChange }: EventsFiltersPanelProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [myGarageVehicles, setMyGarageVehicles] = useState<any[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [eventStyleSearch, setEventStyleSearch] = useState('');
  const [eraSearch, setEraSearch] = useState('');
  const allMakes = useMemo(() => getMakesByType('all'), []);

  // Load user garage vehicles for filter
  useEffect(() => {
    if (!user?.id) return;
    const loadGarage = async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('id, make, model, year, variant, vehicle_type, photos, is_primary')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });
      setMyGarageVehicles(data || []);
    };
    loadGarage();

    const channel = supabase
      .channel('garage-filter-vehicles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vehicles',
        filter: `user_id=eq.${user.id}`,
      }, () => loadGarage())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeof filters.distance === 'number' && filters.distance > 0) count++;
    if (filters.filterEventTypes?.length > 0) count++;
    if (filters.filterVehicleFocus && filters.filterVehicleFocus !== 'all') count++;
    if (filters.filterMeetStyles?.length > 0) count++;
    if (filters.filterFreeOnly) count++;
    if (filters.specificYears?.length > 0) count++;
    if (filters.filterSpecificBrands?.length > 0) count++;
    if (filters.filterGarageVehicleId) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      distance: 0,
      filterEventTypes: [],
      filterVehicleFocus: 'all',
      filterMeetStyles: [],
      filterFreeOnly: false,
      filterDateFrom: '',
      filterDateTo: '',
      filterGarageVehicleId: null,
      filterGarageVehicle: null,
      specificYears: [],
      filterSpecificBrands: [],
      // Also clear legacy filters
      types: [],
      dateFilter: null,
      specificDate: undefined,
      vehicleTypes: [],
      vehicleBrands: [],
      vehicleCategories: [],
      vehicleAges: [],
      eventSize: null,
      entryFee: null,
      clubHosted: false,
    });
  };

  const toggleEventType = (typeId: string) => {
    const current = filters.filterEventTypes || [];
    const newTypes = current.includes(typeId)
      ? current.filter(t => t !== typeId)
      : [...current, typeId];
    onFiltersChange({ ...filters, filterEventTypes: newTypes });
  };

  const toggleMeetStyle = (tag: string) => {
    const current = filters.filterMeetStyles || [];
    const newStyles = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    onFiltersChange({ ...filters, filterMeetStyles: newStyles });
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
                filters.specificDate
                  ? 'bg-events/80 text-white border-events/80 shadow-lg'
                  : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-events/50 hover:bg-events/10'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-[10px] font-semibold whitespace-nowrap">
                {filters.specificDate
                  ? safeFormatDate(filters.specificDate, 'MMM d') || 'Date'
                  : 'Date'}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.specificDate}
              onSelect={(date) => {
                onFiltersChange({
                  ...filters,
                  dateFilter: date ? 'specific' : null,
                  specificDate: date || undefined,
                });
                if (date) setIsDatePickerOpen(false);
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Filter Button with badge */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-10 flex-1 flex items-center justify-center gap-1.5 px-4 rounded-xl border transition-all duration-300 ${
            isOpen
              ? 'bg-events/80 text-white border-events/80 shadow-lg'
              : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-events/50 hover:bg-events/10'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-events text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-4 space-y-5 animate-fade-up max-h-[65vh] overflow-y-auto">
          {/* Header with active count and clear */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Events</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] font-medium text-events hover:text-events/70 transition-colors"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between bg-events/5 rounded-lg px-3 py-2 border border-events/20">
              <span className="text-[11px] font-semibold text-events">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </span>
            </div>
          )}

          {/* DISTANCE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Distance</p>
              <span className="text-xs text-muted-foreground">
                {typeof filters.distance === 'number' && filters.distance > 0 ? `Within ${filters.distance} miles` : 'Any distance'}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[
                { value: 0, label: 'Any' },
                { value: 5, label: '5mi' },
                { value: 10, label: '10mi' },
                { value: 25, label: '25mi' },
                { value: 50, label: '50mi' },
                { value: 100, label: '100mi' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onFiltersChange({ ...filters, distance: opt.value })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    filters.distance === opt.value
                      ? 'bg-events text-white border-events'
                      : 'bg-white text-muted-foreground border-border/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* EVENT TYPE */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Event Type</p>
            <div className="grid grid-cols-4 gap-1.5">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleEventType(type.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                    (filters.filterEventTypes || []).includes(type.id)
                      ? 'bg-events/10 border-events text-events'
                      : 'bg-muted/30 border-border/30 text-muted-foreground'
                  }`}
                >
                  <span className="text-[10px] font-semibold">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* VEHICLE FOCUS — 6-option grid matching AddEvent */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Vehicle Focus</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All welcome', sub: 'Any vehicle can attend' },
                { id: 'cars_only', label: 'Cars only', sub: 'Four wheeled vehicles only' },
                { id: 'motorcycles_only', label: 'Motorcycles only', sub: 'Two wheeled vehicles only' },
                { id: 'specific_makes', label: 'Specific Brand', sub: 'Choose which brands' },
                { id: 'event_style', label: 'Event Style', sub: 'Style of the event' },
                { id: 'vehicle_era', label: 'Vehicle Era', sub: 'Era of vehicles' },
              ].map(opt => (
                <button key={opt.id}
                  onClick={() => onFiltersChange({ ...filters, filterVehicleFocus: filters.filterVehicleFocus === opt.id ? 'all' : opt.id })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                    filters.filterVehicleFocus === opt.id ? 'bg-events/10 border-events' : 'bg-muted/30 border-border/50'
                  }`}>
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-[9px] text-muted-foreground leading-tight">{opt.sub}</p>
                </button>
              ))}
            </div>

            {/* Specific Brand search */}
            {filters.filterVehicleFocus === 'specific_makes' && (
              <div className="mt-2 space-y-1.5">
                {(filters.filterSpecificBrands || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(filters.filterSpecificBrands || []).map((b: string) => (
                      <button key={b} onClick={() => onFiltersChange({ ...filters, filterSpecificBrands: (filters.filterSpecificBrands || []).filter((x: string) => x !== b) })}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-events text-events-foreground text-[10px] font-semibold">{b} <span className="text-[8px]">×</span></button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input type="text" placeholder="Search brands..." value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
                    className="w-full border border-border/50 rounded-xl px-3 py-2 text-xs bg-background" />
                  {brandSearch && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-1 z-50 max-h-36 overflow-y-auto shadow-lg">
                      {allMakes.filter((m: any) => m.name.toLowerCase().includes(brandSearch.toLowerCase())).filter((m: any) => !(filters.filterSpecificBrands || []).includes(m.name)).slice(0, 8).map((m: any) => (
                        <button key={m.id} onClick={() => { onFiltersChange({ ...filters, filterSpecificBrands: [...(filters.filterSpecificBrands || []), m.name] }); setBrandSearch(''); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 border-b border-border/30 last:border-none">{m.name}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Style search */}
            {filters.filterVehicleFocus === 'event_style' && (
              <div className="mt-2 space-y-1.5">
                {(filters.filterMeetStyles || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(filters.filterMeetStyles || []).map((s: string) => (
                      <button key={s} onClick={() => onFiltersChange({ ...filters, filterMeetStyles: (filters.filterMeetStyles || []).filter((x: string) => x !== s) })}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-events text-events-foreground text-[10px] font-semibold">{s} <span className="text-[8px]">×</span></button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input type="text" placeholder="Search event styles..." value={eventStyleSearch} onChange={e => setEventStyleSearch(e.target.value)}
                    className="w-full border border-border/50 rounded-xl px-3 py-2 text-xs bg-background" />
                  {eventStyleSearch && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-1 z-50 max-h-36 overflow-y-auto shadow-lg">
                      {MEET_STYLE_TAGS.filter(t => !(filters.filterMeetStyles || []).includes(t)).filter(t => t.toLowerCase().includes(eventStyleSearch.toLowerCase())).map(t => (
                        <button key={t} onClick={() => { onFiltersChange({ ...filters, filterMeetStyles: [...(filters.filterMeetStyles || []), t] }); setEventStyleSearch(''); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 border-b border-border/30 last:border-none">{t}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vehicle Era search */}
            {filters.filterVehicleFocus === 'vehicle_era' && (
              <div className="mt-2 space-y-1.5">
                {(filters.specificYears || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(filters.specificYears || []).map((y: string) => (
                      <button key={y} onClick={() => onFiltersChange({ ...filters, specificYears: (filters.specificYears || []).filter((x: string) => x !== y) })}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-events text-events-foreground text-[10px] font-semibold">{y} <span className="text-[8px]">×</span></button>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <input type="text" placeholder="Search vehicle era..." value={eraSearch} onChange={e => setEraSearch(e.target.value)}
                    className="w-full border border-border/50 rounded-xl px-3 py-2 text-xs bg-background" />
                  {eraSearch && (
                    <div className="absolute top-full left-0 right-0 bg-card border border-border/50 rounded-xl mt-1 z-50 max-h-36 overflow-y-auto shadow-lg">
                      {['Pre 50s', 'Pre 60s', 'Pre 70s', 'Pre 80s', 'Pre 90s', 'Pre 00s'].filter(y => !(filters.specificYears || []).includes(y)).filter(y => y.toLowerCase().includes(eraSearch.toLowerCase())).map(y => (
                        <button key={y} onClick={() => { onFiltersChange({ ...filters, specificYears: [...(filters.specificYears || []), y] }); setEraSearch(''); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-muted/50 border-b border-border/30 last:border-none">{y}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* FREE ENTRY ONLY */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-foreground">Free entry only</p>
              <p className="text-[10px] text-muted-foreground">Only show free events</p>
            </div>
            <button
              onClick={() => onFiltersChange({ ...filters, filterFreeOnly: !filters.filterFreeOnly })}
              className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${
                filters.filterFreeOnly ? 'bg-foreground' : 'bg-muted border border-border/50'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow-sm transition-all ${
                filters.filterFreeOnly ? 'left-[26px]' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* MY GARAGE VEHICLES */}
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">My Garage — Compatible Events</p>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Select a vehicle to only show events it can attend
            </p>

            {myGarageVehicles.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-[11px] text-muted-foreground">Add vehicles to My Garage to use this filter</p>
                <button
                  onClick={() => navigate('/add/vehicle')}
                  className="mt-2 text-xs font-semibold text-events"
                >
                  Add a vehicle →
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Any vehicle option */}
                <button
                  onClick={() => onFiltersChange({
                    ...filters,
                    filterGarageVehicleId: null,
                    filterGarageVehicle: null,
                  })}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    !filters.filterGarageVehicleId
                      ? 'bg-muted/50 border-border/50'
                      : 'bg-muted/20 border-border/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                    ALL
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">Any vehicle</p>
                    <p className="text-[10px] text-muted-foreground">Show all events</p>
                  </div>
                  {!filters.filterGarageVehicleId && (
                    <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-background" />
                    </div>
                  )}
                </button>

                {/* Individual garage vehicles */}
                {myGarageVehicles.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => {
                      if (filters.filterGarageVehicleId === vehicle.id) {
                        onFiltersChange({
                          ...filters,
                          filterGarageVehicleId: null,
                          filterGarageVehicle: null,
                        });
                      } else {
                        onFiltersChange({
                          ...filters,
                          filterGarageVehicleId: vehicle.id,
                          filterGarageVehicle: vehicle,
                        });
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      filters.filterGarageVehicleId === vehicle.id
                        ? 'bg-events/10 border-events'
                        : 'bg-muted/20 border-border/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted/30 overflow-hidden flex items-center justify-center">
                      {vehicle.photos?.[0] ? (
                        <img src={vehicle.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {vehicle.vehicle_type === 'motorcycle' ? 'BIKE' : 'CAR'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {vehicle.year}
                        {vehicle.variant && ` · ${vehicle.variant}`}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      filters.filterGarageVehicleId === vehicle.id
                        ? 'bg-events border-events'
                        : 'border-border/50'
                    }`}>
                      {filters.filterGarageVehicleId === vehicle.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-2.5 mt-1">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong>Cars Only</strong> events show when you select a car<br/>
                <strong>Motorcycle Only</strong> events show when you select a bike<br/>
                <strong>Brand events</strong> show when your vehicle make matches
              </p>
            </div>
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

const EventsFiltersPanel = (props: EventsFiltersPanelProps) => (
  <FilterErrorBoundary>
    <EventsFiltersPanelInner {...props} />
  </FilterErrorBoundary>
);

export default EventsFiltersPanel;
