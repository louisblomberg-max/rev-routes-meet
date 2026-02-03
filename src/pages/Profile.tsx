import { ArrowLeft, MessageCircle, Route, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from '@/components/profile/ProfileHeader';
import GarageSection from '@/components/profile/GarageSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  mockUserProfile, 
  mockActivities, 
  mockFriends, 
  mockClubMemberships 
} from '@/data/profileData';

const Profile = () => {
  const navigate = useNavigate();

  // Filter to only show public vehicles
  const publicVehicles = mockUserProfile.garage.filter(v => v.visibility === 'public');

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

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Profile</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* 1. Profile Header */}
        <ProfileHeader profile={mockUserProfile} />


        {/* 3. Garage (Public Vehicles Only) */}
        {publicVehicles.length > 0 && (
          <GarageSection vehicles={publicVehicles} isOwnProfile={false} />
        )}

        {/* 4. Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Recent Activity
          </h2>
          <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
            {mockActivities.slice(0, 5).map((activity) => {
              const Icon = activityIcons[activity.type] || MessageCircle;
              return (
                <div key={activity.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
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

        {/* 5. Clubs */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Clubs
          </h2>
          <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
            {mockClubMemberships.map((membership) => (
              <button
                key={membership.id}
                onClick={() => navigate(`/club/${membership.clubId}`)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-clubs/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-clubs" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{membership.clubName}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(membership.joinedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Badge 
                  variant={membership.role === 'admin' ? 'default' : 'secondary'}
                  className="text-xs shrink-0"
                >
                  {membership.role === 'admin' ? 'Admin' : 'Member'}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* 6. Friends Preview */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Friends ({acceptedFriends.length})
          </h2>
          <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {acceptedFriends.slice(0, 6).map((friend) => (
                  <Avatar key={friend.id} className="w-10 h-10 border-2 border-background">
                    <AvatarImage src={friend.avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {friend.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View all
              </button>
            </div>
            {acceptedFriends.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                {acceptedFriends.reduce((acc, f) => acc + f.mutualFriends, 0)} mutual connections
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
