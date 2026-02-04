import { ArrowLeft, Search, MoreVertical, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import NewConversationSheet from '@/components/messages/NewConversationSheet';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string | null;
  isGroup: boolean;
  participants?: string[];
}

const initialConversations: Conversation[] = [
  {
    id: '1',
    name: 'BimmerFan92',
    lastMessage: 'That M3 looks incredible! Where did you get the exhaust?',
    time: '2m ago',
    unread: true,
    avatar: null,
    isGroup: false,
  },
  {
    id: '2',
    name: 'E30Steve',
    lastMessage: 'Thanks for the rust repair recommendation!',
    time: '1h ago',
    unread: true,
    avatar: null,
    isGroup: false,
  },
  {
    id: '3',
    name: 'Track Day Crew',
    lastMessage: 'CleanFreak: See everyone at 8am!',
    time: '3h ago',
    unread: false,
    avatar: null,
    isGroup: true,
    participants: ['CleanFreak', 'TrackDayPro', 'BimmerFan92'],
  },
  {
    id: '4',
    name: 'TrackDayPro',
    lastMessage: 'See you at Brands Hatch next weekend!',
    time: '1d ago',
    unread: false,
    avatar: null,
    isGroup: false,
  },
  {
    id: '5',
    name: 'VWNewbie',
    lastMessage: 'Thanks for the advice on the GTI vs Golf R',
    time: '2d ago',
    unread: false,
    avatar: null,
    isGroup: false,
  },
];

const Messages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const filteredConversations = conversations.filter(conv =>
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
    };
    setConversations(prev => [newConversation, ...prev]);
    navigate(`/messages/${newConversation.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground flex-1">Messages</h1>
          <button
            onClick={() => setIsNewConversationOpen(true)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-0 h-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-border/30">
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => navigate(`/messages/${conversation.id}`)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={`font-semibold ${conversation.isGroup ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}`}>
                  {conversation.isGroup ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    conversation.name.slice(0, 2).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>
              {conversation.unread && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold text-foreground ${conversation.unread ? '' : 'font-medium'}`}>
                    {conversation.name}
                  </span>
                  {conversation.isGroup && (
                    <span className="text-xs text-muted-foreground">
                      · {conversation.participants?.length}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {conversation.time}
                </span>
              </div>
              <p className={`text-sm truncate mt-0.5 ${conversation.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {conversation.lastMessage}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Menu action
              }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </button>
        ))}
      </div>

      {filteredConversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No conversations found</h3>
          <p className="text-sm text-muted-foreground">Try a different search term</p>
        </div>
      )}

      {/* New Conversation Sheet */}
      <NewConversationSheet
        open={isNewConversationOpen}
        onOpenChange={setIsNewConversationOpen}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default Messages;
