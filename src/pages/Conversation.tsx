import { Send, Image, MoreVertical, Users, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useRef } from 'react';
import ChatSettingsSheet from '@/components/messages/ChatSettingsSheet';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const Conversation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!id || !user?.id) return;
    setIsLoading(true);
    setError(null);
    const [convRes, msgsRes] = await Promise.all([
      supabase.from('conversations').select('*').eq('id', id).single(),
      supabase.from('messages').select('*, profiles(username, display_name)').eq('conversation_id', id).order('created_at'),
    ]);
    if (convRes.error) { setError(convRes.error.message); setIsLoading(false); return; }
    setConversation(convRes.data);
    setMessages(msgsRes.data || []);
    // Mark messages as read
    await supabase.from('messages').update({ read_at: new Date().toISOString() })
      .eq('conversation_id', id).neq('sender_id', user.id).is('read_at', null);
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [id, user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`messages:${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => { setMessages(prev => [...prev, payload.new]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || !id) return;
    const content = newMessage.trim();
    setNewMessage('');
    await supabase.from('messages').insert({ conversation_id: id, sender_id: user.id, content });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3"><BackButton className="w-10 h-10 rounded-full bg-card" /><Skeleton className="h-6 w-32" /></div>
        </div>
        <div className="flex-1 p-4 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-3/4" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3 px-4 py-3"><BackButton className="w-10 h-10 rounded-full bg-card" /><h1 className="font-semibold text-foreground">Conversation</h1></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
          <p className="font-semibold text-foreground mb-1">Something went wrong</p>
          <Button variant="outline" onClick={fetchData} className="mt-3">Retry</Button>
        </div>
      </div>
    );
  }

  const chatName = conversation?.name || 'Conversation';
  const isGroup = conversation?.type === 'group';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton className="w-10 h-10 rounded-full bg-card" />
          <Avatar className="w-10 h-10">
            <AvatarFallback className={`font-semibold text-sm ${isGroup ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}`}>
              {isGroup ? <Users className="w-4 h-4" /> : chatName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0"><h1 className="font-semibold text-foreground truncate">{chatName}</h1></div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-muted-foreground hover:text-foreground"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => {
          const isMe = message.sender_id === user?.id;
          return (
            <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {message.created_at ? formatDistanceToNow(new Date(message.created_at), { addSuffix: true }) : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="sticky bottom-0 bg-background border-t border-border/50 p-3">
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground"><Image className="w-5 h-5" /></button>
          <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-muted/50 border-0 rounded-full h-10" />
          <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()} className="rounded-full h-10 w-10"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
      <ChatSettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} chatName={chatName} isGroup={isGroup}
        participants={[]} isMuted={false} onRename={() => {}} onToggleMute={() => {}} onLeaveGroup={() => navigate(-1)} onDeleteChat={() => navigate(-1)} />
    </div>
  );
};

export default Conversation;
