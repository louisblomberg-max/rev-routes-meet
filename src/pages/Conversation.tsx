import { Send, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef, useCallback } from 'react';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { toast } from 'sonner';

const Conversation = () => {
  const navigate = useNavigate();
  const { id: otherUserId } = useParams();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // Find or create conversation with this user
  const findOrCreateConversation = useCallback(async (): Promise<string | null> => {
    if (!user?.id || !otherUserId) return null;

    // Find shared conversation
    const { data: myConvs, error: myConvsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);
    if (myConvsError) { toast.error('Failed to load conversations'); return null; }

    const { data: theirConvs, error: theirConvsError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', otherUserId);
    if (theirConvsError) { toast.error('Failed to load conversations'); return null; }

    const myIds = new Set((myConvs || []).map(r => r.conversation_id));
    const shared = (theirConvs || []).find(r => myIds.has(r.conversation_id));

    if (shared) return shared.conversation_id;

    // No shared conversation exists — we'll create on first send
    return null;
  }, [user?.id, otherUserId]);

  const fetchData = useCallback(async () => {
    if (!user?.id || !otherUserId) return;
    setIsLoading(true);

    // Fetch other user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .eq('id', otherUserId)
      .single();
    if (profileError) { toast.error('Failed to load user profile'); setIsLoading(false); return; }
    setOtherProfile(profile);

    // Find existing conversation
    const convId = await findOrCreateConversation();
    setConversationId(convId);

    if (convId) {
      // Load messages
      const { data: msgs, error: msgsError } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at, read_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });
      if (msgsError) { toast.error('Failed to load messages'); setIsLoading(false); return; }
      setMessages(msgs || []);

      // Mark messages from other user as read
      const { error: readError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .eq('sender_id', otherUserId)
        .is('read_at', null);
      if (readError) { toast.error('Failed to mark messages as read'); }
    }

    setIsLoading(false);
    scrollToBottom();
  }, [user?.id, otherUserId, findOrCreateConversation, scrollToBottom]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase.channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        setMessages(prev => {
          // Deduplicate: don't append if message already exists (e.g. from optimistic insert)
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        // Mark as read if from other user
        if (payload.new.sender_id !== user?.id) {
          const { error } = await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', payload.new.id);
          if (error) toast.error('Failed to mark message as read');
        }
        scrollToBottom();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user?.id, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || !otherUserId) return;
    const content = newMessage.trim();

    let activeConvId = conversationId;

    // Create conversation if first message
    if (!activeConvId) {
      const name = otherProfile?.display_name || otherProfile?.username || 'Chat';
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .insert({ name, type: 'direct' })
        .select('id')
        .single();
      if (convError || !conv) { toast.error('Failed to create conversation'); return; }

      // Add self as participant
      const { error: selfPartError } = await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: user.id });
      if (selfPartError) { toast.error('Failed to join conversation'); return; }

      // Add other user as participant
      const { error: addPartError } = await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: otherUserId });
      if (addPartError) { toast.error('Failed to add participant'); return; }

      activeConvId = conv.id;
      setConversationId(conv.id);
    }

    const { error: sendError } = await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: user.id,
      content,
    });
    if (sendError) { toast.error('Failed to send message'); return; }
    setNewMessage('');
  };

  const formatDateSeparator = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, d MMMM yyyy');
  };

  const displayName = otherProfile?.display_name || otherProfile?.username || 'User';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <BackButton className="w-10 h-10 rounded-full bg-card" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className={`h-10 ${i % 2 === 0 ? 'w-3/4 ml-auto' : 'w-3/4'}`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton className="w-10 h-10 rounded-full bg-card" />
          <button onClick={() => navigate(`/profile/${otherUserId}`)} className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="font-semibold text-foreground truncate text-sm">{displayName}</h1>
              {otherProfile?.username && <p className="text-[11px] text-muted-foreground">@{otherProfile.username}</p>}
            </div>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Avatar className="w-16 h-16 mb-4">
              <AvatarImage src={otherProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-foreground mb-1">{displayName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> Start a conversation
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user?.id;
            const msgDate = new Date(msg.created_at);
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showDateSep = !prevMsg || !isSameDay(new Date(prevMsg.created_at), msgDate);

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[11px] text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? 'bg-[hsl(var(--primary))] text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {format(msgDate, 'HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 p-3 safe-bottom">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            className="flex-1 bg-muted/50 border-0 rounded-full h-10"
          />
          <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()} className="rounded-full h-10 w-10">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
