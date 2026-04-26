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
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform duration-200"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Navigation className="w-[18px] h-[18px] text-routes" />
      </div>
    </button>
  );
};

export default LocationButton;
