import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

export interface RoutesFilterState {
  // Placeholder for future filters
}

interface RoutesFiltersPanelProps {
  filters: RoutesFilterState;
  onFiltersChange: (filters: RoutesFilterState) => void;
}

const RoutesFiltersPanel = ({ filters, onFiltersChange }: RoutesFiltersPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 animate-fade-up">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
          isOpen
            ? 'bg-[#1E40AF]/80 text-white border-[#1E40AF]/80'
            : 'bg-card text-muted-foreground border-border hover:border-[#1E40AF]/50 hover:bg-[#1E40AF]/10'
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
            <h3 className="text-sm font-semibold text-foreground">Filter Routes</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground">Route filters coming soon...</p>

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
