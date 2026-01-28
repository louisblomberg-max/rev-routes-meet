import { X, Calendar, MapPin, Car, Users, Star, Clock, Route, Navigation, Share2, Bookmark, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types for different content
interface EventItem {
  type: 'event';
  id: string;
  title: string;
  date: string;
  location: string;
  vehicleType: string;
  attendees: number;
  description?: string;
  distance?: string;
}

interface ServiceItem {
  type: 'service';
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: string;
  reviewCount: number;
  openingHours?: string;
}

interface RouteItem {
  type: 'route';
  id: string;
  name: string;
  distance: string;
  routeType: string;
  vehicleType: 'car' | 'bike' | 'both';
  rating: number;
  duration?: string;
  startLocation?: string;
  endLocation?: string;
}

interface ClubItem {
  type: 'club';
  id: string;
  name: string;
  location: string;
  members: number;
}

export type SelectedItem = EventItem | ServiceItem | RouteItem | ClubItem;

interface ItemDetailSheetProps {
  item: SelectedItem | null;
  onClose: () => void;
  onViewFull: (type: string, id: string) => void;
}

const ItemDetailSheet = ({ item, onClose, onViewFull }: ItemDetailSheetProps) => {
  if (!item) return null;

  const renderEventDetails = (event: EventItem) => (
    <>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{event.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{event.distance || '2.5 miles away'}</p>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-foreground">
          <Calendar className="w-5 h-5 text-events flex-shrink-0" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Car className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>{event.vehicleType}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>{event.attendees} attending</span>
        </div>
      </div>

      {event.description && (
        <p className="mt-4 text-sm text-muted-foreground">{event.description}</p>
      )}

      <div className="mt-6 flex gap-3">
        <Button 
          className="flex-1 bg-events hover:bg-events/90 text-events-foreground"
          onClick={() => onViewFull('event', event.id)}
        >
          RSVP
        </Button>
        <Button variant="outline" size="icon">
          <Bookmark className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </>
  );

  const renderServiceDetails = (service: ServiceItem) => (
    <>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{service.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-services/10 text-services rounded-full">
              {service.category}
            </span>
            <span className="text-sm text-muted-foreground">{service.distance}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-foreground">
          <Star className="w-5 h-5 text-services flex-shrink-0" />
          <span>{service.rating} ({service.reviewCount} reviews)</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>{service.distance} away</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>{service.openingHours || 'Mon-Sat: 8am - 6pm'}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button 
          className="flex-1 bg-services hover:bg-services/90 text-services-foreground"
          onClick={() => onViewFull('service', service.id)}
        >
          View Profile
        </Button>
        <Button variant="outline" size="icon">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </>
  );

  const renderRouteDetails = (route: RouteItem) => (
    <>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{route.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-routes/10 text-routes rounded-full">
              {route.routeType}
            </span>
            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
              {route.vehicleType === 'both' ? 'Car & Bike' : route.vehicleType === 'car' ? 'Car' : 'Bike'}
            </span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-foreground">
          <Route className="w-5 h-5 text-routes flex-shrink-0" />
          <span>{route.distance} • {route.duration || '~1.5 hours'}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Navigation className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>Start: {route.startLocation || 'Guildford, Surrey'}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>End: {route.endLocation || 'Brighton, East Sussex'}</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Star className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>{route.rating} rating</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Route highlighted on map. Swipe up for full details.
      </p>

      <div className="mt-4 flex gap-3">
        <Button 
          variant="outline"
          className="flex-1"
          onClick={() => onViewFull('route', route.id)}
        >
          View Full Route
        </Button>
        <Button variant="outline" size="icon">
          <Bookmark className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </>
  );

  const renderClubDetails = (club: ClubItem) => (
    <>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground">{club.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{club.location}</p>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-foreground">
          <Users className="w-5 h-5 text-clubs flex-shrink-0" />
          <span>{club.members.toLocaleString()} members</span>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span>{club.location}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button 
          className="flex-1 bg-clubs hover:bg-clubs/90 text-clubs-foreground"
          onClick={() => onViewFull('club', club.id)}
        >
          View Club
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </>
  );

  return (
    <div className="fixed left-0 right-0 bottom-0 z-40 animate-fade-up">
      <div className="bg-card rounded-t-2xl shadow-xl border-t border-border">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-5 pb-8">
          {item.type === 'event' && renderEventDetails(item)}
          {item.type === 'service' && renderServiceDetails(item)}
          {item.type === 'route' && renderRouteDetails(item)}
          {item.type === 'club' && renderClubDetails(item)}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailSheet;
