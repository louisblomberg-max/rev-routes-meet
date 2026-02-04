import { MapPin, Crown, Sparkles, Star, ChevronRight, Calendar, Route, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/data/profileData';

interface ProfileHeaderCompactProps {
  profile: UserProfile;
  onTap: () => void;
}

const ProfileHeaderCompact = ({ profile, onTap }: ProfileHeaderCompactProps) => {
  const planBadge = {
    free: { label: 'Free', icon: Sparkles, className: 'bg-muted text-muted-foreground border-0' },
    enthusiast: { label: 'Enthusiast', icon: Crown, className: 'bg-gradient-to-r from-events to-primary text-primary-foreground border-0' },
    pro: { label: 'Pro', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground border-0' },
  };

  const currentBadge = planBadge[profile.plan];
  const BadgeIcon = currentBadge.icon;

  return (
    <button
      onClick={onTap}
      className="w-full bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden text-left hover:shadow-md hover:border-border/50 transition-all duration-200 active:scale-[0.99]"
    >
      {/* Main Content */}
      <div className="p-4 flex items-center gap-3.5">
        {/* Avatar with subtle ring */}
        <div className="relative">
          <Avatar className="w-14 h-14 ring-2 ring-primary/10 ring-offset-2 ring-offset-card">
            <AvatarImage src={profile.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-bold">
              {profile.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground truncate">{profile.displayName}</h1>
            <Badge className={`${currentBadge.className} gap-0.5 px-1.5 py-0.5 text-[10px] shrink-0`}>
              <BadgeIcon className="w-2.5 h-2.5" />
              {currentBadge.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
          {profile.location && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/80">
              <MapPin className="w-3 h-3" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground/40 shrink-0" />
      </div>

      {/* Stats Bar */}
      <div className="px-4 py-2.5 bg-muted/30 border-t border-border/20 flex items-center justify-around">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-events" />
          <span className="text-xs font-semibold text-foreground">{profile.stats.eventsAttended}</span>
          <span className="text-xs text-muted-foreground">Events</span>
        </div>
        <div className="w-px h-4 bg-border/40" />
        <div className="flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-routes" />
          <span className="text-xs font-semibold text-foreground">{profile.stats.routesSaved}</span>
          <span className="text-xs text-muted-foreground">Routes</span>
        </div>
        <div className="w-px h-4 bg-border/40" />
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-clubs" />
          <span className="text-xs font-semibold text-foreground">{profile.stats.clubsJoined}</span>
          <span className="text-xs text-muted-foreground">Clubs</span>
        </div>
      </div>
    </button>
  );
};

export default ProfileHeaderCompact;
