import { useState, useEffect } from 'react';
import { Calendar, MapPin, Car, Users, Share2, Bookmark, Check, Flag, Clock, DollarSign, Tag, Shield, Ticket } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavigateButton from '@/components/NavigateButton';
import OrganiserDashboard from '@/components/OrganiserDashboard';

const EVENT_TYPE_LABELS: Record<string, string> = {
  meets: 'Meets', shows: 'Shows', drive: 'Drive', track_day: 'Track Day',
  motorsport: 'Motorsport', autojumble: 'Autojumble', off_road: 'Off-Road',
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  cars: 'Cars', bikes: 'Bikes', all: 'All Welcome', big_stuff: 'Big Stuff', military: 'Military',
};

const VEHICLE_AGE_LABELS: Record<string, string> = {
  all: 'All Ages', classics: 'Classics', modern: 'Modern', vintage: 'Vintage',
  pre_2000: "Pre 00's", pre_1990: "Pre 90's", pre_1980: "Pre 80's",
  pre_1970: "Pre 70's", pre_1960: "Pre 60's", pre_1950: "Pre 50's",
};

const CATEGORY_LABELS: Record<string, string> = {
  jdm: 'JDM', supercars: 'Supercars', 'muscle-car': 'Muscle Car',
  american: 'American', european: 'European', '4x4': '4x4', row: 'ROW',
  modern: 'Modern', classics: 'Classics', vintage: 'Vintage',
};

const EventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state, events: eventsRepo } = useData();
  const { user: authUser } = useAuth();

  const event = state.events.find(e => e.id === id);
  const isSavedInitial = state.savedEvents.includes(id || '');
  const isAttendingInitial = state.userAttendingEvents.includes(id || '');
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [isAttending, setIsAttending] = useState(isAttendingInitial);
  const [purchasingTicket, setPurchasingTicket] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const isHost = event?.createdBy === authUser?.id;

  // Check if event is ticketed from raw Supabase data
  const [eventRaw, setEventRaw] = useState<any>(null);
  useEffect(() => {
    if (!id) return;
    supabase.from('events').select('is_ticketed, ticket_price').eq('id', id).maybeSingle()
      .then(({ data }) => setEventRaw(data));
  }, [id]);

  // Check if user already has a ticket
  useEffect(() => {
    if (!id || !authUser?.id) return;
    supabase.from('event_tickets').select('id').eq('event_id', id).eq('user_id', authUser.id).eq('status', 'confirmed')
      .then(({ data }) => setHasTicket((data?.length || 0) > 0));
  }, [id, authUser?.id]);

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

  const isTicketed = eventRaw?.is_ticketed === true;
  const ticketPrice = eventRaw?.ticket_price || 0;

  const handleSave = () => {
    if (isSaved) {
      eventsRepo.unsaveEvent(authUser?.id || '', event.id);
    } else {
      eventsRepo.saveEvent(authUser?.id || '', event.id);
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

  const handleBuyTicket = async () => {
    if (!authUser?.id || !id) return;
    setPurchasingTicket(true);
    try {
      const { data, error } = await supabase.functions.invoke('purchase-event-ticket', {
        body: { event_id: id, user_id: authUser.id, ticket_price: ticketPrice },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      toast.success('Ticket confirmed!');
      setHasTicket(true);
      setIsAttending(true);
      // Also add to event_attendees
      await supabase.from('event_attendees').upsert({
        event_id: id,
        user_id: authUser.id,
        status: 'attending',
      });
    } catch {
      toast.error('Failed to purchase ticket');
    } finally {
      setPurchasingTicket(false);
    }
  };

  const isFree = event.entryFeeType === 'free' || (!event.entryFeeType && (!event.entryFee || event.entryFee === 'Free' || event.entryFee === '£0'));
  const isClubHosted = event.visibility === 'club' || !!event.clubId;

  const displayDate = event.startDate
    ? format(parseISO(event.startDate), 'EEE, MMM d yyyy') + (event.startTime ? ` • ${event.startTime}` : '')
    : event.date || 'Date TBD';

  const endDisplayDate = event.endDate
    ? format(parseISO(event.endDate), 'EEE, MMM d yyyy') + (event.endTime ? ` • ${event.endTime}` : '')
    : null;

  const feeDisplay = event.entryFeeType === 'paid' && event.entryFeeAmount
    ? `£${event.entryFeeAmount.toFixed(2)}`
    : event.entryFee || 'Free';

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header Image */}
      <div className="relative h-52 bg-gradient-to-br from-primary to-primary/60 overflow-hidden">
        {(event.bannerImage || event.photos?.[0]) && (
          <img src={event.bannerImage || event.photos![0]} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
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
          <h1 className="text-2xl font-bold text-foreground">{event.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span>{displayDate}</span>
            {endDisplayDate && <span> — {endDisplayDate}</span>}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className="bg-primary/10 text-primary text-xs">
              {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {VEHICLE_TYPE_LABELS[event.vehicleType] || event.vehicleType}
            </Badge>
            {isHost && <Badge variant="secondary" className="text-[10px]">Your Event</Badge>}
            {event.visibility !== 'public' && <Badge variant="outline" className="text-[10px] capitalize">{event.visibility}</Badge>}
            {isClubHosted && (
              <Badge variant="outline" className="text-[10px] bg-clubs/10 text-clubs border-clubs/20">
                <Shield className="w-3 h-3 mr-1" /> Club
              </Badge>
            )}
            {isTicketed && (
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                <Ticket className="w-3 h-3 mr-1" /> Ticketed
              </Badge>
            )}
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="w-4.5 h-4.5 text-primary shrink-0" />
              <div>
                <span>{displayDate}</span>
                {endDisplayDate && <span className="text-muted-foreground"> — {endDisplayDate}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4.5 h-4.5 shrink-0" />
              <span>{event.locationName || event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Car className="w-4.5 h-4.5 shrink-0" />
              <span>{VEHICLE_TYPE_LABELS[event.vehicleType] || 'All Welcome'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="w-4.5 h-4.5 shrink-0" />
              <span>{event.attendees + (isAttending ? 1 : 0)} attending{event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}</span>
            </div>
            {isTicketed && ticketPrice > 0 && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Ticket className="w-4.5 h-4.5 shrink-0" />
                <span>Ticket: £{Number(ticketPrice).toFixed(2)}</span>
              </div>
            )}
            {!isFree && !isTicketed && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <DollarSign className="w-4.5 h-4.5 shrink-0" />
                <span>{feeDisplay}</span>
              </div>
            )}
          </div>

          {/* Vehicle Brands */}
          {event.vehicleBrands && event.vehicleBrands.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Brands</p>
              <div className="flex flex-wrap gap-1">
                {event.vehicleBrands.map(brand => (
                  <span key={brand} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Categories */}
          {event.vehicleCategories && event.vehicleCategories.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Categories</p>
              <div className="flex flex-wrap gap-1">
                {event.vehicleCategories.map(cat => (
                  <span key={cat} className="px-2 py-0.5 rounded-full bg-events/10 text-[10px] font-medium text-events">
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Age */}
          {(() => {
            const ages = event.vehicleAges && event.vehicleAges.length > 0
              ? event.vehicleAges
              : (event.vehicleAge && event.vehicleAge !== 'all' ? [event.vehicleAge] : []);
            return ages.length > 0 ? (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Vehicle Era</p>
                <div className="flex flex-wrap gap-1">
                  {ages.map(age => (
                    <Badge key={age} variant="outline" className="text-xs">{VEHICLE_AGE_LABELS[age] || age}</Badge>
                  ))}
                </div>
              </div>
            ) : null;
          })()}
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

        {/* RSVP / Ticket Button */}
        {isTicketed ? (
          hasTicket || isAttending ? (
            <div className="w-full py-4 text-center bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 text-lg font-semibold">
              <Check className="w-5 h-5" /> Already Attending
            </div>
          ) : (
            <Button
              onClick={handleBuyTicket}
              disabled={purchasingTicket}
              className="w-full py-6 text-lg gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Ticket className="w-5 h-5" />
              {purchasingTicket ? 'Processing…' : `Get Ticket — £${Number(ticketPrice).toFixed(2)}`}
            </Button>
          )
        ) : (
          <Button
            onClick={handleRSVP}
            className={`w-full py-6 text-lg gap-2 ${isAttending ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
          >
            {isAttending ? (<><Check className="w-5 h-5" /> Going</>) : 'RSVP to Event'}
          </Button>
        )}

        {/* Organiser Dashboard — only visible to the event creator */}
        {isHost && isTicketed && (
          <OrganiserDashboard eventId={event.id} />
        )}

        {/* Report */}
        <button onClick={() => toast.info('Report submitted')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors mx-auto">
          <Flag className="w-4 h-4" /> Report this event
        </button>
      </div>
    </div>
  );
};

export default EventDetail;
