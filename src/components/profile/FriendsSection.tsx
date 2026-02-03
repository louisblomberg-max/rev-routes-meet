import { UserPlus, MessageSquare, Users, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Friend } from '@/data/profileData';

interface FriendsSectionProps {
  friends: Friend[];
  isOwnProfile?: boolean;
}

const FriendsSection = ({ friends, isOwnProfile = true }: FriendsSectionProps) => {
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => f.status === 'pending_received');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Friends ({acceptedFriends.length})
        </h2>
        {isOwnProfile && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            <UserPlus className="w-3 h-3" />
            Add Friend
          </Button>
        )}
      </div>

      {/* Pending Requests */}
      {isOwnProfile && pendingRequests.length > 0 && (
        <div className="bg-events/5 rounded-2xl border border-events/20 overflow-hidden">
          <div className="px-4 py-2 border-b border-events/10">
            <span className="text-xs font-medium text-events">
              {pendingRequests.length} pending request{pendingRequests.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="divide-y divide-events/10">
            {pendingRequests.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={friend.avatar || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {friend.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{friend.displayName}</p>
                  <p className="text-xs text-muted-foreground">{friend.mutualFriends} mutual friends</p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="h-8 w-8 bg-events hover:bg-events/90">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
        {acceptedFriends.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No friends yet</p>
          </div>
        ) : (
          acceptedFriends.slice(0, 4).map((friend) => (
            <button
              key={friend.id}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={friend.avatar || undefined} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {friend.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{friend.displayName}</p>
                <p className="text-xs text-muted-foreground">@{friend.username}</p>
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              </Button>
            </button>
          ))
        )}
        
        {acceptedFriends.length > 4 && (
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
            View all {acceptedFriends.length} friends
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendsSection;
