import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TicketPurchaseSheet from '@/components/TicketPurchaseSheet';
import { sendNotification } from '@/utils/sendNotification';

interface EventDetailContentProps {
  event: any;
  onNavigate: () => void;
  onViewFull?: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const EventDetailContent = ({ event, onNavigate, isSaved, onToggleSave }: EventDetailContentProps) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const userId = authUser?.id;

  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [organiser, setOrganiser] = useState<any>(null);
  const [seriesEvents, setSeriesEvents] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showTicketSheet, setShowTicketSheet] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);

  // Normalize — event may come from pin data or direct
  const data = event.data || event;
  const eventId = event.id || data.id;
  const title = event.title || data.title;
  const lat = event.lat || data.lat;
  const lng = event.lng || data.lng;

  const allPhotos = [
    data.banner_url || data.bannerImage,
    ...(data.photos || [])
  ].filter(Boolean);

  useEffect(() => {
    if (!eventId || !userId) return;
    const load = async () => {
      // Organiser
      if (data.created_by || data.createdBy) {
        const creatorId = data.created_by || data.createdBy;
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, plan')
          .eq('id', creatorId)
          .single();
        setOrganiser(profile);
      }

      // Attendance
      const { data: attending } = await supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
      setIsAttending(!!attending);

      // Count
      setAttendeeCount(data.attendee_count || data.attendees || 0);

      // Series
      if (data.series_id) {
        const { data: series } = await supabase
          .from('events')
          .select('id, title, date_start, attendee_count')
          .eq('series_id', data.series_id)
          .neq('id', eventId)
          .order('date_start', { ascending: true })
          .limit(5);
        setSeriesEvents(series || []);
      }
    };
    load();
  }, [eventId, userId]);

  // Realtime attendee count
  useEffect(() => {
    if (!eventId) return;
    const channel = supabase
      .channel(`event-attendees-${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_attendees',
        filter: `event_id=eq.${eventId}`
      }, () => {
        supabase
          .from('events')
          .select('attendee_count')
          .eq('id', eventId)
          .single()
          .then(({ data: d }) => {
            if (d) setAttendeeCount(d.attendee_count || 0);
          });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  // Fetch ticket types for paid events
  useEffect(() => {
    if (!eventId) return;
    supabase.from('event_ticket_types')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .then(({ data: types }) => {
        if (types && types.length > 0) setTicketTypes(types);
      });
  }, [eventId]);

  const handleAttendClick = () => {
    if (!userId) { navigate('/auth'); return; }
    const isPaid = data.is_ticketed || (data.entry_fee && Number(data.entry_fee) > 0) || data.is_free === false;
    if (isPaid && ticketTypes.length > 0) {
      setShowTicketSheet(true);
    } else if (isPaid && ticketTypes.length === 0) {
      toast.error('Tickets are not available yet. Check back soon.');
    } else {
      handleAttend();
    }
  };

  const handleAttend = async () => {
    if (!userId) { navigate('/auth'); return; }
    setActionLoading(true);
    try {
      if (isAttending) {
        await supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
        setIsAttending(false);
        setAttendeeCount(prev => Math.max(0, prev - 1));
        toast.success('Removed from attending');
      } else {
        const maxAtt = data.max_attendees || data.maxAttendees;
        if (maxAtt && attendeeCount >= maxAtt) {
          if (data.waitlist_enabled) {
            toast.info('Event is full — you have been added to the waitlist');
          } else {
            toast.error('This event is full');
          }
          return;
        }
        const { data: attendRow } = await supabase.from('event_attendees')
          .insert({ event_id: eventId, user_id: userId, status: 'attending' })
          .select('qr_code_token')
          .single();
        setIsAttending(true);
        setAttendeeCount(prev => prev + 1);
        toast.success("You're attending!");

        // Only show QR pass if event has limited capacity or is ticketed
        const needsQR = data.is_ticketed || (maxAtt && maxAtt > 0);
        if (needsQR && attendRow?.qr_code_token) {
          navigate(`/ticket-success?ticket_id=free&event_id=${eventId}&token=${attendRow.qr_code_token}&type=free`);
        }

        const creatorId = data.created_by || data.createdBy;
        if (creatorId && creatorId !== userId) {
          sendNotification({
            userId: creatorId,
            title: '🎉 New Attendee',
            body: `${authUser?.displayName || 'Someone'} is attending ${title}`,
            type: 'new_attendee',
            data: { event_id: eventId, user_id: userId },
          });
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async () => {
    const dateStr = data.date_start ? format(new Date(data.date_start), 'EEE d MMM yyyy') : '';
    const shareText = `Check out ${title} on RevNet!\n${data.location || ''}\n${dateStr}`;
    if (navigator.share) {
      try { await navigator.share({ title, text: shareText, url: window.location.href }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Event details copied to clipboard');
    }
  };

  const isOwnEvent = userId === (data.created_by || data.createdBy);
  const isFree = data.is_free !== false && !data.is_ticketed;
  const meetStyleTags = data.meet_style_tags || [];
  const vehicleFocus = data.vehicle_focus || 'all_welcome';
  const vehicleBrands = data.vehicle_brands || [];
  const maxAtt = data.max_attendees || data.maxAttendees;
  const isFull = !!(maxAtt && attendeeCount >= maxAtt);
  const eventRules = data.event_rules;

  return (
    <div className="space-y-4">
      {/* Event banner — portrait 9:16 */}
      {allPhotos.length > 0 ? (
        <div className="relative" style={{ width: '160px', aspectRatio: '9/16', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' }}>
          <img
            src={allPhotos[currentPhotoIndex]}
            className="w-full h-full object-cover"
            alt={title}
          />
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhotoIndex(prev => (prev - 1 + allPhotos.length) % allPhotos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center text-sm"
              >‹</button>
              <button
                onClick={() => setCurrentPhotoIndex(prev => (prev + 1) % allPhotos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center text-sm"
              >›</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {allPhotos.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
          {data.type && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-medium">
              {data.type}
            </div>
          )}
        </div>
      ) : null}

      {/* Title and actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground leading-tight">{title}</h2>
          {data.date_start && (
            <p className="text-sm text-events font-medium mt-0.5">
              {format(new Date(data.date_start), 'EEE d MMM yyyy · HH:mm')}
              {data.date_end && ` — ${format(new Date(data.date_end), 'HH:mm')}`}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => { onToggleSave(); }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
              isSaved ? 'bg-events/10 border-events text-events' : 'bg-muted/50 border-border/50 text-muted-foreground'
            }`}
          >
            {isSaved ? '♥' : '♡'}
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-xl flex items-center justify-center border bg-muted/50 border-border/50 text-muted-foreground"
          >↗</button>
        </div>
      </div>

      {/* Event type badges */}
      <div className="flex flex-wrap gap-1.5">
        {(data.event_types?.length > 0 ? data.event_types : [data.type || data.eventType]).filter(Boolean).map((t: string) => (
          <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-events/10 text-events">
            {t}
          </span>
        ))}
      </div>

      {/* Event style tags */}
      {meetStyleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {meetStyleTags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-events/10 text-events text-[10px] font-semibold border border-events/20">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">📍</div>
        <div>
          <p className="text-sm font-medium text-foreground">{data.location || 'Location not set'}</p>
          {data.what3words && (
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="text-red-500 font-bold">///</span>{data.what3words}
            </p>
          )}
        </div>
      </div>

      {/* Attendees */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">👥</div>
        <div>
          <p className="text-sm font-medium">
            {maxAtt
              ? `${attendeeCount} / ${maxAtt} attending`
              : `${attendeeCount} attending · Unlimited spaces`
            }
          </p>
          {maxAtt && attendeeCount >= maxAtt && (
            <p className="text-xs text-destructive font-medium">
              {data.waitlist_enabled ? 'Full — waitlist available' : 'Event full'}
            </p>
          )}
        </div>
      </div>

      {/* Entry */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">🎫</div>
        <div>
          {isFree ? (
            <p className="text-sm font-medium text-green-600">Free entry</p>
          ) : data.is_ticketed ? (
            <p className="text-sm font-medium">Tickets — £{Number(data.ticket_price).toFixed(2)}</p>
          ) : (
            <p className="text-sm font-medium">Entry fee applies</p>
          )}
        </div>
      </div>

      {/* Vehicle focus */}
      {vehicleFocus && vehicleFocus !== 'all_welcome' && (
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">🚗</div>
          <div>
            <p className="text-sm font-medium">
              {vehicleFocus === 'cars_only' ? 'Cars only' :
               vehicleFocus === 'motorcycles_only' ? 'Motorcycles only' :
               vehicleFocus === 'specific_makes' && vehicleBrands.length > 0 ? `Specific brands: ${vehicleBrands.join(', ')}` :
               vehicleFocus === 'event_style' && meetStyleTags.length > 0 ? `Style: ${meetStyleTags.join(', ')}` :
               vehicleFocus === 'vehicle_era' && (data.specific_years?.length > 0) ? `Era: ${data.specific_years.join(', ')}` :
               vehicleFocus === 'specific_makes' ? 'Specific Brand' :
               vehicleFocus === 'event_style' ? 'Event Style' :
               vehicleFocus === 'vehicle_era' ? 'Vehicle Era' : vehicleFocus}
            </p>
          </div>
        </div>
      )}

      {/* Specific years */}
      {(data.specific_years?.length > 0) && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">📅</div>
          <div className="flex flex-wrap gap-1">
            {data.specific_years.map((y: string) => (
              <span key={y} className="px-2 py-0.5 rounded-full bg-events/10 text-events text-[10px] font-semibold">{y}</span>
            ))}
          </div>
        </div>
      )}

      {/* Event rules */}
      {eventRules && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">Event Rules</p>
          <p className="text-xs text-amber-700 dark:text-amber-300">{eventRules}</p>
        </div>
      )}

      {/* Description */}
      {(data.description) && (
        <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
      )}

      {/* Organiser */}
      {organiser && (
        <button
          onClick={() => navigate(`/profile/${organiser.id}`)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
        >
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {organiser.avatar_url ? (
              <img src={organiser.avatar_url} className="w-full h-full object-cover" alt={organiser.display_name} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                {(organiser.display_name || organiser.username || '?')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs text-muted-foreground">Organised by</p>
            <p className="text-sm font-semibold">{organiser.display_name || organiser.username}</p>
            {organiser.plan === 'organiser' && (
              <span className="text-[10px] text-events font-medium">Verified Organiser</span>
            )}
          </div>
          <span className="text-muted-foreground">›</span>
        </button>
      )}

      {/* Series events */}
      {seriesEvents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Other dates in this series</p>
          <div className="space-y-2">
            {seriesEvents.map(se => (
              <div key={se.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                <div>
                  <p className="text-xs font-medium">{format(new Date(se.date_start), 'EEE d MMM yyyy')}</p>
                  <p className="text-[10px] text-muted-foreground">{se.attendee_count} attending</p>
                </div>
                <button
                  onClick={() => navigate(`/event/${se.id}`)}
                  className="text-xs text-events font-medium"
                >View →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket types for ticketed events */}
      {data.is_ticketed && ticketTypes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tickets</p>
          {ticketTypes.map((tt: any) => (
            <div key={tt.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-border/30">
              <div>
                <p className="text-sm font-medium">{tt.name}</p>
                {tt.description && <p className="text-[10px] text-muted-foreground">{tt.description}</p>}
              </div>
              <p className="text-sm font-bold" style={{ color: '#d30d37' }}>£{Number(tt.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Manage for host */}
      {isOwnEvent && (
        <button
          onClick={() => navigate(`/event/${eventId}/manage`)}
          className="w-full py-3 rounded-xl bg-muted/50 border border-border/50 text-sm font-medium text-foreground"
        >Manage Event & Attendees</button>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <button
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[hsl(var(--routes))] text-white text-sm font-semibold"
        >Directions</button>
        <button
          onClick={handleAttendClick}
          disabled={actionLoading || (isFull && !isAttending)}
          className={`flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${
            isAttending
              ? 'bg-green-600 text-white'
              : isFull
                ? 'bg-muted text-muted-foreground'
                : 'bg-events text-events-foreground'
          }`}
        >
          {actionLoading ? '...' : isAttending ? '✓ Attending' : isFull ? 'Event Full' : 'Attend'}
        </button>
      </div>

      {/* Ticket purchase sheet */}
      {showTicketSheet && (
        <TicketPurchaseSheet
          event={data}
          ticketTypes={ticketTypes}
          onClose={() => setShowTicketSheet(false)}
          onSuccess={() => {
            setShowTicketSheet(false);
            setIsAttending(true);
            setAttendeeCount(prev => prev + 1);
            toast.success("You're going! Check your tickets.");
          }}
        />
      )}
    </div>
  );
};

export default EventDetailContent;
