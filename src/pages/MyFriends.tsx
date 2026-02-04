import { useState } from 'react';
import { ArrowLeft, UserPlus, MessageSquare, Users, Check, X, Search, UserX, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Friend, mockFriends } from '@/data/profileData';

// Mock suggested friends for the add flow
const suggestedFriends = [
  { id: 's1', username: 'porsche_paul', displayName: 'Paul Richards', avatar: null, mutualFriends: 12 },
  { id: 's2', username: 'bmw_sarah', displayName: 'Sarah Collins', avatar: null, mutualFriends: 8 },
  { id: 's3', username: 'jdm_legend', displayName: 'Takeshi Yamamoto', avatar: null, mutualFriends: 5 },
  { id: 's4', username: 'track_day_tom', displayName: 'Tom Bennett', avatar: null, mutualFriends: 3 },
];

const MyFriends = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingReceived = friends.filter(f => f.status === 'pending_received');
  const pendingSent = friends.filter(f => f.status === 'pending_sent');

  const filteredFriends = acceptedFriends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestedFriends.filter(friend =>
    friend.displayName.toLowerCase().includes(addSearchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(addSearchQuery.toLowerCase())
  );

  const handleAcceptRequest = (friendId: string) => {
    setFriends(friends.map(f => 
      f.id === friendId ? { ...f, status: 'accepted' as const } : f
    ));
    toast.success('Friend request accepted!');
  };

  const handleDeclineRequest = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
    toast('Request declined');
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
    toast('Friend removed');
  };

  const handleSendRequest = (userId: string, displayName: string) => {
    toast.success(`Friend request sent to ${displayName}`);
  };

  const handleCancelRequest = (friendId: string) => {
    setFriends(friends.filter(f => f.id !== friendId));
    toast('Request cancelled');
  };

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
            <div>
              <h1 className="text-lg font-bold text-foreground">My Friends</h1>
              <p className="text-xs text-muted-foreground">{acceptedFriends.length} friend{acceptedFriends.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => setIsAddOpen(true)}
            className="gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Pending Requests Section */}
        {pendingReceived.length > 0 && (
          <div className="bg-primary/5 rounded-2xl border border-primary/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-primary/10 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary">
                Friend Requests
              </span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {pendingReceived.length}
              </Badge>
            </div>
            <div className="divide-y divide-primary/10">
              {pendingReceived.map((friend) => (
                <div key={friend.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={friend.avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                      {friend.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{friend.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{friend.username} · {friend.mutualFriends} mutual</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeclineRequest(friend.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      className="h-9 px-4"
                      onClick={() => handleAcceptRequest(friend.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Sent Section */}
        {pendingSent.length > 0 && (
          <div className="bg-muted/30 rounded-2xl border border-border/30 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border/30">
              <span className="text-sm font-medium text-muted-foreground">
                Sent Requests ({pendingSent.length})
              </span>
            </div>
            <div className="divide-y divide-border/30">
              {pendingSent.map((friend) => (
                <div key={friend.id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friend.avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {friend.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{friend.displayName}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-xs"
                    onClick={() => handleCancelRequest(friend.id)}
                  >
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Friends */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-muted/50 border-border/50"
          />
        </div>

        {/* Friends List */}
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
          {filteredFriends.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              {searchQuery ? (
                <>
                  <h3 className="font-semibold text-foreground mb-1">No results</h3>
                  <p className="text-sm text-muted-foreground">No friends match "{searchQuery}"</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-foreground mb-1">No friends yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start connecting with other enthusiasts</p>
                  <Button onClick={() => setIsAddOpen(true)} className="gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    Find Friends
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={friend.avatar || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                      {friend.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{friend.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-9 w-9"
                      onClick={() => navigate('/messages')}
                    >
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-9 w-9">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveFriend(friend.id)}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Remove Friend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader className="pb-4 border-b border-border/30">
            <SheetTitle className="text-lg font-bold">Find Friends</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(80vh-100px)]">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or name..."
                value={addSearchQuery}
                onChange={(e) => setAddSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Tabs for Suggested vs Search Results */}
            <Tabs defaultValue="suggested" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="suggested">Suggested</TabsTrigger>
                <TabsTrigger value="search">Search</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggested" className="mt-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground px-1">People you might know</p>
                  <div className="bg-card rounded-xl border border-border/30 overflow-hidden divide-y divide-border/30">
                    {suggestedFriends.map((person) => (
                      <div key={person.id} className="flex items-center gap-3 px-4 py-3">
                        <Avatar className="w-11 h-11">
                          <AvatarImage src={person.avatar || undefined} />
                          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                            {person.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{person.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{person.username} · {person.mutualFriends} mutual</p>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => handleSendRequest(person.id, person.displayName)}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="mt-4">
                {addSearchQuery.trim() === '' ? (
                  <div className="text-center py-8">
                    <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Enter a name or username to search</p>
                  </div>
                ) : filteredSuggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <UserX className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No users found for "{addSearchQuery}"</p>
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border/30 overflow-hidden divide-y divide-border/30">
                    {filteredSuggestions.map((person) => (
                      <div key={person.id} className="flex items-center gap-3 px-4 py-3">
                        <Avatar className="w-11 h-11">
                          <AvatarImage src={person.avatar || undefined} />
                          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                            {person.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{person.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{person.username}</p>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => handleSendRequest(person.id, person.displayName)}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyFriends;