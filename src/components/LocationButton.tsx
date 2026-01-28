import { Navigation } from 'lucide-react';

interface LocationButtonProps {
  onClick?: () => void;
}

const LocationButton = ({ onClick }: LocationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
      aria-label="Center on my location"
    >
      <Navigation className="w-5 h-5 text-muted-foreground" />
    </button>
  );
};

export default LocationButton;
