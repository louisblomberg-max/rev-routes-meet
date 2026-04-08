import { useState, useMemo } from 'react';
import { Switch } from '@/components/ui/switch';
import { SlidersHorizontal, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ServicesFilterState {
  distance: number | 'national' | 'international';
  types: string[];
  openNow: boolean;
}

interface ServicesFiltersPanelProps {
  filters: ServicesFilterState;
  onFiltersChange: (filters: ServicesFilterState) => void;
}

const DISTANCE_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 5, label: '5mi' },
  { value: 10, label: '10mi' },
  { value: 25, label: '25mi' },
  { value: 50, label: '50mi' },
  { value: 100, label: '100mi' },
];

// Must match SERVICE_CATEGORIES in AddService.tsx exactly
const TYPE_OPTIONS = [
  'Garages & Mechanics', 'Vehicle Servicing', 'Tyres & Wheels', 'Bodywork & Paint',
  'Detailing & Car Care', 'Tuning & Performance', 'Parts & Accessories',
  'Recovery & Roadside Assistance', 'Storage & Parking', 'Fuel & Petrol', 'EV Charging',
  'Mobile Services', 'Shipping & Transportation',
];

const ServicesFiltersPanel = ({ filters, onFiltersChange }: ServicesFiltersPanelProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const distNum = typeof filters.distance === 'number' ? filters.distance : 25;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeof filters.distance === 'number' && filters.distance > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.openNow) count++;
    return count;
  }, [filters]);

  const clearAll = () => onFiltersChange({ distance: 0, types: [], openNow: false });

  const toggleType = (typeLabel: string) => {
    const next = filters.types.includes(typeLabel) ? filters.types.filter(t => t !== typeLabel) : [...filters.types, typeLabel];
    onFiltersChange({ ...filters, types: next });
  };

  return (
    <div className="space-y-2 animate-fade-up">
      <div className="flex items-center gap-2">
        <button onClick={() => setIsOpen(!isOpen)}
          className={`relative h-10 flex-1 flex items-center justify-center gap-1.5 px-4 rounded-xl border transition-all duration-300 ${
            isOpen ? 'bg-services/80 text-white border-services/80 shadow-lg' : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-services/50 hover:bg-services/10'
          }`}>
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-services text-white text-[10px] font-bold flex items-center justify-center shadow-sm">{activeFilterCount}</span>
          )}
        </button>
        <button onClick={() => navigate('/add/service')} className="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-services text-services-foreground shadow-sm hover:bg-services/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /><span className="text-[10px] font-semibold whitespace-nowrap">Add</span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-4 space-y-4 animate-fade-up max-h-[65vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Services</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && <button onClick={clearAll} className="text-[10px] font-medium text-services hover:text-services/70 transition-colors">Clear all</button>}
              <button onClick={() => setIsOpen(false)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><X className="w-3 h-3 text-muted-foreground" /></button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center bg-services/5 rounded-lg px-3 py-2 border border-services/20">
              <span className="text-[11px] font-semibold text-services">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            </div>
          )}

          {/* Distance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Distance</p>
                <p className="text-[10px] text-muted-foreground">From your current location</p>
              </div>
              <span className="text-xs text-muted-foreground">{distNum > 0 ? `Within ${distNum} mi` : 'Any'}</span>
            </div>
            <div className="flex gap-1.5">
              {DISTANCE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => onFiltersChange({ ...filters, distance: opt.value })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${distNum === opt.value ? 'bg-services text-white border-services' : 'bg-white text-muted-foreground border-border/50'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Type</p>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map(t => (
                <button key={t} onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    filters.types.includes(t) ? 'bg-services text-white border-services' : 'bg-white text-muted-foreground border-border/50'
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Open Now */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs font-medium text-foreground">Open Now</p>
              <p className="text-[10px] text-muted-foreground">Only show services currently open</p>
            </div>
            <Switch checked={filters.openNow} onCheckedChange={(v) => onFiltersChange({ ...filters, openNow: v })} className="data-[state=checked]:bg-services" />
          </div>

          <button onClick={() => setIsOpen(false)} className="w-full py-2.5 rounded-lg text-sm font-medium bg-services/80 text-white hover:bg-services transition-colors">Apply Filters</button>
        </div>
      )}
    </div>
  );
};

export default ServicesFiltersPanel;
