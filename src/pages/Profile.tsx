import { ArrowLeft, MessageCircle, Route, Calendar, Users, Share2, MoreHorizontal, MapPin, Crown, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GarageSection from '@/components/profile/GarageSection';
import AchievementsSection from '@/components/profile/AchievementsSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  mockUserProfile, 
  mockActivities, 
  mockFriends, 
  mockClubMemberships 
} from '@/data/profileData';

const Profile = () => {
  const navigate = useNavigate();
  const profile = mockUserProfile;

  // Filter to only show public vehicles
  const publicVehicles = profile.garage.filter(v => v.visibility === 'public');

  // Filter accepted friends only
  const acceptedFriends = mockFriends.filter(f => f.status === 'accepted');

  const activityIcons = {
    event_attended: Calendar,
    event_hosted: Calendar,
    route_created: Route,
    route_saved: Route,
    forum_post: MessageCircle,
    forum_reply: MessageCircle,
    club_post: Users,
    listing: MessageCircle,
  };

  const activityColors = {
    event_attended: 'text-events',
    event_hosted: 'text-events',
    route_created: 'text-routes',
    route_saved: 'text-routes',
    forum_post: 'text-muted-foreground',
    forum_reply: 'text-muted-foreground',
    club_post: 'text-clubs',
    listing: 'text-services',
  };

  const planBadge = {
    free: { label: 'Free', icon: Sparkles, className: 'bg-muted text-muted-foreground' },
    enthusiast: { label: 'Enthusiast', icon: Crown, className: 'bg-gradient-to-r from-events to-primary text-primary-foreground' },
    pro: { label: 'Pro', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground' },
  };

  const currentBadge = planBadge[profile.plan];
  const BadgeIcon = currentBadge.icon;

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
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
              <Share2 className="w-4 h-4 text-foreground" />
            </button>
            <button className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
              <MoreHorizontal className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-8">
        {/* Profile Hero */}
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
          {/* Gradient Banner */}
          <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          
          {/* Avatar & Info */}
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end gap-4">
              <Avatar className="w-20 h-20 ring-4 ring-card border-2 border-primary/20">
                <AvatarImage src={profile.avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-2xl font-bold">
                  {profile.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-1">
                <Badge className={`${currentBadge.className} gap-1 px-2 py-0.5 text-xs`}>
                  <BadgeIcon className="w-3 h-3" />
                  {currentBadge.label}
                </Badge>
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-xl font-bold text-foreground">{profile.displayName}</h2>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              {profile.location && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </div>
              )}
            </div>

            {profile.bio && (
              <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Stats Row */}
            <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-2">
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-events" />
                  <span className="text-lg font-bold text-foreground">{profile.stats.eventsAttended}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Events</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Route className="w-4 h-4 text-routes" />
                  <span className="text-lg font-bold text-foreground">{profile.stats.routesSaved}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Routes</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-clubs" />
                  <span className="text-lg font-bold text-foreground">{profile.stats.clubsJoined}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Clubs</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" size="sm">
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Message
              </Button>
              <Button variant="outline" className="flex-1" size="sm">
                <Users className="w-4 h-4 mr-1.5" />
                Add Friend
              </Button>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <AchievementsSection achievements={profile.achievements} />

        {/* Garage (Public Vehicles Only) */}
        {publicVehicles.length > 0 && (
          <GarageSection vehicles={publicVehicles} isOwnProfile={false} />
        )}

        {/* Clubs */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Clubs ({mockClubMemberships.length})
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {mockClubMemberships.map((membership) => (
              <button
                key={membership.id}
                onClick={() => navigate(`/club/${membership.clubId}`)}
                className="flex-shrink-0 bg-card rounded-xl border border-border/30 shadow-sm p-3 hover:shadow-md hover:border-border/50 transition-all active:scale-[0.98] min-w-[140px]"
              >
                <div className="w-10 h-10 rounded-lg bg-clubs/10 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-clubs" />
                </div>
                <p className="text-sm font-medium text-foreground truncate">{membership.clubName}</p>
                <Badge 
                  variant={membership.role === 'admin' ? 'default' : 'secondary'}
                  className="text-[10px] mt-1.5 px-1.5 py-0"
                >
                  {membership.role === 'admin' ? 'Admin' : 'Member'}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Recent Activity
          </h2>
          <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/20">
            {mockActivities.slice(0, 4).map((activity) => {
              const Icon = activityIcons[activity.type] || MessageCircle;
              const colorClass = activityColors[activity.type] || 'text-muted-foreground';
              return (
                <div key={activity.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Friends Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Friends ({acceptedFriends.length})
            </h2>
            <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              View all
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {acceptedFriends.slice(0, 5).map((friend) => (
                  <Avatar key={friend.id} className="w-10 h-10 border-2 border-card ring-1 ring-border/20">
                    <AvatarImage src={friend.avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {friend.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {acceptedFriends.length > 5 && (
                  <div className="w-10 h-10 rounded-full border-2 border-card ring-1 ring-border/20 bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">+{acceptedFriends.length - 5}</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {acceptedFriends.slice(0, 2).map(f => f.displayName.split(' ')[0]).join(', ')}
                  {acceptedFriends.length > 2 && ` +${acceptedFriends.length - 2} more`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {acceptedFriends.reduce((acc, f) => acc + f.mutualFriends, 0)} mutual connections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
