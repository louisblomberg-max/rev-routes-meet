import { MapPin, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Service {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  reviewCount: number;
}

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

const ServiceCard = ({ service, onClick }: ServiceCardProps) => {
  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      'Garage': 'bg-services-light text-services',
      'Specialist': 'bg-events-light text-events',
      'Parts': 'bg-routes-light text-routes',
      'Detailing': 'bg-clubs-light text-clubs',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div 
      className="content-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(service.category)}`}>
              {service.category}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-services text-services" />
              <span className="font-medium">{service.rating}</span>
              <span className="text-muted-foreground">({service.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{service.distance}</span>
            </div>
          </div>
        </div>
        <Button 
          size="sm" 
          className="bg-services hover:bg-services/90 text-services-foreground flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          View
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;
