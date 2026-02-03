import { Navigation } from 'lucide-react';

interface LocationButtonProps {
  onClick?: () => void;
}

const LocationButton = ({ onClick }: LocationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg border border-white/50 flex items-center justify-center hover:bg-white hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
      aria-label="Center on my location"
    >
      <Navigation className="w-5 h-5 text-routes" />
    </button>
  );
};

export default LocationButton;
