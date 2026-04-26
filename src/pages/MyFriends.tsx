import { useState } from 'react';
import { UserPlus, MessageSquare, Users, Check, X, Search, UserX, MoreHorizontal } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useUserFriends } from '@/hooks/useProfileData';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { sendNotification } from '@/utils/sendNotification';

const MyFriends = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { accepted, pendingReceived, pendingSent, isLoading } = useUserFriends();
  const { friends: friendsRepo } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'requests'>('all');
  const [findQuery, setFindQuery] = useState('');
  const [findResults, setFindResults] = useState<any[]>([]);
  const [findLoading, setFindLoading] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const handleFindSearch = async (q: string) => {
    setFindQuery(q);
    if (q.length < 2) { setFindResults([]); return; }
    setFindLoading(true);
    const { data } = await supabase.from('profiles')
      .select('id, display_name, username, avatar_url')
      .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
      .neq('id', authUser?.id || '')
      .limit(10);
    setFindResults(data || []);
    setFindLoading(false);
  };

  const handleSendRequest = async (targetId: string, name: string) => {
    if (!authUser?.id || sentIds.has(targetId)) return;
    const { error } = await supabase.from('friends').insert({ user_id: authUser.id, friend_id: targetId, status: 'pending' });
    if (error) { toast.error('Could not send request'); return; }
    setSentIds(prev => new Set(prev).add(targetId));
    toast.success(`Request sent to ${name}`);
    await sendNotification({
      userId: targetId,
      title: '👋 New Friend Request',
      body: `${authUser?.displayName || 'Someone'} wants to be your friend`,
      type: 'friend_request',
      data: { user_id: authUser.id },
    });
  };

  const filteredFriends = accepted.filter(f =>
    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAccept = async (id: string) => {
    friendsRepo.acceptRequest(id);
    toast.success('Friend request accepted!');
    // Find the requester to notify them
    const req = pendingReceived.find(f => f.id === id);
    if (req && authUser?.id) {
      sendNotification({ userId: req.id, title: '✅ Friend Request Accepted', body: `${authUser.displayName || 'Someone'} accepted your friend request`, type: 'friend_accepted', data: { user_id: authUser.id } });
    }
  };
  const handleDecline = (id: string) => { friendsRepo.removeFriend(id); toast('Request declined'); };
  const handleRemove = (id: string) => { friendsRepo.removeFriend(id); toast('Friend removed'); };

  const filters = [
    { id: 'all' as const, label: 'All', count: accepted.length },
    { id: 'requests' as const, label: 'Requests', count: pendingReceived.length },
  ];

  return (
    <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-[#FAFAFA] border-b-2 border-[#E5E5E5] safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'community'); navigate('/'); }} />
            <div>
              <h1 className="text-lg font-bold text-foreground">My Friends</h1>
              <p className="text-xs text-muted-foreground">{accepted.length} friend{accepted.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 rounded-lg"><UserPlus className="w-4 h-4" /> Add</Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Filter chips */}
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${activeFilter === f.id ? 'bg-foreground text-background border-foreground' : 'bg-card text-foreground border-border/50 hover:border-border'}`}>
              {f.label} {f.count > 0 && `(${f.count})`}
            </button>
          ))}
        </div>

        {/* Search */}
        {activeFilter === 'all' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search friends..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11 bg-card border-border/50" />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Requests */}
            {activeFilter === 'requests' && pendingReceived.length > 0 && (
              <div className="bg-primary/5 rounded-2xl border border-primary/20 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-primary/10 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Friend Requests</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{pendingReceived.length}</Badge>
                </div>
                <div className="divide-y divide-primary/10">
                  {pendingReceived.map(friend => (
                    <div key={friend.id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="w-12 h-12"><AvatarFallback className="bg-muted text-muted-foreground font-semibold">{friend.displayName.charAt(0)}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{friend.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{friend.username} · {friend.mutualFriends} mutual</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-destructive" onClick={() => handleDecline(friend.id)}><X className="w-4 h-4" /></Button>
                        <Button size="sm" className="h-9 px-4" onClick={() => handleAccept(friend.id)}><Check className="w-4 h-4 mr-1" /> Accept</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeFilter === 'requests' && pendingReceived.length === 0 && (
              <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No pending requests</h3>
                <p className="text-sm text-muted-foreground">Friend requests will appear here</p>
              </div>
            )}

            {/* Friends list */}
            {activeFilter === 'all' && (
              <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                {filteredFriends.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">{searchQuery ? 'No results' : 'No friends yet'}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{searchQuery ? `No friends match "${searchQuery}"` : 'Start connecting with other enthusiasts'}</p>
                    {!searchQuery && <Button onClick={() => setIsAddOpen(true)} className="gap-1.5"><UserPlus className="w-4 h-4" /> Find Friends</Button>}
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {filteredFriends.map(friend => (
                      <div key={friend.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors">
                        <Avatar className="w-12 h-12"><AvatarFallback className="bg-muted text-muted-foreground font-semibold">{friend.displayName.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{friend.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{friend.username} · {friend.mutualFriends} mutual</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => navigate(`/messages/${friend.id}`)}><MessageSquare className="w-4 h-4 text-muted-foreground" /></Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-9 w-9"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/profile/${friend.id}`)}>View Profile</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleRemove(friend.id)}>
                                <UserX className="w-4 h-4 mr-2" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Friend Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader className="pb-4 border-b border-border/30"><SheetTitle className="text-lg font-bold">Find Friends</SheetTitle></SheetHeader>
          <div className="py-4 space-y-4 overflow-y-auto max-h-[calc(80vh-100px)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by username or name..." className="pl-10 h-11" value={findQuery} onChange={e => handleFindSearch(e.target.value)} />
            </div>
            {findLoading && <p className="text-xs text-muted-foreground px-1">Searching...</p>}
            {findResults.length === 0 && findQuery.length >= 2 && !findLoading && (
              <p className="text-xs text-muted-foreground px-1">No users found</p>
            )}
            {findResults.length === 0 && findQuery.length < 2 && (
              <p className="text-xs text-muted-foreground px-1">Type at least 2 characters to search</p>
            )}
            {findResults.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/30">
                {findResults.map(person => {
                  const alreadyFriend = accepted.some(f => f.id === person.id);
                  const alreadySent = pendingSent.some(f => f.id === person.id) || sentIds.has(person.id);
                  return (
                    <div key={person.id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar className="w-11 h-11">
                        {person.avatar_url ? <AvatarImage src={person.avatar_url} /> : null}
                        <AvatarFallback className="bg-muted text-muted-foreground font-semibold">{(person.display_name || '?')[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{person.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{person.username || '—'}</p>
                      </div>
                      {alreadyFriend ? (
                        <Badge variant="outline" className="text-xs">Friends</Badge>
                      ) : alreadySent ? (
                        <Badge variant="outline" className="text-xs">Sent</Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleSendRequest(person.id, person.display_name)}>
                          <UserPlus className="w-3.5 h-3.5" /> Add
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MyFriends;
