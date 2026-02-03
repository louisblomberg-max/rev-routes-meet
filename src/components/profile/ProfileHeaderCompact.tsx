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
      className="w-full bg-card rounded-xl border border-border/30 shadow-sm p-4 text-left hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <Avatar className="w-14 h-14 border-2 border-border/30">
          <AvatarImage src={profile.avatar || undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xl font-bold">
            {profile.displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">{profile.displayName}</h1>
            <Badge className={`${currentBadge.className} gap-0.5 px-1.5 py-0.5 text-[10px]`}>
              <BadgeIcon className="w-3 h-3" />
              {currentBadge.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
            <span>@{profile.username}</span>
            {profile.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </span>
              </>
            )}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
      </div>
    </button>
  );
};

export default ProfileHeaderCompact;
