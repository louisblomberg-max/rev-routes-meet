import { MapPin, Crown, Sparkles, Star, Calendar, Route, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from '@/data/profileData';

interface ProfileHeaderProps {
  profile: UserProfile;
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  // No plan badges — everyone is a RevNet member

  return (
    <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
      {/* Header with Avatar and Info */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="w-20 h-20 border-2 border-border/30">
            <AvatarImage src={profile.avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-2xl font-bold">
              {profile.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground">{profile.displayName}</h1>
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            
            {profile.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm text-foreground/80 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
              <Calendar className="w-4 h-4 text-events" />
              {profile.stats.eventsAttended}
            </div>
            <p className="text-xs text-muted-foreground">Events</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
              <Route className="w-4 h-4 text-routes" />
              {profile.stats.routesSaved}
            </div>
            <p className="text-xs text-muted-foreground">Routes</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
              <Users className="w-4 h-4 text-clubs" />
              {profile.stats.clubsJoined}
            </div>
            <p className="text-xs text-muted-foreground">Clubs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
