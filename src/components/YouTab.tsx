import { useState, useEffect } from 'react';
import { Car, Users, Route, Calendar, UsersRound, Settings, ShoppingBag, ChevronRight, Crown, MessageSquare, Lock, MapPin, Share2, Pencil, Sparkles, Star, Building2, LifeBuoy, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUserStats } from '@/hooks/useUserStats';
import { useCurrentUser } from '@/hooks/useProfileData';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';

const YouTab = () => {
  const navigate = useNavigate();
  const { currentPlan, hasAccess, getPlanLabel, getRequiredPlan, effectivePlan } = usePlan();
  const { user } = useCurrentUser();
  const { garageCount, friendsCount, clubsCount, eventsCount, routesCount, discussionsCount, savedServicesCount } = useUserStats();
  const [isAvailableToHelp, setIsAvailableToHelp] = useState(false);
  const [helpDistance, setHelpDistance] = useState(10);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('available_to_help, help_radius_miles').eq('id', user.id).single();
      if (data) {
        setIsAvailableToHelp(data.available_to_help || false);
        setHelpDistance(data.help_radius_miles || 10);
      }
    })();
  }, [user?.id]);

  const handleAvailableToggle = (v: boolean) => {
    setIsAvailableToHelp(v);
    if (user?.id) supabase.from('profiles').update({ available_to_help: v }).eq('id', user.id);
  };
  const handleHelpDistanceCommit = (v: number[]) => {
    setHelpDistance(v[0]);
    if (user?.id) supabase.from('profiles').update({ help_radius_miles: v[0] }).eq('id', user.id);
  };

  const planBadge = {
    free: { label: 'Free', icon: Sparkles, className: 'bg-muted text-muted-foreground border-0' },
    pro: { label: 'Pro', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground border-0' },
    club: { label: 'Club', icon: Building2, className: 'bg-gradient-to-r from-clubs to-primary text-primary-foreground border-0' },
  };

  const badge = planBadge[currentPlan];
  const BadgeIcon = badge.icon;

  const tiles = [
    { id: 'garage', label: 'My Garage', icon: Car, count: garageCount, desc: 'vehicles', colorClass: 'bg-muted text-foreground', route: '/my-garage', featureId: 'garage_showcase' },
    { id: 'friends', label: 'My Friends', icon: UsersRound, count: friendsCount, desc: 'friends', colorClass: 'bg-muted text-foreground', route: '/my-friends', featureId: 'my_friends' },
    { id: 'clubs', label: 'My Clubs', icon: Users, count: clubsCount, desc: 'joined', colorClass: 'bg-clubs/10 text-clubs', route: '/my-clubs', featureId: 'join_clubs' },
    { id: 'events', label: 'My Events', icon: Calendar, count: eventsCount, desc: 'events', colorClass: 'bg-events/10 text-events', route: '/my-events', featureId: 'save_events' },
    { id: 'routes', label: 'My Routes', icon: Route, count: routesCount, desc: 'saved', colorClass: 'bg-routes/10 text-routes', route: '/my-routes', featureId: 'save_routes' },
    { id: 'services', label: 'Saved Services', icon: Wrench, count: savedServicesCount, desc: 'saved', colorClass: 'bg-services/10 text-services', route: '/my-services', featureId: 'save_events' },
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
    navigate(tile.route);
  };

  return (
    <div className="h-full bg-background pb-20 flex flex-col overflow-y-auto">

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
                    navigator.share({ title: user?.displayName || 'My Profile', url: window.location.origin + '/profile' });
                  } else {
                    navigator.clipboard.writeText(window.location.origin + '/profile');
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

      {/* ── Available to Help ── */}
      <div className="px-4 pt-3">
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="w-full flex items-center gap-3 px-4 py-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isAvailableToHelp ? 'bg-primary/10' : 'bg-muted'}`}>
              <LifeBuoy className={`w-4 h-4 transition-colors ${isAvailableToHelp ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground">Available to Help</span>
            </div>
          <Switch
              checked={isAvailableToHelp}
              onCheckedChange={handleAvailableToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>
          {isAvailableToHelp && (
            <div className="px-4 pb-3 pt-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Helping within</span>
                <span className="text-xs font-bold text-primary">{helpDistance} miles</span>
              </div>
              <Slider
                value={[helpDistance]}
                onValueChange={(v) => setHelpDistance(v[0])}
                onValueCommit={handleHelpDistanceCommit}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">1 mi</span>
                <span className="text-[10px] text-muted-foreground">50 mi</span>
              </div>
            </div>
          )}
        </div>
      </div>

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
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden divide-y divide-border/30">
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors active:bg-muted">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-semibold text-foreground text-sm">RevNet Shop</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
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
