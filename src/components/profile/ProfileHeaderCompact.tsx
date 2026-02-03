import { MapPin, Crown, Sparkles, Star, ChevronRight } from 'lucide-react';
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
      className="w-full bg-card rounded-2xl border border-border/30 shadow-sm p-4 text-left hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="w-16 h-16 border-2 border-border/30">
          <AvatarImage src={profile.avatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-bold">
            {profile.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h1 className="text-lg font-bold text-foreground">{profile.displayName}</h1>
            <Badge className={`${currentBadge.className} gap-1 px-2 py-0.5 text-xs`}>
              <BadgeIcon className="w-3 h-3" />
              {currentBadge.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          
          {profile.location && (
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
      </div>
    </button>
  );
};

export default ProfileHeaderCompact;
