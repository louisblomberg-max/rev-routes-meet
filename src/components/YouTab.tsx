import { useState, useEffect } from 'react';
import { Car, Users, Route, Calendar, UsersRound, Settings, ChevronRight, MessageSquare, MapPin, Share2, Pencil, Wrench, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/useUserStats';
import { useCurrentUser } from '@/hooks/useProfileData';
import { supabase } from '@/integrations/supabase/client';

const YouTab = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { garageCount, friendsCount, clubsCount, eventsCount, routesCount, discussionsCount, savedServicesCount } = useUserStats();
  const [myTickets, setMyTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    // Tickets — race against 3s timeout
    (async () => {
      try {
        const result = await Promise.race([
          Promise.all([
            supabase.from('event_tickets').select('id, event_id, amount_paid, qr_code_token, status, events(title, date_start)').eq('user_id', user.id).eq('status', 'confirmed'),
            supabase.from('event_attendees').select('id, event_id, qr_code_token, events(title, date_start)').eq('user_id', user.id).not('qr_code_token', 'is', null),
          ]),
          new Promise<null>(r => setTimeout(() => r(null), 3000)),
        ]);
        if (result && Array.isArray(result)) {
          const [ticketsRes, passesRes] = result;
          const tickets = (ticketsRes.data || []).map((t: any) => ({ ...t, event_title: t.events?.title, event_date: t.events?.date_start, isFree: false }));
          const passes = (passesRes.data || []).filter((p: any) => !tickets.some((t: any) => t.event_id === p.event_id)).map((p: any) => ({ ...p, event_title: p.events?.title, event_date: p.events?.date_start, isFree: true, amount_paid: 0 }));
          setMyTickets([...tickets, ...passes]);
        }
      } catch { /* empty */ }
    })();
  }, [user?.id]);

  const rows = [
    { id: 'notifications', label: 'Notifications', icon: Bell, route: '/notifications', count: undefined },
    { id: 'garage', label: 'My Garage', icon: Car, route: '/my-garage', count: garageCount },
    { id: 'friends', label: 'My Friends', icon: UsersRound, route: '/my-friends', count: friendsCount },
    { id: 'events', label: 'My Events', icon: Calendar, route: '/my-events', count: eventsCount },
    { id: 'routes', label: 'My Routes', icon: Route, route: '/my-routes', count: routesCount },
    { id: 'services', label: 'Saved Services', icon: Wrench, route: '/my-services', count: savedServicesCount },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, route: '/my-discussions', count: discussionsCount },
  ];

  if (!user) {
    return (
      <div className="mobile-container min-h-screen px-4 pt-8 md:max-w-[768px] md:mx-auto" style={{ background: '#FFFFFF' }}>
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-[72px] h-[72px] rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full pb-20 flex flex-col overflow-y-auto md:max-w-[768px] md:mx-auto" style={{ background: '#FFFFFF' }}>

      {/* ── Profile Header Card ── */}
      <div className="px-4 pt-5">
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex items-start gap-3.5">
              {/* Avatar */}
              <button onClick={() => navigate('/profile')}>
                <Avatar className="w-16 h-16 ring-2 ring-primary/10 ring-offset-2 ring-offset-card">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-bold">
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-foreground truncate">{user?.displayName || 'New User'}</h1>
                </div>
                <p className="text-sm text-muted-foreground">@{user?.username || 'user'}</p>
                {user?.location && (
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground/80">
                    <MapPin className="w-3 h-3" />
                    <span>{user.location}</span>
                  </div>
                )}
            {user?.bio && (
                <p className="text-xs text-foreground/70 mt-1.5 line-clamp-2">{user.bio}</p>
                )}
              </div>
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 h-9 rounded-lg border border-border/50 text-sm font-semibold text-foreground flex items-center justify-center gap-1.5 hover:bg-muted/50 transition-colors active:scale-[0.98]"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: user?.displayName || 'My Profile', url: window.location.origin + '/user/' + (user?.username || '') });
                  } else {
                    navigator.clipboard.writeText(window.location.origin + '/user/' + (user?.username || ''));
                    toast.success('Profile link copied!');
                  }
                }}
                className="h-9 w-9 rounded-lg border border-border/50 flex items-center justify-center hover:bg-muted/50 transition-colors active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-4 py-2.5 bg-muted/30 border-t border-border/30 flex items-center justify-around">
            <button onClick={() => navigate('/my-events')} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Calendar className="w-3.5 h-3.5 text-events" />
              <span className="text-xs font-bold text-foreground">{eventsCount}</span>
              <span className="text-xs text-muted-foreground">Events</span>
            </button>
            <div className="w-px h-4 bg-border/40" />
            <button onClick={() => navigate('/my-routes')} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Route className="w-3.5 h-3.5 text-routes" />
              <span className="text-xs font-bold text-foreground">{routesCount}</span>
              <span className="text-xs text-muted-foreground">Routes</span>
            </button>
            <div className="w-px h-4 bg-border/40" />
            <button onClick={() => navigate('/my-clubs')} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Users className="w-3.5 h-3.5 text-clubs" />
              <span className="text-xs font-bold text-foreground">{clubsCount}</span>
              <span className="text-xs text-muted-foreground">Clubs</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── My Tickets ── */}
      {myTickets.length > 0 && (
        <div className="px-4 pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Tickets</p>
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {myTickets.map((t: any) => (
              <button
                key={t.id}
                onClick={() => navigate(t.isFree
                  ? `/ticket-success?ticket_id=free&event_id=${t.event_id}&type=free#token=${t.qr_code_token}`
                  : `/ticket-success?ticket_id=${t.id}`
                )}
                className="flex-shrink-0 w-[160px] bg-card rounded-xl border border-border/50 shadow-sm p-3 text-left"
              >
                <p className="text-sm font-semibold truncate">{t.event_title || 'Event'}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t.event_date || ''}</p>
                <p className="text-[10px] mt-1" style={{ color: '#d30d37' }}>{t.isFree ? 'Free Pass' : `Ticket · £${Number(t.amount_paid || 0).toFixed(2)}`}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Tap to show QR</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Row Items ── */}
      <div className="px-4 pt-4 flex-1">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <button
              key={row.id}
              onClick={() => {
                sessionStorage.setItem('revnet_active_tab', 'you');
                navigate(row.route);
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0', background: 'none', border: 'none',
                borderBottom: '1px solid #F5F5F5', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color="#999" />
              </div>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#111' }}>{row.label}</span>
              {row.count !== undefined && (
                <span style={{ fontSize: 13, color: '#999', marginRight: 8 }}>{row.count}</span>
              )}
              <ChevronRight size={16} color="#DDD" />
            </button>
          );
        })}
      </div>

      {/* ── Settings ── */}
      <div className="px-4 pt-2 pb-2">
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 0', background: 'none', border: 'none',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={18} color="#999" />
          </div>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#111' }}>Settings</span>
          <ChevronRight size={16} color="#DDD" />
        </button>
      </div>
    </div>
  );
};

export default YouTab;
