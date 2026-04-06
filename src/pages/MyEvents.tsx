import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Clock, ChevronRight, CalendarCheck, Bookmark } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserEvents } from '@/hooks/useProfileData';
import { usePlan } from '@/contexts/PlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const eventTypeColors: Record<string, string> = {
  'Meets': 'bg-events/15 text-events',
  'Cars & Coffee': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Group Drive': 'bg-routes/15 text-routes',
  'Track Day': 'bg-primary/15 text-primary',
  'Show / Exhibition': 'bg-clubs/15 text-clubs',
};

const MyEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan } = usePlan();
  const { upcoming, past, saved, isLoading } = useUserEvents();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'hosting' | 'saved'>('upcoming');
  const [attendeeMap, setAttendeeMap] = useState<Record<string, any[]>>({});

  const hosted = upcoming.filter(e => e.isHost);
  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming', count: upcoming.length, icon: CalendarCheck },
    { id: 'past' as const, label: 'Past', count: past.length, icon: Clock },
    { id: 'hosting' as const, label: 'Hosting', count: hosted.length, icon: Calendar },
    { id: 'saved' as const, label: 'Saved', count: saved.length, icon: Bookmark },
  ];

  const displayEvents = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : activeTab === 'hosting' ? hosted : saved;

  // Fetch attendee avatars for hosted events
  useEffect(() => {
    if (hosted.length === 0) return;
    const fetchAttendees = async () => {
      const map: Record<string, any[]> = {};
      for (const event of hosted) {
        const { data } = await supabase
          .from('event_attendees')
          .select('user_id, profiles:user_id(id, display_name, avatar_url)')
          .eq('event_id', event.id)
          .limit(5);
        map[event.id] = data || [];
      }
      setAttendeeMap(map);
    };
    fetchAttendees();
  }, [hosted.length]);

  // Realtime: update when attendees change
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('my-events-attendees')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'event_attendees' }, () => {
        // Re-fetch attendees for hosted events
        if (hosted.length > 0) {
          const fetchAttendees = async () => {
            const map: Record<string, any[]> = {};
            for (const event of hosted) {
              const { data } = await supabase
                .from('event_attendees')
                .select('user_id, profiles:user_id(id, display_name, avatar_url)')
                .eq('event_id', event.id)
                .limit(5);
              map[event.id] = data || [];
            }
            setAttendeeMap(map);
          };
          fetchAttendees();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, hosted.length]);

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} />
            <div>
              <h1 className="text-lg font-bold text-foreground">My Events</h1>
              <p className="text-xs text-muted-foreground">{upcoming.length} upcoming</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentPlan === 'free' && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fce8ed', color: '#d30d37' }}>
                {user?.eventCredits || 0} credit{(user?.eventCredits || 0) !== 1 ? 's' : ''}
              </span>
            )}
            <Button size="sm" onClick={() => navigate('/add/event')} className="gap-1.5 rounded-lg">
              <Plus className="w-4 h-4" /> Create
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border/50 hover:border-border'}`}>
              <tab.icon className="w-3.5 h-3.5" /> {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
                <div className="flex items-center gap-2"><Skeleton className="h-5 w-16 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No {activeTab} events</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === 'upcoming' ? 'Discover events or create your own' : 'Events will appear here'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>Discover</Button>
              <Button onClick={() => navigate('/add/event')}><Plus className="w-4 h-4 mr-1" /> Create Event</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map(event => {
              const eventAttendees = attendeeMap[event.id] || [];
              const totalAttendees = event.attendees || eventAttendees.length;

              return (
                <div
                  key={event.id}
                  className={`bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden ${activeTab === 'past' ? 'opacity-75' : ''}`}
                >
                  <button
                    onClick={() => navigate('/', { state: { showEventId: event.id } })}
                    className="w-full p-4 text-left hover:bg-muted/30 transition-colors active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {event.isHost && <Badge variant="secondary" className="text-[10px] py-0 h-5 bg-primary/10 text-primary">Host</Badge>}
                          <Badge className={`text-[10px] py-0 h-5 ${eventTypeColors[event.eventType] || 'bg-muted text-foreground'}`}>{event.eventType}</Badge>
                        </div>
                        <h3 className="font-bold text-foreground truncate">{event.title}</h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-1" />
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4 text-events" /><span>{event.date}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /><span className="truncate">{event.location}</span></div>

                      {/* Attendee avatars for hosted events */}
                      {event.isHost && eventAttendees.length > 0 ? (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex -space-x-2">
                            {eventAttendees.slice(0, 5).map((a: any, i: number) => (
                              <div key={a.user_id || i} className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden"
                                style={{ zIndex: 5 - i }}>
                                {a.profiles?.avatar_url
                                  ? <img src={a.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                  : (a.profiles?.display_name || '?')[0].toUpperCase()
                                }
                              </div>
                            ))}
                            {totalAttendees > 5 && (
                              <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-semibold text-muted-foreground">
                                +{totalAttendees - 5}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{totalAttendees} attending</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" /><span>{totalAttendees} attending</span>
                        </div>
                      )}

                      {/* Status badge for non-host events */}
                      {!event.isHost && 'status' in event && (
                        <div className="pt-0.5">
                          <Badge variant="outline" className="text-[10px]">
                            {event.status === 'attending' ? '✓ Going' : event.status === 'attended' ? '✓ Attended' : '★ Interested'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Manage button for hosted events */}
                  {event.isHost && (
                    <button
                      onClick={() => navigate(`/event/${event.id}/manage`)}
                      className="w-full py-2.5 text-sm font-semibold text-white border-t border-border/20"
                      style={{ backgroundColor: '#d30d37' }}
                    >
                      Manage Event
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
