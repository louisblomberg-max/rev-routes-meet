import { useState, useEffect } from 'react';
import { Search, MoreVertical, Plus, Users, Pin, BellOff, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import NewConversationSheet from '@/components/messages/NewConversationSheet';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ConvDisplay {
  id: string; name: string; lastMessage: string; time: string; unread: boolean;
  isGroup: boolean; isPinned: boolean; isMuted: boolean;
}

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConvDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const fetchConversations = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    const { data: participantRows, error: err } = await supabase
      .from('conversation_participants').select('conversation_id').eq('user_id', user.id);
    if (err) { setError(err.message); setIsLoading(false); return; }
    const convIds = (participantRows || []).map((r: any) => r.conversation_id);
    if (convIds.length === 0) { setConversations([]); setIsLoading(false); return; }

    const { data: convs } = await supabase.from('conversations').select('*').in('id', convIds);
    const convDisplays: ConvDisplay[] = [];
    for (const conv of (convs || [])) {
      const { data: msgs } = await supabase.from('messages').select('content, created_at, sender_id, read_at')
        .eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1);
      const lastMsg = msgs?.[0];
      convDisplays.push({
        id: conv.id, name: conv.name || 'Conversation',
        lastMessage: lastMsg?.content || 'No messages yet',
        time: lastMsg?.created_at ? formatDistanceToNow(new Date(lastMsg.created_at), { addSuffix: true }) : '',
        unread: lastMsg ? lastMsg.sender_id !== user.id && !lastMsg.read_at : false,
        isGroup: conv.type === 'group', isPinned: false, isMuted: false,
      });
    }
    convDisplays.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0));
    setConversations(convDisplays);
    setIsLoading(false);
  };

  useEffect(() => { fetchConversations(); }, [user?.id]);

  const handleCreateConversation = async (selectedUsers: { id: string; name: string; username: string }[], groupName?: string) => {
    if (!user?.id) return;
    // Check for existing direct conversation
    if (selectedUsers.length === 1) {
      const { data: myConvs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
      const { data: theirConvs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', selectedUsers[0].id);
      const myIds = new Set((myConvs || []).map((r: any) => r.conversation_id));
      const shared = (theirConvs || []).find((r: any) => myIds.has(r.conversation_id));
      if (shared) { navigate(`/messages/${shared.conversation_id}`); return; }
    }
    const isGroup = selectedUsers.length > 1;
    const name = groupName || (isGroup ? selectedUsers.map(u => u.name.split(' ')[0]).join(', ') : selectedUsers[0].name);
    const { data: conv } = await supabase.from('conversations').insert({ name, type: isGroup ? 'group' : 'direct' }).select().single();
    if (!conv) return;
    // Add self directly (RLS allows inserting own user_id)
    await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: user.id });
    // Add other participants via Edge Function (service role bypasses RLS)
    for (const u of selectedUsers) {
      await supabase.functions.invoke('add-conversation-participant', {
        body: { conversation_id: conv.id, participant_user_id: u.id },
      });
    }
    navigate(`/messages/${conv.id}`);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) || conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton className="w-10 h-10 rounded-full bg-card" />
          <h1 className="text-xl font-bold text-foreground flex-1">Messages</h1>
          <button onClick={() => setIsNewConversationOpen(true)} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"><Plus className="w-5 h-5 text-primary-foreground" /></button>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50 border-0 h-10 rounded-xl" />
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
      ) : error ? (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
          <p className="font-semibold text-foreground mb-1">Something went wrong</p>
          <Button variant="outline" onClick={fetchConversations} className="mt-3">Retry</Button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/30">
            {filteredConversations.map((conversation) => (
              <div key={conversation.id} className={`flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors`}>
                <button onClick={() => navigate(`/messages/${conversation.id}`)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className={`font-semibold ${conversation.isGroup ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}`}>
                        {conversation.isGroup ? <Users className="w-5 h-5" /> : conversation.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.unread && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold text-foreground truncate ${conversation.unread ? '' : 'font-medium'}`}>{conversation.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{conversation.time}</span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${conversation.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{conversation.lastMessage}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div>
              <h3 className="font-semibold text-foreground mb-1">No conversations found</h3>
              <p className="text-sm text-muted-foreground">Start a new conversation</p>
            </div>
          )}
        </>
      )}
      <NewConversationSheet open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen} onCreateConversation={handleCreateConversation} />
    </div>
  );
};

export default Messages;
