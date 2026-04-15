import { useState, useEffect } from 'react';
import { Car, Users, Route, Calendar, UsersRound, Settings, ChevronRight, Crown, MessageSquare, Lock, MapPin, Share2, Pencil, Sparkles, Star, Building2, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/useUserStats';
import { useCurrentUser } from '@/hooks/useProfileData';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';

const YouTab = () => {
  const navigate = useNavigate();
  const { currentPlan, hasAccess, getPlanLabel, getRequiredPlan, effectivePlan } = usePlan();
  const { user } = useCurrentUser();
  const { garageCount, friendsCount, clubsCount, eventsCount, routesCount, discussionsCount, savedServicesCount } = useUserStats();
  const [freeEventCredits, setFreeEventCredits] = useState<number | null>(null);
  const [myTickets, setMyTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    // Profile details — race against 3s timeout
    (async () => {
      try {
        const result = await Promise.race([
          supabase.from('profiles').select('free_event_credits').eq('id', user.id).single(),
          new Promise<null>(r => setTimeout(() => r(null), 3000)),
        ]);
        if (result && 'data' in result && result.data) {
          setFreeEventCredits(result.data.free_event_credits ?? 0);
        }
      } catch { /* defaults */ }
    })();
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

  const planBadge = {
    free: { label: 'Explorer', icon: Sparkles, className: 'bg-muted text-muted-foreground border-0' },
    pro: { label: 'Pro Driver', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground border-0' },
    club: { label: 'Club', icon: Building2, className: 'bg-gradient-to-r from-clubs to-primary text-primary-foreground border-0' },
    business: { label: 'Business', icon: Building2, className: 'bg-gradient-to-r from-services to-primary text-primary-foreground border-0' },
  };

  const badge = planBadge[currentPlan];
  const BadgeIcon = badge.icon;

  const tiles = [
    { id: 'garage', label: 'My Garage', icon: Car, count: garageCount, desc: 'vehicles', colorClass: 'bg-muted text-foreground', route: '/my-garage', featureId: 'garage_showcase' },
    { id: 'friends', label: 'My Friends', icon: UsersRound, count: friendsCount, desc: 'friends', colorClass: 'bg-muted text-foreground', route: '/my-friends', featureId: 'my_friends' },
    { id: 'clubs', label: 'My Clubs', icon: Users, count: clubsCount, desc: 'joined', colorClass: 'bg-clubs/10 text-clubs', route: '/my-clubs', featureId: 'join_clubs' },
    { id: 'events', label: 'My Events', icon: Calendar, count: eventsCount, desc: 'events', colorClass: 'bg-events/10 text-events', route: '/my-events', featureId: 'save_events' },
    { id: 'routes', label: 'My Routes', icon: Route, count: routesCount, desc: 'saved', colorClass: 'bg-routes/10 text-routes', route: '/my-routes', featureId: 'save_routes' },
    { id: 'services', label: 'Saved Services', icon: Wrench, count: savedServicesCount, desc: 'saved', colorClass: 'bg-services/10 text-services', route: '/my-services', featureId: 'save_services' },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, count: discussionsCount, desc: 'posts', colorClass: 'bg-services/10 text-services', route: '/my-discussions', featureId: 'my_discussions' },
  ];

  const handleTileClick = (tile: typeof tiles[0]) => {
    if (!hasAccess(tile.featureId)) {
      const required = getRequiredPlan(tile.featureId);
      toast.info(`${tile.label} requires ${getPlanLabel(required)}`, {
        description: 'Upgrade your plan to unlock this feature.',
        action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
      });
      return;
    }
    sessionStorage.setItem('revnet_active_tab', 'you');
    navigate(tile.route);
  };

  if (!user) {
    return (
      <div className="mobile-container bg-background min-h-screen px-4 pt-8 md:max-w-[768px] md:mx-auto">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="w-[72px] h-[72px] rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background pb-20 flex flex-col overflow-y-auto md:max-w-[768px] md:mx-auto">

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
                  <Badge className={`${badge.className} gap-0.5 px-1.5 py-0.5 text-[10px] shrink-0`}>
                    <BadgeIcon className="w-2.5 h-2.5" />
                    {badge.label}
                  </Badge>
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
                {/* Free event credits display — hidden for Pro/Club */}
                {effectivePlan === 'free' && freeEventCredits !== null && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {freeEventCredits > 0
                      ? `${freeEventCredits} free event post remaining`
                      : '0 free posts — £5.99 per event'}
                  </p>
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
              {effectivePlan !== 'club' && (
                <button
                  onClick={() => navigate('/upgrade')}
                  className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors active:scale-[0.98]"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade
                </button>
              )}
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

      {/* ── 6 Action Tiles (2×3) ── */}
      <div className="px-4 pt-4 flex-1">
        <div className="grid grid-cols-3 gap-2.5">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const locked = !hasAccess(tile.featureId);
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`relative bg-card rounded-2xl border border-border/50 shadow-sm p-3 text-center hover:shadow-md hover:border-border transition-all duration-200 flex flex-col items-center gap-1.5 active:scale-[0.97] group ${locked ? 'opacity-50' : ''}`}
              >
                {locked && (
                  <div className="absolute top-1.5 right-1.5">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <div className={`w-11 h-11 rounded-xl ${tile.colorClass} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xs font-semibold text-foreground leading-tight">{tile.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {locked ? getPlanLabel(getRequiredPlan(tile.featureId)) : `${tile.count} ${tile.desc}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Utility ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors active:bg-muted"
          >
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-semibold text-foreground text-sm">Settings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTab;
