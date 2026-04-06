import { useState, useMemo } from 'react';
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

const DISTANCE_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 5, label: '5mi' },
  { value: 10, label: '10mi' },
  { value: 25, label: '25mi' },
  { value: 50, label: '50mi' },
  { value: 100, label: '100mi' },
];

const TYPE_OPTIONS = ['All', 'Scenic', 'Coastal', 'Off-road', 'Twisties', 'Urban', 'Track'];
const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Moderate', 'Challenging', 'Expert'];
const DURATION_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'under-1h', label: '< 1 hour' },
  { id: '1-2h', label: '1-2 hours' },
  { id: '2-4h', label: '2-4 hours' },
  { id: 'over-4h', label: '4+ hours' },
];
const SURFACE_OPTIONS = ['All', 'Tarmac', 'Gravel', 'Dirt', 'Mixed'];

const RoutesFiltersPanel = ({ filters, onFiltersChange }: RoutesFiltersPanelProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const distNum = typeof filters.distance === 'number' ? filters.distance : 25;

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeof filters.distance === 'number' && filters.distance > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.difficulty.length > 0) count++;
    if (filters.duration) count++;
    if (filters.surface.length > 0) count++;
    return count;
  }, [filters]);

  const clearAll = () => onFiltersChange({ distance: 0, types: [], difficulty: [], duration: null, surface: [] });

  const toggleArr = (arr: string[], id: string, field: keyof RoutesFilterState) => {
    if (id.toLowerCase() === 'all') { onFiltersChange({ ...filters, [field]: [] }); return; }
    const lower = id.toLowerCase();
    const cur = arr as string[];
    const next = cur.includes(lower) ? cur.filter(x => x !== lower) : [...cur, lower];
    onFiltersChange({ ...filters, [field]: next });
  };

  return (
    <div className="space-y-2 animate-fade-up">
      <div className="flex items-center gap-2">
        <button onClick={() => setIsOpen(!isOpen)}
          className={`relative h-10 flex-1 flex items-center justify-center gap-1.5 px-4 rounded-xl border transition-all duration-300 ${
            isOpen ? 'bg-routes/80 text-white border-routes/80 shadow-lg' : 'bg-white/90 backdrop-blur-sm text-muted-foreground border-white/60 shadow-sm hover:border-routes/50 hover:bg-routes/10'
          }`}>
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-routes text-white text-[10px] font-bold flex items-center justify-center shadow-sm">{activeFilterCount}</span>
          )}
        </button>
        <button onClick={() => navigate('/add/route')} className="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-routes text-routes-foreground shadow-sm hover:bg-routes/90 active:scale-[0.97] transition-all">
          <Plus className="w-4 h-4" /><span className="text-[10px] font-semibold whitespace-nowrap">Add</span>
        </button>
      </div>

      {isOpen && (
        <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm p-4 space-y-4 animate-fade-up max-h-[65vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter Routes</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && <button onClick={clearAll} className="text-[10px] font-medium text-routes hover:text-routes/70 transition-colors">Clear all</button>}
              <button onClick={() => setIsOpen(false)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><X className="w-3 h-3 text-muted-foreground" /></button>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-center bg-routes/5 rounded-lg px-3 py-2 border border-routes/20">
              <span className="text-[11px] font-semibold text-routes">{activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
            </div>
          )}

          {/* Distance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Distance</p>
              <span className="text-xs text-muted-foreground">{distNum > 0 ? `Within ${distNum} miles` : 'Any distance'}</span>
            </div>
            <div className="flex gap-1.5">
              {DISTANCE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => onFiltersChange({ ...filters, distance: opt.value })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${distNum === opt.value ? 'bg-routes text-white border-routes' : 'bg-white text-muted-foreground border-border/50'}`}>
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
                <button key={t} onClick={() => toggleArr(filters.types, t, 'types')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    (t === 'All' && filters.types.length === 0) || filters.types.includes(t.toLowerCase()) ? 'bg-routes text-white border-routes' : 'bg-white text-muted-foreground border-border/50'
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Difficulty</p>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTY_OPTIONS.map(d => (
                <button key={d} onClick={() => toggleArr(filters.difficulty, d, 'difficulty')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    (d === 'All' && filters.difficulty.length === 0) || filters.difficulty.includes(d.toLowerCase()) ? 'bg-routes text-white border-routes' : 'bg-white text-muted-foreground border-border/50'
                  }`}>{d}</button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Duration</p>
            <div className="flex flex-wrap gap-1.5">
              {DURATION_OPTIONS.map(dur => (
                <button key={dur.id} onClick={() => onFiltersChange({ ...filters, duration: dur.id === 'all' ? null : (filters.duration === dur.id ? null : dur.id) })}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    (dur.id === 'all' && !filters.duration) || filters.duration === dur.id ? 'bg-routes text-white border-routes' : 'bg-white text-muted-foreground border-border/50'
                  }`}>{dur.label}</button>
              ))}
            </div>
          </div>

          {/* Surface */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Surface</p>
            <div className="flex flex-wrap gap-1.5">
              {SURFACE_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleArr(filters.surface, s, 'surface')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    (s === 'All' && filters.surface.length === 0) || filters.surface.includes(s.toLowerCase()) ? 'bg-routes text-white border-routes' : 'bg-white text-muted-foreground border-border/50'
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <button onClick={() => setIsOpen(false)} className="w-full py-2.5 rounded-lg text-sm font-medium bg-routes/80 text-white hover:bg-routes transition-colors">Apply Filters</button>
        </div>
      )}
    </div>
  );
};

export default RoutesFiltersPanel;
