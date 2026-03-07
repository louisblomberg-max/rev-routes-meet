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
      <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-white/60 flex items-center justify-center group-hover:bg-white group-hover:shadow-lg group-active:scale-90 transition-all duration-200">
        <Navigation className="w-[18px] h-[18px] text-routes" />
      </div>
    </button>
  );
};

export default LocationButton;
