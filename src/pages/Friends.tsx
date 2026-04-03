import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserMinus, Check, X, Users, UserPlus, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FriendRow {
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  profile: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  vehicle?: { make: string; model: string; year: string | null } | null;
}

const Friends = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [requests, setRequests] = useState<FriendRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    // Accepted friends - query both directions
    const [sentRes, receivedRes] = await Promise.all([
      supabase.from('friends').select('user_id, friend_id, status, created_at').eq('user_id', user.id).eq('status', 'accepted'),
      supabase.from('friends').select('user_id, friend_id, status, created_at').eq('friend_id', user.id).eq('status', 'accepted'),
    ]);

    const allFriendRows = [...(sentRes.data || []), ...(receivedRes.data || [])];
    const friendIds = allFriendRows.map(r => r.user_id === user.id ? r.friend_id : r.user_id);

    let friendsList: FriendRow[] = [];
    if (friendIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, display_name, username, avatar_url').in('id', friendIds);
      const { data: vehicles } = await supabase.from('vehicles' as any).select('user_id, make, model, year, is_primary').in('user_id', friendIds).eq('is_primary', true);

      friendsList = allFriendRows.map(r => {
        const otherId = r.user_id === user.id ? r.friend_id : r.user_id;
        const profile = profiles?.find((p: any) => p.id === otherId);
        const vehicle = (vehicles as any[])?.find((v: any) => v.user_id === otherId);
        return { ...r, profile: profile || { id: otherId, display_name: null, username: null, avatar_url: null }, vehicle: vehicle || null };
      });
    }
    setFriends(friendsList);

    // Incoming requests
    const { data: reqData } = await supabase.from('friends').select('user_id, friend_id, status, created_at').eq('friend_id', user.id).eq('status', 'pending');
    const reqIds = (reqData || []).map(r => r.user_id);
    let requestsList: FriendRow[] = [];
    if (reqIds.length > 0) {
      const { data: reqProfiles } = await supabase.from('profiles').select('id, display_name, username, avatar_url').in('id', reqIds);
      requestsList = (reqData || []).map(r => {
        const profile = reqProfiles?.find((p: any) => p.id === r.user_id);
        return { ...r, profile: profile || { id: r.user_id, display_name: null, username: null, avatar_url: null } };
      });
    }
    setRequests(requestsList);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRemoveFriend = async (friendRow: FriendRow) => {
    const otherId = friendRow.profile.id;
    setRemovingId(otherId);
    // Delete the friendship row (RLS allows if user_id or friend_id matches)
    await supabase.from('friends').delete().eq('user_id', friendRow.user_id).eq('friend_id', friendRow.friend_id);
    setFriends(prev => prev.filter(f => f.profile.id !== otherId));
    setRemovingId(null);
    toast.success('Friend removed');
  };

  const handleAccept = async (req: FriendRow) => {
    await supabase.from('friends').update({ status: 'accepted' }).eq('user_id', req.user_id).eq('friend_id', req.friend_id);
    setRequests(prev => prev.filter(r => r.user_id !== req.user_id));
    toast.success('Friend request accepted');
    fetchAll();
  };

  const handleDecline = async (req: FriendRow) => {
    await supabase.from('friends').delete().eq('user_id', req.user_id).eq('friend_id', req.friend_id);
    setRequests(prev => prev.filter(r => r.user_id !== req.user_id));
    toast('Request declined');
  };

  const filteredFriends = friends.filter(f => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (f.profile.display_name?.toLowerCase().includes(q) || f.profile.username?.toLowerCase().includes(q));
  });

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 safe-top border-b border-border/50">
        <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" />
        <h1 className="heading-md text-foreground flex-1">Friends</h1>
      </div>

      <Tabs defaultValue="friends" className="px-4 pt-4">
        <TabsList className="w-full">
          <TabsTrigger value="friends" className="flex-1">Friends</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 gap-1.5">
            Requests
            {requests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px]">{requests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search friends..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3"><Skeleton className="w-11 h-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div>
              ))}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">{search ? 'No matches' : 'No friends yet'}</p>
              <p className="text-sm text-muted-foreground max-w-[220px]">
                {search ? 'Try a different search term.' : 'Find people in the Community tab and send friend requests.'}
              </p>
              {!search && (
                <Button variant="outline" className="mt-4" onClick={() => navigate('/community')}>
                  <UserPlus className="w-4 h-4 mr-1.5" /> Find Friends
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFriends.map(f => {
                const name = f.profile.display_name || f.profile.username || 'User';
                return (
                  <div key={f.profile.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <button onClick={() => navigate(`/profile/${f.profile.id}`)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={f.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                        {f.profile.username && <p className="text-xs text-muted-foreground">@{f.profile.username}</p>}
                        {f.vehicle && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{f.vehicle.year ? `${f.vehicle.year} ` : ''}{f.vehicle.make} {f.vehicle.model}</p>}
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={removingId === f.profile.id}
                      onClick={() => {
                        if (confirm('Remove this friend?')) handleRemoveFriend(f);
                      }}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 p-3"><Skeleton className="w-11 h-11 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <Bell className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">No pending requests</p>
              <p className="text-sm text-muted-foreground max-w-[220px]">When someone sends you a friend request, it'll appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map(r => {
                const name = r.profile.display_name || r.profile.username || 'User';
                return (
                  <div key={r.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
                    <button onClick={() => navigate(`/profile/${r.profile.id}`)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <Avatar className="w-11 h-11">
                        <AvatarImage src={r.profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                        {r.profile.username && <p className="text-xs text-muted-foreground">@{r.profile.username}</p>}
                      </div>
                    </button>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="gap-1" onClick={() => handleAccept(r)}><Check className="w-3.5 h-3.5" /> Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDecline(r)}><X className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
