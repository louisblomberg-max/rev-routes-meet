import { Navigation } from 'lucide-react';

interface LocationButtonProps {
  onClick?: () => void;
}

const LocationButton = ({ onClick }: LocationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 flex items-center justify-center hover:bg-black/50 active:scale-90 transition-all duration-200"
      aria-label="Center on my location"
    >
      <Navigation className="w-5 h-5 text-white/90" />
    </button>
  );
};

export default LocationButton;
