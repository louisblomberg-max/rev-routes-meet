import { Navigation } from 'lucide-react';

interface LocationButtonProps {
  onClick?: () => void;
}

const LocationButton = ({ onClick }: LocationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-white/60 flex items-center justify-center hover:bg-white hover:shadow-lg active:scale-90 transition-all duration-200"
      aria-label="Center on my location"
    >
      <Navigation className="w-[18px] h-[18px] text-routes" />
    </button>
  );
};

export default LocationButton;
