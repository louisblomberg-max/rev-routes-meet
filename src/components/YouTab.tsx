import { useState } from 'react';
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

const YouTab = () => {
  const navigate = useNavigate();
  const { currentPlan, hasAccess, getPlanLabel, getRequiredPlan, effectivePlan } = usePlan();
  const { user } = useCurrentUser();
  const { garageCount, friendsCount, clubsCount, eventsCount, routesCount, discussionsCount, savedServicesCount } = useUserStats();
  const [isAvailableToHelp, setIsAvailableToHelp] = useState(false);
  const [helpDistance, setHelpDistance] = useState(10);

  const planBadge = {
    free: { label: 'Free', icon: Sparkles, className: 'bg-muted text-muted-foreground border-0' },
    pro: { label: 'Pro', icon: Star, className: 'bg-primary/15 text-primary border-0' },
    club: { label: 'Club', icon: Building2, className: 'bg-clubs/15 text-clubs border-0' },
  };

  const badge = planBadge[currentPlan];
  const BadgeIcon = badge.icon;

  const tiles = [
    { id: 'garage', label: 'My Garage', icon: Car, count: garageCount, desc: 'vehicles', route: '/my-garage', featureId: 'garage_showcase' },
    { id: 'friends', label: 'My Friends', icon: UsersRound, count: friendsCount, desc: 'friends', route: '/my-friends', featureId: 'my_friends' },
    { id: 'clubs', label: 'My Clubs', icon: Users, count: clubsCount, desc: 'joined', route: '/my-clubs', featureId: 'join_clubs' },
    { id: 'events', label: 'My Events', icon: Calendar, count: eventsCount, desc: 'events', route: '/my-events', featureId: 'save_events' },
    { id: 'routes', label: 'My Routes', icon: Route, count: routesCount, desc: 'saved', route: '/my-routes', featureId: 'save_routes' },
    { id: 'services', label: 'Saved Services', icon: Wrench, count: savedServicesCount, desc: 'saved', route: '/my-services', featureId: 'save_events' },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, count: discussionsCount, desc: 'posts', route: '/my-discussions', featureId: 'my_discussions' },
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

      {/* Profile Header Card */}
      <div className="px-5 pt-6 safe-top">
        <div className="bg-card rounded-2xl shadow-premium overflow-hidden">
          <div className="p-5">
            <div className="flex items-start gap-4">
              <button onClick={() => navigate('/profile')}>
                <Avatar className="w-16 h-16 ring-2 ring-primary/10 ring-offset-2 ring-offset-card">
                  <AvatarImage src={user?.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>

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
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user?.bio && (
                  <p className="text-xs text-foreground/70 mt-1.5 line-clamp-2">{user.bio}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 h-10 rounded-[14px] bg-muted text-sm font-semibold text-foreground flex items-center justify-center gap-1.5 hover:bg-muted/80 transition-colors active:scale-[0.98]"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={() => { toast.success('Profile link copied!'); }}
                className="h-10 w-10 rounded-[14px] bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4 text-muted-foreground" />
              </button>
              {effectivePlan !== 'club' && (
                <button
                  onClick={() => navigate('/upgrade')}
                  className="h-10 px-4 rounded-[14px] bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors active:scale-[0.98]"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="px-5 py-3 bg-muted/20 flex items-center justify-around">
            <button onClick={() => navigate('/my-events')} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Calendar className="w-3.5 h-3.5 text-events" />
              <span className="text-xs font-bold text-foreground">{eventsCount}</span>
              <span className="text-xs text-muted-foreground">Events</span>
            </button>
            <div className="w-px h-4 bg-border/30" />
            <button onClick={() => navigate('/my-routes')} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Route className="w-3.5 h-3.5 text-routes" />
              <span className="text-xs font-bold text-foreground">{routesCount}</span>
              <span className="text-xs text-muted-foreground">Routes</span>
            </button>
            <div className="w-px h-4 bg-border/30" />
            <button onClick={() => navigate('/my-clubs')} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Users className="w-3.5 h-3.5 text-clubs" />
              <span className="text-xs font-bold text-foreground">{clubsCount}</span>
              <span className="text-xs text-muted-foreground">Clubs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Available to Help */}
      <div className="px-5 pt-4">
        <div className="bg-card rounded-2xl shadow-premium overflow-hidden">
          <div className="w-full flex items-center gap-3 px-5 py-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isAvailableToHelp ? 'bg-primary/10' : 'bg-muted'}`}>
              <LifeBuoy className={`w-4 h-4 transition-colors ${isAvailableToHelp ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground">Available to Help</span>
            </div>
            <Switch checked={isAvailableToHelp} onCheckedChange={setIsAvailableToHelp} className="data-[state=checked]:bg-primary" />
          </div>
          {isAvailableToHelp && (
            <div className="px-5 pb-4 pt-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Helping within</span>
                <span className="text-xs font-bold text-primary">{helpDistance} miles</span>
              </div>
              <Slider value={[helpDistance]} onValueChange={(v) => setHelpDistance(v[0])} min={1} max={50} step={1} className="w-full" />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">1 mi</span>
                <span className="text-[10px] text-muted-foreground">50 mi</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Tiles */}
      <div className="px-5 pt-5 flex-1">
        <div className="grid grid-cols-3 gap-3">
          {tiles.map((tile, index) => {
            const Icon = tile.icon;
            const locked = !hasAccess(tile.featureId);
            return (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                className={`relative bg-card rounded-2xl shadow-premium p-3.5 text-center hover:shadow-elevated transition-all duration-200 flex flex-col items-center gap-2 active:scale-[0.97] group animate-card-enter ${locked ? 'opacity-50' : ''}`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {locked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center transition-transform group-hover:scale-105">
                  <Icon className="w-5 h-5 text-muted-foreground" />
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

      {/* Utility */}
      <div className="px-5 pt-5 pb-3">
        <div className="bg-card rounded-2xl shadow-premium overflow-hidden">
          <button className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-muted/30 transition-colors active:bg-muted">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-semibold text-foreground text-sm">RevNet Shop</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="h-px bg-border/20 mx-5" />
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-muted/30 transition-colors active:bg-muted"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
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