import { ArrowLeft, Search, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

const mockConversations = [
  {
    id: '1',
    name: 'BimmerFan92',
    lastMessage: 'That M3 looks incredible! Where did you get the exhaust?',
    time: '2m ago',
    unread: true,
    avatar: null,
  },
  {
    id: '2',
    name: 'E30Steve',
    lastMessage: 'Thanks for the rust repair recommendation!',
    time: '1h ago',
    unread: true,
    avatar: null,
  },
  {
    id: '3',
    name: 'CleanFreak',
    lastMessage: 'I can recommend a great detailer in your area',
    time: '3h ago',
    unread: false,
    avatar: null,
  },
  {
    id: '4',
    name: 'TrackDayPro',
    lastMessage: 'See you at Brands Hatch next weekend!',
    time: '1d ago',
    unread: false,
    avatar: null,
  },
  {
    id: '5',
    name: 'VWNewbie',
    lastMessage: 'Thanks for the advice on the GTI vs Golf R',
    time: '2d ago',
    unread: false,
    avatar: null,
  },
];

const Messages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {conversation.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.unread && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-semibold text-foreground ${conversation.unread ? '' : 'font-medium'}`}>
                  {conversation.name}
                </span>
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
    </div>
  );
};

export default Messages;
