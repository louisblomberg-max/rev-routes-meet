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
          className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 flex items-center justify-center hover:bg-black/50 active:scale-90 transition-all duration-200"
          aria-label="Change map style"
        >
          <Map className="w-5 h-5 text-white/90" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-44 p-1.5 bg-black/80 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider px-2.5 py-1">
            Map Style
          </p>
          {mapStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => handleStyleSelect(style.id)}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left transition-all ${
                currentStyle === style.id
                  ? 'bg-white/15 text-white'
                  : 'hover:bg-white/10 text-white/70'
              }`}
            >
              <div>
                <p className="text-xs font-semibold">{style.label}</p>
                <p className="text-[10px] text-white/40">{style.description}</p>
              </div>
              {currentStyle === style.id && (
                <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MapStyleButton;
