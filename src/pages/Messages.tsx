import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ConvDisplay {
  conversationId: string;
  otherUserId: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConvDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendPickerOpen, setFriendPickerOpen] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    // Get all conversations I'm part of
    const { data: myParts, error: myPartsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);
    if (myPartsError) { toast.error('Failed to load conversations'); setIsLoading(false); return; }

    const convIds = (myParts || []).map(r => r.conversation_id);
    if (convIds.length === 0) { setConversations([]); setIsLoading(false); return; }

    // Get other participants for each conversation
    const { data: allParts, error: allPartsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', convIds)
      .neq('user_id', user.id);
    if (allPartsError) { toast.error('Failed to load participants'); setIsLoading(false); return; }

    // Get unique other user IDs
    const otherUserMap: Record<string, string> = {};
    (allParts || []).forEach(p => { otherUserMap[p.conversation_id] = p.user_id; });

    const otherUserIds = [...new Set(Object.values(otherUserMap))];
    if (otherUserIds.length === 0) { setConversations([]); setIsLoading(false); return; }

    // Fetch profiles for other users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', otherUserIds);
    if (profilesError) { toast.error('Failed to load profiles'); setIsLoading(false); return; }
    const profileMap: Record<string, any> = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p; });

    // Fetch last message and unread count for each conversation
    const convDisplays: ConvDisplay[] = [];
    for (const convId of convIds) {
      const otherId = otherUserMap[convId];
      if (!otherId) continue;
      const profile = profileMap[otherId];

      const { data: lastMsgs, error: lastMsgsError } = await supabase
        .from('messages')
        .select('content, created_at, sender_id, read_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (lastMsgsError) { toast.error('Failed to load messages'); continue; }

      const lastMsg = lastMsgs?.[0];

      // Count unread messages from the other user
      const { count: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user.id)
        .is('read_at', null);
      if (unreadError) { toast.error('Failed to count unread messages'); continue; }

      convDisplays.push({
        conversationId: convId,
        otherUserId: otherId,
        name: profile?.display_name || profile?.username || 'User',
        username: profile?.username,
        avatarUrl: profile?.avatar_url,
        lastMessage: lastMsg?.content ? (lastMsg.content.length > 40 ? lastMsg.content.slice(0, 40) + '…' : lastMsg.content) : 'No messages yet',
        lastMessageTime: lastMsg?.created_at || null,
        unreadCount: unreadCount || 0,
      });
    }

    // Sort: unread first, then by time
    convDisplays.sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });

    setConversations(convDisplays);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Realtime: refresh list on any new message.
  // Intentionally listens to all message inserts and refetches all conversations,
  // since we can't easily filter by a dynamic set of conversation IDs in a
  // single realtime subscription. The refetch is cheap and keeps the list accurate.
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel('messages-list-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' },
        () => { fetchConversations(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchConversations]);

  const fetchFriends = async () => {
    if (!user?.id) return;
    const [sentRes, receivedRes] = await Promise.all([
      supabase.from('friends').select('friend_id').eq('user_id', user.id).eq('status', 'accepted'),
      supabase.from('friends').select('user_id').eq('friend_id', user.id).eq('status', 'accepted'),
    ]);
    if (sentRes.error || receivedRes.error) { toast.error('Failed to load friends'); return; }
    const friendIds = [
      ...(sentRes.data || []).map(r => r.friend_id),
      ...(receivedRes.data || []).map(r => r.user_id),
    ];
    if (friendIds.length === 0) { setFriends([]); return; }
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', friendIds);
    if (profilesErr) { toast.error('Failed to load friend profiles'); return; }
    setFriends(profiles || []);
  };

  const handleOpenFriendPicker = () => {
    fetchFriends();
    setFriendPickerOpen(true);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton className="w-10 h-10 rounded-full bg-card" />
          <h1 className="text-xl font-bold text-foreground flex-1">Messages</h1>
          <button onClick={handleOpenFriendPicker} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50 border-0 h-10 rounded-xl" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="divide-y divide-border/30">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
            </div>
          ))}
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            {searchQuery ? 'No conversations found' : 'No messages yet'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            {searchQuery ? 'Try a different search.' : 'Tap + to start a conversation with a friend.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {filteredConversations.map(conv => (
            <button
              key={conv.conversationId}
              onClick={() => navigate(`/messages/${conv.otherUserId}`)}
              className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/30 transition-colors"
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conv.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {conv.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>
                    {conv.name}
                  </span>
                  {conv.lastMessageTime && (
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">
                      {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: true })}
                    </span>
                  )}
                </div>
                <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground h-5 min-w-[20px] px-1.5 text-[10px] shrink-0">
                  {conv.unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Friend Picker Sheet */}
      <Sheet open={friendPickerOpen} onOpenChange={setFriendPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[70vh]">
          <SheetHeader>
            <SheetTitle>New Message</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-1 overflow-y-auto max-h-[50vh]">
            {friends.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No friends yet. Add friends from the Community tab.</p>
            ) : (
              friends.map(f => {
                const name = f.display_name || f.username || 'User';
                return (
                  <button
                    key={f.id}
                    onClick={() => { setFriendPickerOpen(false); navigate(`/messages/${f.id}`); }}
                    className="flex items-center gap-3 p-3 rounded-xl w-full text-left hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={f.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">{name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      {f.username && <p className="text-xs text-muted-foreground">@{f.username}</p>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Messages;
