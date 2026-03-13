import { Calendar, MapPin, Car, Tag, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EVENT_TYPE_LABELS: Record<string, string> = {
  meets: 'Meets', shows: 'Shows', drive: 'Drive', track_day: 'Track Day',
  motorsport: 'Motorsport', autojumble: 'Autojumble', off_road: 'Off-Road',
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  cars: 'Cars', bikes: 'Bikes', all: 'All Welcome', big_stuff: 'Big Stuff', military: 'Military',
};

const CATEGORY_LABELS: Record<string, string> = {
  jdm: 'JDM', supercars: 'Supercars', 'muscle-car': 'Muscle Car',
  american: 'American', european: 'European', '4x4': '4x4', row: 'ROW',
  modern: 'Modern', classics: 'Classics', vintage: 'Vintage',
};

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  vehicleType: string;
  eventType?: string;
  attendees: number;
  vehicleBrands?: string[];
  vehicleCategories?: string[];
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  const hasSpecificBrands = event.vehicleBrands && event.vehicleBrands.length > 0;
  const hasSpecificCategories = event.vehicleCategories && event.vehicleCategories.length > 0;

  return (
    <div 
      className="content-card cursor-pointer"
      onClick={onClick}
    >
      {/* Top row: badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        {event.eventType && (
          <Badge className="bg-events/10 text-events border-events/20 text-[10px] px-1.5 py-0">
            {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {VEHICLE_TYPE_LABELS[event.vehicleType] || event.vehicleType}
        </Badge>
        {hasSpecificCategories && event.vehicleCategories!.slice(0, 2).map(cat => (
          <Badge key={cat} variant="outline" className="text-[10px] px-1.5 py-0 bg-events/5 text-events border-events/15">
            {CATEGORY_LABELS[cat] || cat}
          </Badge>
        ))}
        {hasSpecificCategories && event.vehicleCategories!.length > 2 && (
          <span className="text-[10px] text-muted-foreground">+{event.vehicleCategories!.length - 2}</span>
        )}
      </div>

      <h3 className="font-semibold text-foreground truncate">{event.title}</h3>

      <div className="mt-1.5 space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 text-events" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>

      {/* Specific brands */}
      {hasSpecificBrands && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <Tag className="w-3 h-3 text-muted-foreground shrink-0" />
          {event.vehicleBrands!.slice(0, 3).map(brand => (
            <span key={brand} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {brand}
            </span>
          ))}
          {event.vehicleBrands!.length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{event.vehicleBrands!.length - 3} more</span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        {event.attendees} attending
      </div>
    </div>
  );
};

export default EventCard;
