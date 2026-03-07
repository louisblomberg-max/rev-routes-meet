import { Search, MoreVertical, Plus, Users, Pin, BellOff, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NewConversationSheet from '@/components/messages/NewConversationSheet';
import BackButton from '@/components/BackButton';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string | null;
  isGroup: boolean;
  participants?: string[];
  isPinned: boolean;
  isMuted: boolean;
}

const initialConversations: Conversation[] = [
  { id: '1', name: 'BimmerFan92', lastMessage: 'That M3 looks incredible! Where did you get the exhaust?', time: '2m ago', unread: true, avatar: null, isGroup: false, isPinned: true, isMuted: false },
  { id: '2', name: 'E30Steve', lastMessage: 'Thanks for the rust repair recommendation!', time: '1h ago', unread: true, avatar: null, isGroup: false, isPinned: false, isMuted: false },
  { id: '3', name: 'Track Day Crew', lastMessage: 'CleanFreak: See everyone at 8am!', time: '3h ago', unread: false, avatar: null, isGroup: true, participants: ['CleanFreak', 'TrackDayPro', 'BimmerFan92'], isPinned: false, isMuted: true },
  { id: '4', name: 'TrackDayPro', lastMessage: 'See you at Brands Hatch next weekend!', time: '1d ago', unread: false, avatar: null, isGroup: false, isPinned: false, isMuted: false },
  { id: '5', name: 'VWNewbie', lastMessage: 'Thanks for the advice on the GTI vs Golf R', time: '2d ago', unread: false, avatar: null, isGroup: false, isPinned: false, isMuted: false },
];

const Messages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const filteredConversations = sortedConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateConversation = (selectedUsers: { id: string; name: string; username: string }[], groupName?: string) => {
    const isGroup = selectedUsers.length > 1;
    const newConversation: Conversation = {
      id: `new-${Date.now()}`,
      name: groupName || (isGroup ? selectedUsers.map(u => u.name.split(' ')[0]).join(', ') : selectedUsers[0].name),
      lastMessage: 'Start the conversation...',
      time: 'Just now',
      unread: false,
      avatar: null,
      isGroup,
      participants: isGroup ? selectedUsers.map(u => u.name) : undefined,
      isPinned: false,
      isMuted: false,
    };
    setConversations(prev => [newConversation, ...prev]);
    navigate(`/messages/${newConversation.id}`);
  };

  const handleTogglePin = (id: string) => {
    setConversations(prev => prev.map(conv => conv.id === id ? { ...conv, isPinned: !conv.isPinned } : conv));
  };

  const handleToggleMute = (id: string) => {
    setConversations(prev => prev.map(conv => conv.id === id ? { ...conv, isMuted: !conv.isMuted } : conv));
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-5 pt-12 pb-4 safe-top">
          <BackButton className="w-10 h-10 rounded-full bg-card shadow-soft" iconClassName="w-4 h-4" />
          <h1 className="text-xl font-bold text-foreground flex-1">Messages</h1>
          <button
            onClick={() => setIsNewConversationOpen(true)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-glow-blue hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-muted rounded-[14px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-5 space-y-2 pb-20">
        {filteredConversations.map((conversation, index) => (
          <div
            key={conversation.id}
            className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-200 animate-card-enter ${
              conversation.isPinned ? 'bg-card shadow-soft' : 'bg-card/50 hover:bg-card'
            }`}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <button onClick={() => navigate(`/messages/${conversation.id}`)} className="flex items-center gap-3.5 flex-1 min-w-0 text-left">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={`font-semibold text-sm ${conversation.isGroup ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}`}>
                    {conversation.isGroup ? <Users className="w-5 h-5" /> : conversation.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {conversation.unread && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {conversation.isPinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
                    <span className={`text-sm truncate ${conversation.unread ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>{conversation.name}</span>
                    {conversation.isGroup && <span className="text-xs text-muted-foreground flex-shrink-0">· {conversation.participants?.length}</span>}
                    {conversation.isMuted && <BellOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{conversation.time}</span>
                </div>
                <p className={`text-sm truncate mt-0.5 ${conversation.unread ? 'text-foreground/80' : 'text-muted-foreground'}`}>{conversation.lastMessage}</p>
              </div>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-muted-foreground hover:text-foreground flex-shrink-0 rounded-full hover:bg-muted transition-colors"><MoreVertical className="w-4 h-4" /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleTogglePin(conversation.id)}><Pin className="w-4 h-4 mr-2" />{conversation.isPinned ? 'Unpin' : 'Pin conversation'}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleMute(conversation.id)}><BellOff className="w-4 h-4 mr-2" />{conversation.isMuted ? 'Unmute' : 'Mute notifications'}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteConversation(conversation.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div>
          <h3 className="font-semibold text-foreground mb-1">No conversations found</h3>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      )}

      <NewConversationSheet open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen} onCreateConversation={handleCreateConversation} />
    </div>
  );
};

export default Messages;