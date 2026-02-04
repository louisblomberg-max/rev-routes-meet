import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Plus, Clock, ChevronRight, CalendarCheck, CalendarX, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockEvents } from '@/data/mockData';

// Extended mock data for user's events
const myUpcomingEvents = [
  { ...mockEvents[0], status: 'attending' as const, isHost: false },
  { ...mockEvents[4], status: 'attending' as const, isHost: true },
  { ...mockEvents[7], status: 'interested' as const, isHost: false },
];

const myPastEvents = [
  { 
    id: 'past1',
    title: 'BMW Sunday Cruise',
    date: 'Sun, Jan 28 • 10:00 AM',
    location: 'Ace Cafe, London',
    vehicleType: 'BMW Only',
    eventType: 'Group Drive',
    attendees: 34,
    status: 'attended' as const,
    isHost: true,
  },
  { 
    id: 'past2',
    title: 'New Year Meet 2024',
    date: 'Mon, Jan 1 • 12:00 PM',
    location: 'Caffeine & Machine',
    vehicleType: 'All Welcome',
    eventType: 'Meets',
    attendees: 156,
    status: 'attended' as const,
    isHost: false,
  },
];

const eventTypeColors: Record<string, string> = {
  'Meets': 'bg-events/15 text-events',
  'Cars & Coffee': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Group Drive': 'bg-routes/15 text-routes',
  'Track Day': 'bg-primary/15 text-primary',
  'Show / Exhibition': 'bg-clubs/15 text-clubs',
};

const MyEvents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingCount = myUpcomingEvents.length;
  const pastCount = myPastEvents.length;

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">My Events</h1>
              <p className="text-xs text-muted-foreground">{upcomingCount} upcoming</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/add/event')}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upcoming" className="gap-1.5">
              <CalendarCheck className="w-4 h-4" />
              Upcoming ({upcomingCount})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-1.5">
              <Clock className="w-4 h-4" />
              Past ({pastCount})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {myUpcomingEvents.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/30 p-8 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No upcoming events</h3>
                <p className="text-sm text-muted-foreground mb-4">Discover events or create your own</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Discover
                  </Button>
                  <Button onClick={() => navigate('/add/event')}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create Event
                  </Button>
                </div>
              </div>
            ) : (
              myUpcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="w-full bg-card rounded-2xl border border-border/30 shadow-sm p-4 text-left hover:shadow-md hover:border-border transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {event.isHost && (
                          <Badge variant="secondary" className="text-[10px] py-0 h-5 bg-primary/10 text-primary">
                            Host
                          </Badge>
                        )}
                        <Badge className={`text-[10px] py-0 h-5 ${eventTypeColors[event.eventType] || 'bg-muted text-foreground'}`}>
                          {event.eventType}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground truncate">{event.title}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-1" />
                  </div>
                  
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-events" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} attending</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {event.status === 'attending' ? '✓ Going' : '★ Interested'}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past" className="mt-4 space-y-3">
            {myPastEvents.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/30 p-8 text-center">
                <CalendarX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No past events</h3>
                <p className="text-sm text-muted-foreground">Events you've attended will appear here</p>
              </div>
            ) : (
              myPastEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => navigate(`/event/${event.id}`)}
                  className="w-full bg-card rounded-2xl border border-border/30 shadow-sm p-4 text-left hover:shadow-md hover:border-border transition-all active:scale-[0.99] opacity-80"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {event.isHost && (
                          <Badge variant="secondary" className="text-[10px] py-0 h-5 bg-muted text-muted-foreground">
                            Hosted
                          </Badge>
                        )}
                        <Badge className="text-[10px] py-0 h-5 bg-muted text-muted-foreground">
                          {event.eventType}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground truncate">{event.title}</h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-1" />
                  </div>
                  
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees} attended</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyEvents;