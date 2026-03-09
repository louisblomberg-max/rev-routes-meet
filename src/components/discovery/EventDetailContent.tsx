import { Calendar, MapPin, User, Users, Navigation, Bookmark, Share2, Car, DollarSign, Shield, Info, ClipboardList, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RevEvent } from '@/models';
import { toast } from 'sonner';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { AttendEventSheet, AttendeeListSheet } from '@/components/AttendEventSheet';
import { useData } from '@/contexts/DataContext';

const REVNET_FEE_PENCE = 50;

const EVENT_TYPE_LABELS: Record<string, string> = {
  meets: 'Meets', shows: 'Shows', drive: 'Drive', track_day: 'Track Day',
  motorsport: 'Motorsport', autojumble: 'Autojumble', off_road: 'Off-Road',
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  cars: 'Cars', bikes: 'Bikes', all: 'All Welcome',
};

const VEHICLE_AGE_LABELS: Record<string, string> = {
  all: 'All Ages', classics: 'Classics', modern: 'Modern', vintage: 'Vintage',
  pre_2000: "Pre 00's", pre_1990: "Pre 90's", pre_1980: "Pre 80's",
  pre_1970: "Pre 70's", pre_1960: "Pre 60's", pre_1950: "Pre 50's",
};

const CATEGORY_LABELS: Record<string, string> = {
  jdm: 'JDM', supercars: 'Supercars', 'muscle-car': 'Muscle Car',
  american: 'American', european: 'European',
};

interface EventDetailContentProps {
  event: RevEvent;
  onNavigate: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const EventDetailContent = ({ event, onNavigate, isSaved, onToggleSave }: EventDetailContentProps) => {
  const { events: eventsRepo, state } = useData();
  const currentUserId = state.currentUser?.id || '';
  const isHost = event.createdBy === currentUserId;

  const [showAttendSheet, setShowAttendSheet] = useState(false);
  const [showAttendeeList, setShowAttendeeList] = useState(false);

  const isAttending = (event.attendeesList || []).some(a => a.userId === currentUserId);
  const attendeeCount = event.attendees || (event.attendeesList?.length ?? 0);
  const isFull = event.maxAttendees > 0 && attendeeCount >= event.maxAttendees;
  const isNearlyFull = event.maxAttendees > 0 && attendeeCount >= event.maxAttendees * 0.8 && !isFull;

  const isFree = event.entryFeeType === 'free' || (!event.entryFeeType && (!event.entryFee || event.entryFee === 'Free' || event.entryFee === '£0'));
  const feeAmountPence = event.entryFeeAmount ? event.entryFeeAmount * 100 : 0;
  const totalPence = isFree ? 0 : feeAmountPence + REVNET_FEE_PENCE;

  const displayDate = event.startDate
    ? format(parseISO(event.startDate), 'EEE, MMM d yyyy') + (event.startTime ? ` • ${event.startTime}` : '')
    : event.date || 'Date TBD';

  const endDisplayDate = event.endDate
    ? format(parseISO(event.endDate), 'EEE, MMM d yyyy') + (event.endTime ? ` • ${event.endTime}` : '')
    : null;

  const handleAttendClick = () => {
    if (isAttending) {
      // Cancel attendance
      const updated = (event.attendeesList || []).filter(a => a.userId !== currentUserId);
      eventsRepo.update(event.id, {
        attendeesList: updated,
        attendees: Math.max(0, (event.attendees || 0) - 1),
      });
      toast.success('Attendance cancelled');
    } else {
      if (isFull) return;
      setShowAttendSheet(true);
    }
  };

  const handleConfirmAttendance = (registration: string) => {
    const newAttendee = {
      userId: currentUserId,
      username: state.currentUser?.username || 'user',
      displayName: state.currentUser?.displayName || 'User',
      profileImage: state.currentUser?.avatar || null,
      vehicleRegistration: registration,
      joinedAt: new Date().toISOString(),
    };
    const updatedList = [...(event.attendeesList || []), newAttendee];
    eventsRepo.update(event.id, {
      attendeesList: updatedList,
      attendees: (event.attendees || 0) + 1,
    });
    setShowAttendSheet(false);
    toast.success('You\'re attending!', { description: `See you at ${event.title}!` });
  };

  const handleRemoveAttendee = (userId: string) => {
    const updated = (event.attendeesList || []).filter(a => a.userId !== userId);
    eventsRepo.update(event.id, {
      attendeesList: updated,
      attendees: Math.max(0, (event.attendees || 0) - 1),
    });
    toast.success('Attendee removed');
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

  const isClubHosted = event.visibility === 'club' || !!event.clubId;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative h-40 -mx-5 -mt-1 rounded-t-2xl overflow-hidden">
        {(event.bannerImage || event.photos?.[0]) ? (
          <img src={event.bannerImage || event.photos![0]} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-events/80 to-events/40 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-events-foreground/60" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 className="text-lg font-bold text-white">{event.title}</h2>
          <p className="text-sm text-white/80">{displayDate}</p>
        </div>
      </div>

      {/* Tags / Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="bg-events/10 text-events border-events/20 text-xs">
          {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {VEHICLE_TYPE_LABELS[event.vehicleType] || event.vehicleType}
        </Badge>
        {event.vehicleAge && event.vehicleAge !== 'all' && (
          <Badge variant="outline" className="text-xs">
            {VEHICLE_AGE_LABELS[event.vehicleAge] || event.vehicleAge}
          </Badge>
        )}
        {isClubHosted && (
          <Badge variant="outline" className="text-xs bg-clubs/10 text-clubs border-clubs/20">
            <Shield className="w-3 h-3 mr-1" /> Club Hosted
          </Badge>
        )}
      </div>

      {/* Vehicle Brands */}
      {event.vehicleBrands && event.vehicleBrands.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {event.vehicleBrands.map(brand => (
            <span key={brand} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              {brand}
            </span>
          ))}
        </div>
      )}

      {/* Vehicle Categories */}
      {event.vehicleCategories && event.vehicleCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {event.vehicleCategories.map(cat => (
            <span key={cat} className="px-2 py-0.5 rounded-full bg-events/10 text-[10px] font-medium text-events">
              {CATEGORY_LABELS[cat] || cat}
            </span>
          ))}
        </div>
      )}

      {/* Description */}
      {event.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
      )}

      {/* Core info */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-events shrink-0" />
          <div>
            <span className="text-foreground">{displayDate}</span>
            {endDisplayDate && (
              <span className="text-muted-foreground"> — {endDisplayDate}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{event.locationName || event.location || 'Location not set'}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Car className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{VEHICLE_TYPE_LABELS[event.vehicleType] || 'All Welcome'}</span>
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
            <span className="text-sm font-medium text-foreground">
              {attendeeCount} attending{event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}
            </span>
          </div>
          {/* Organiser: view attendee list */}
          {isHost && (
            <button
              onClick={() => setShowAttendeeList(true)}
              className="flex items-center gap-1 text-xs font-medium text-events hover:text-events/80 transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              View list
            </button>
          )}
        </div>

        {/* Status labels */}
        <div className="mt-2 space-y-1">
          {event.firstComeFirstServe && !isFull && (
            <p className="text-xs text-muted-foreground">First come, first served</p>
          )}
          {isNearlyFull && (
            <p className="text-xs text-amber-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Limited spaces available
            </p>
          )}
          {isFull && (
            <p className="text-xs text-destructive font-medium">This event is full</p>
          )}
          {attendeeCount === 0 && (
            <p className="text-xs text-muted-foreground">No attendees yet</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-muted/50 rounded-xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Entry fee</span>
        </div>
        {isFree ? (
          <span className="text-lg font-bold text-services">Free</span>
        ) : (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ticket</span>
              <span className="text-foreground">£{(feeAmountPence / 100).toFixed(2)}</span>
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
        className={`w-full py-5 font-semibold ${
          isAttending
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : isFull
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-events hover:bg-events/90 text-events-foreground'
        }`}
        onClick={handleAttendClick}
        disabled={isFull && !isAttending}
      >
        {isAttending ? '✓ Attending' : isFull ? 'Event Full' : 'Attend'}
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

      {/* Attend Sheet */}
      <AttendEventSheet
        open={showAttendSheet}
        onClose={() => setShowAttendSheet(false)}
        onConfirm={handleConfirmAttendance}
        eventTitle={event.title}
      />

      {/* Attendee List (organiser only) */}
      {isHost && (
        <AttendeeListSheet
          open={showAttendeeList}
          onClose={() => setShowAttendeeList(false)}
          attendees={event.attendeesList || []}
          onRemoveAttendee={handleRemoveAttendee}
        />
      )}
    </div>
  );
};

export default EventDetailContent;
