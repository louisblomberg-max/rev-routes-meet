import { Calendar, MapPin, User, Users, Tag, Info, Navigation, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RevEvent } from '@/models';
import { toast } from 'sonner';
import { useState } from 'react';

const REVNET_FEE_PENCE = 50;

interface EventDetailContentProps {
  event: RevEvent;
  onNavigate: () => void;
  onViewFull: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const EventDetailContent = ({ event, onNavigate, onViewFull, isSaved, onToggleSave }: EventDetailContentProps) => {
  const [rsvpStatus, setRsvpStatus] = useState<'none' | 'going' | 'interested'>('none');

  const pricePence = event.entryFee ? parseFloat(event.entryFee) * 100 : 0;
  const isFree = pricePence === 0;
  const totalPence = isFree ? 0 : pricePence + REVNET_FEE_PENCE;

  const handleRSVP = () => {
    if (rsvpStatus === 'going') {
      setRsvpStatus('none');
      toast('RSVP removed');
    } else {
      setRsvpStatus('going');
      toast.success(isFree ? 'You\'re going!' : 'Payment flow coming soon');
    }
  };

  const handleInterested = () => {
    setRsvpStatus(prev => prev === 'interested' ? 'none' : 'interested');
    toast.success(rsvpStatus === 'interested' ? 'Removed' : 'Marked as interested');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, text: `Check out ${event.title} on RevNet` }).catch(() => {});
    } else {
      toast.success('Link copied');
    }
  };

  const handleSave = () => {
    onToggleSave();
    toast.success(isSaved ? 'Removed from saved' : 'Saved to My Events');
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative h-40 -mx-5 -mt-1 rounded-t-2xl overflow-hidden">
        {event.photos?.[0] ? (
          <img src={event.photos[0]} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-events/80 to-events/40 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-events-foreground/60" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 className="text-lg font-bold text-white">{event.title}</h2>
          <p className="text-sm text-white/80">
            {event.date && event.date !== 'TBD' ? event.date : 'Date TBD'}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="bg-events/10 text-events border-events/20 text-xs">
          {event.eventType}
        </Badge>
        {event.vehicleTypes?.map(v => (
          <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
        ))}
        {(!event.date || event.date === 'TBD') && (
          <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
            Add date later
          </Badge>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
      )}

      {/* Core info */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-events shrink-0" />
          <span className="text-foreground">
            {event.date && event.date !== 'TBD' ? event.date : <span className="italic text-muted-foreground">Date TBD</span>}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{event.location || 'Location not set'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <User className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-foreground">Hosted by</span>
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px] bg-muted">{event.createdBy?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className="text-foreground font-medium">{event.createdBy || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-muted/50 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{event.attendees || 0} attending</span>
          </div>
          <div className="flex -space-x-2">
            {[...Array(Math.min(event.attendees || 0, 4))].map((_, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-card">
                <AvatarFallback className="text-[9px] bg-muted-foreground/20">
                  {String.fromCharCode(65 + i)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant={rsvpStatus === 'going' ? 'default' : 'outline'}
            className={rsvpStatus === 'going' ? 'bg-events hover:bg-events/90 text-events-foreground' : ''}
            onClick={handleRSVP}
          >
            {rsvpStatus === 'going' ? '✓ Going' : 'Going'}
          </Button>
          <Button
            size="sm"
            variant={rsvpStatus === 'interested' ? 'default' : 'outline'}
            className={rsvpStatus === 'interested' ? 'bg-amber-500 hover:bg-amber-500/90 text-white' : ''}
            onClick={handleInterested}
          >
            {rsvpStatus === 'interested' ? '✓ Interested' : 'Interested'}
          </Button>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-muted/50 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Entry fee</span>
        </div>
        {isFree ? (
          <span className="text-lg font-bold text-services">Free</span>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ticket</span>
              <span className="text-foreground">£{(pricePence / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                RevNet fee
                <span className="relative group">
                  <Info className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                  <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg whitespace-nowrap border border-border z-50">
                    Includes a £0.50 RevNet platform fee
                  </span>
                </span>
              </span>
              <span className="text-foreground">£{(REVNET_FEE_PENCE / 100).toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-1 flex justify-between text-sm font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">£{(totalPence / 100).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <Button
        className="w-full bg-events hover:bg-events/90 text-events-foreground py-5 font-semibold"
        onClick={handleRSVP}
      >
        {isFree ? 'Join / RSVP' : `Pay & RSVP £${(totalPence / 100).toFixed(2)}`}
      </Button>

      {/* Actions row */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={onNavigate}>
          <Navigation className="w-4 h-4" /> Directions
        </Button>
        <Button variant="outline" size="icon" className="shrink-0 h-10 w-10" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`shrink-0 h-10 w-10 ${isSaved ? 'bg-events/10 border-events/30' : ''}`}
          onClick={handleSave}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-events text-events' : ''}`} />
        </Button>
      </div>

      {/* View full */}
      <button
        onClick={onViewFull}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        View full details →
      </button>
    </div>
  );
};

export default EventDetailContent;
