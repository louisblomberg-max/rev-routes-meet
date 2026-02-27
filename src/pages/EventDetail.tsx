import { useState } from 'react';
import { Calendar, MapPin, Car, Users, Share2, Bookmark, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockEvents } from '@/data/mockData';
import NavigateButton from '@/components/NavigateButton';

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  
  const event = mockEvents.find(e => e.id === id) || mockEvents[0];

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Event unsaved' : 'Event saved!');
  };

  const handleShare = () => {
    toast.success('Link copied to clipboard!');
  };

  const handleRSVP = () => {
    setIsAttending(!isAttending);
    toast.success(isAttending ? 'RSVP cancelled' : 'RSVP confirmed!', {
      description: isAttending ? 'You are no longer attending' : `See you at ${event.title}!`,
    });
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header Image */}
      <div className="relative h-48 bg-gradient-to-br from-events to-events/70">
        <BackButton className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur safe-top hover:bg-white" />
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button 
            onClick={handleSave}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors active:scale-95 ${
              isSaved ? 'bg-primary text-white' : 'bg-white/90 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : 'text-foreground'}`} />
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors active:scale-95"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative pb-8">
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border/30">
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
              <span>{event.attendees + (isAttending ? 1 : 0)} attending</span>
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

        {/* Navigate Button */}
        <div className="mt-6">
          <NavigateButton
            destination={{ lat: 51.5406, lng: -0.2112, title: event.title }}
            colorClass="bg-events hover:bg-events/90"
          />
        </div>

        {/* RSVP Button */}
        <div className="mt-6">
          <Button 
            onClick={handleRSVP}
            className={`w-full py-6 text-lg gap-2 ${
              isAttending 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-events hover:bg-events/90 text-white'
            }`}
          >
            {isAttending ? (
              <>
                <Check className="w-5 h-5" />
                Going
              </>
            ) : (
              'RSVP to Event'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
