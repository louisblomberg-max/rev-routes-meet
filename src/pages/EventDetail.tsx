import { useState } from 'react';
import { Calendar, MapPin, Car, Users, Share2, Bookmark, Check, Flag, Clock, DollarSign } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import NavigateButton from '@/components/NavigateButton';

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state, events: eventsRepo } = useData();

  const event = state.events.find(e => e.id === id);
  const isSavedInitial = state.savedEvents.includes(id || '');
  const isAttendingInitial = state.userAttendingEvents.includes(id || '');
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isAttending, setIsAttending] = useState(isAttendingInitial);
  const isHost = event?.createdBy === state.currentUser?.id;

  if (!event) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-1">Event not found</h2>
        <p className="text-sm text-muted-foreground mb-6">This event may have been removed or doesn't exist.</p>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Discovery</Button>
      </div>
    );
  }

  const handleSave = () => {
    if (isSaved) {
      eventsRepo.unsaveEvent(state.currentUser?.id || '', event.id);
    } else {
      eventsRepo.saveEvent(state.currentUser?.id || '', event.id);
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Event unsaved' : 'Event saved!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleRSVP = () => {
    setIsAttending(!isAttending);
    toast.success(isAttending ? 'RSVP cancelled' : 'RSVP confirmed!', {
      description: isAttending ? 'You are no longer attending' : `See you at ${event.title}!`,
    });
  };

  const hasFee = event.entryFee && event.entryFee !== '£0' && event.entryFee !== 'Free';
  const platformFee = hasFee ? '£0.50' : null;

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header Image */}
      <div className="relative h-52 bg-gradient-to-br from-primary to-primary/60 overflow-hidden">
        {event.photos?.[0] && (
          <img src={event.photos[0]} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <BackButton className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur safe-top hover:bg-white" />
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button onClick={handleSave}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors active:scale-95 ${isSaved ? 'bg-primary text-white' : 'bg-white/90 hover:bg-white'}`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : 'text-foreground'}`} />
          </button>
          <button onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors active:scale-95">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 relative pb-8 space-y-4">
        <div className="bg-card rounded-2xl shadow-lg p-5 border border-border/30">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary text-xs">{event.eventType}</Badge>
            {isHost && <Badge variant="secondary" className="text-[10px]">Your Event</Badge>}
            {event.visibility !== 'public' && <Badge variant="outline" className="text-[10px] capitalize">{event.visibility}</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="w-4.5 h-4.5 text-primary shrink-0" />
              <span>{event.date}{event.endDate ? ` — ${new Date(event.endDate).toLocaleDateString()}` : ''}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4.5 h-4.5 shrink-0" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Car className="w-4.5 h-4.5 shrink-0" />
              <span>{event.vehicleTypes?.join(', ') || event.vehicleType || 'All Welcome'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="w-4.5 h-4.5 shrink-0" />
              <span>{event.attendees + (isAttending ? 1 : 0)} attending{event.ticketLimit ? ` / ${event.ticketLimit} max` : ''}</span>
            </div>
            {hasFee && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <DollarSign className="w-4.5 h-4.5 shrink-0" />
                <span>{event.entryFee}{platformFee ? ` + ${platformFee} platform fee` : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="bg-card rounded-2xl border border-border/30 p-5">
            <h2 className="font-semibold text-foreground mb-2">About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Location Map placeholder */}
        <div className="bg-card rounded-2xl border border-border/30 p-5">
          <h2 className="font-semibold text-foreground mb-2">Location</h2>
          <div className="h-40 bg-muted rounded-xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground/30" />
          </div>
        </div>

        {/* Navigate */}
        {event.lat && event.lng && (
          <NavigateButton
            destination={{ lat: event.lat, lng: event.lng, title: event.title }}
            colorClass="bg-primary hover:bg-primary/90"
          />
        )}

        {/* RSVP */}
        <Button
          onClick={handleRSVP}
          className={`w-full py-6 text-lg gap-2 ${isAttending ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
        >
          {isAttending ? (<><Check className="w-5 h-5" /> Going</>) : 'RSVP to Event'}
        </Button>

        {/* Report */}
        <button onClick={() => toast.info('Report submitted')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors mx-auto">
          <Flag className="w-4 h-4" /> Report this event
        </button>
      </div>
    </div>
  );
};

export default EventDetail;
