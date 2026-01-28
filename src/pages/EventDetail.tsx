import { ArrowLeft, Calendar, MapPin, Car, Users, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/data/mockData';

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const event = mockEvents.find(e => e.id === id) || mockEvents[0];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-events to-events/70">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center safe-top"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button 
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center safe-top"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5 text-events" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Car className="w-5 h-5" />
              <span>{event.vehicleType}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>{event.attendees} attending</span>
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="mt-4">
          <h2 className="font-semibold text-foreground mb-2">Location</h2>
          <div className="h-40 bg-muted rounded-xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground/30" />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <h2 className="font-semibold text-foreground mb-2">About</h2>
          <p className="text-muted-foreground">
            Join us for an amazing car meet! All enthusiasts welcome. 
            Bring your vehicle and meet like-minded people in the community.
          </p>
        </div>

        {/* RSVP Button */}
        <div className="mt-6 pb-8">
          <Button className="w-full bg-events hover:bg-events/90 text-events-foreground py-6 text-lg">
            RSVP to Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
