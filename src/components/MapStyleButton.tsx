import { useState } from 'react';
import { Map, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type MapStyle = 'standard' | 'night' | 'satellite';

interface MapStyleButtonProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const mapStyles: { id: MapStyle; label: string; description: string }[] = [
  { id: 'standard', label: 'Standard', description: 'Default map view' },
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
          className="w-11 h-11 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-white/60 flex items-center justify-center hover:bg-white hover:shadow-lg active:scale-90 transition-all duration-200"
          aria-label="Change map style"
        >
          <Map className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-44 p-1.5 bg-white/95 backdrop-blur-lg border-white/60 shadow-xl rounded-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1">
            Map Style
          </p>
          {mapStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                currentStyle === style.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted/80 text-foreground'
              }`}
            >
              <div>
                <p className="text-xs font-semibold">{style.label}</p>
                <p className="text-[10px] text-muted-foreground">{style.description}</p>
              </div>
              {currentStyle === style.id && (
                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MapStyleButton;
