import { Navigation } from 'lucide-react';

interface LocationButtonProps {
  onClick?: () => void;
}

const LocationButton = ({ onClick }: LocationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="group"
      aria-label="Center on my location"
    >
      <div className="w-11 h-11 rounded-full bg-card/90 backdrop-blur-md shadow-premium flex items-center justify-center group-hover:bg-card group-hover:shadow-elevated group-active:scale-90 transition-all duration-200">
        <Navigation className="w-[18px] h-[18px] text-routes" />
      </div>
    </button>
  );
};

export default LocationButton;