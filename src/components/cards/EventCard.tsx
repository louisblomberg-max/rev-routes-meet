import { Calendar, MapPin, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  vehicleType: string;
  attendees: number;
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <div 
      className="content-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-events" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span>{event.vehicleType}</span>
          </div>
        </div>
        <Button 
          size="sm" 
          className="bg-events hover:bg-events/90 text-events-foreground flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          RSVP
        </Button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {event.attendees} attending
      </div>
    </div>
  );
};

export default EventCard;
