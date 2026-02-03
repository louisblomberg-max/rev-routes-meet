import { useState } from 'react';
import { Map, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type MapStyle = 'standard' | 'clean' | 'night' | 'satellite';

interface MapStyleButtonProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const mapStyles: { id: MapStyle; label: string; description: string }[] = [
  { id: 'standard', label: 'Standard', description: 'Default map view' },
  { id: 'clean', label: 'Clean', description: 'Minimal details' },
  { id: 'night', label: 'Night', description: 'Dark mode map' },
  { id: 'satellite', label: 'Satellite', description: 'Aerial imagery' },
];

const MapStyleButton = ({ currentStyle, onStyleChange }: MapStyleButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStyleSelect = (style: MapStyle) => {
    onStyleChange(style);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="h-12 w-full flex items-center justify-center gap-1.5 px-4 rounded-2xl border transition-all duration-300 bg-white/90 backdrop-blur-sm text-muted-foreground border-white/50 shadow-md hover:bg-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.99]"
          aria-label="Change map style"
        >
          <Map className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Map Style</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-2 bg-white/95 backdrop-blur-md border-white/50 shadow-xl rounded-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
            Map Style
          </p>
          {mapStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                currentStyle === style.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div>
                <p className="text-sm font-medium">{style.label}</p>
                <p className="text-[10px] text-muted-foreground">{style.description}</p>
              </div>
              {currentStyle === style.id && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MapStyleButton;
