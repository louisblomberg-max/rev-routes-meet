import { MapPin, ChevronRight, Calendar, Route, Users, Sparkles, Star, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePlan } from '@/contexts/PlanContext';
import { useUserStats } from '@/hooks/useUserStats';
import { useCurrentUser } from '@/hooks/useProfileData';

interface ProfileHeaderCompactProps {
  profile?: { displayName: string; username: string; avatar: string | null; location?: string };
  onTap: () => void;
}

const ProfileHeaderCompact = ({ onTap }: ProfileHeaderCompactProps) => {
  const { currentPlan } = usePlan();
  const { user } = useCurrentUser();
  const { eventsCount, routesCount, clubsCount } = useUserStats();

  const planBadge = {
    free: { label: 'Free', icon: Sparkles, className: 'bg-muted text-muted-foreground border-0' },
    pro: { label: 'Pro', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground border-0' },
    club: { label: 'Club', icon: Building2, className: 'bg-gradient-to-r from-clubs to-primary text-primary-foreground border-0' },
  };

  const badge = planBadge[currentPlan];
  const BadgeIcon = badge.icon;

  return (
    <button
      onClick={onTap}
      className="w-full bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden text-left hover:shadow-md hover:border-border transition-all duration-200 active:scale-[0.99]"
    >
      <div className="p-4 flex items-center gap-3.5">
        <Avatar className="w-14 h-14 ring-2 ring-primary/10 ring-offset-2 ring-offset-card">
          <AvatarImage src={user?.avatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-bold">
            {user?.displayName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground truncate">{user?.displayName || 'New User'}</h1>
            <Badge className={`${badge.className} gap-0.5 px-1.5 py-0.5 text-[10px] shrink-0`}>
              <BadgeIcon className="w-2.5 h-2.5" />
              {badge.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">@{user?.username || 'user'}</p>
          {user?.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/80">
              <MapPin className="w-3 h-3" />
              <span>{user.location}</span>
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
      </div>
      <div className="px-4 py-2.5 bg-muted/30 border-t border-border/20 flex items-center justify-around">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-events" />
          <span className="text-xs font-semibold text-foreground">{eventsCount}</span>
          <span className="text-xs text-muted-foreground">Events</span>
        </div>
        <div className="w-px h-4 bg-border/40" />
        <div className="flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-routes" />
          <span className="text-xs font-semibold text-foreground">{routesCount}</span>
          <span className="text-xs text-muted-foreground">Routes</span>
        </div>
        <div className="w-px h-4 bg-border/40" />
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-clubs" />
          <span className="text-xs font-semibold text-foreground">{clubsCount}</span>
          <span className="text-xs text-muted-foreground">Clubs</span>
        </div>
      </div>
    </button>
  );
};

export default ProfileHeaderCompact;
