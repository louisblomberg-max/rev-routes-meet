import { ArrowLeft, Send, Image, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const mockMessages = [
  {
    id: '1',
    senderId: 'other',
    text: 'Hey! I saw your M3 on the forum, it looks incredible!',
    time: '10:30 AM',
  },
  {
    id: '2',
    senderId: 'me',
    text: 'Thanks! Took about 6 months to get it to this stage',
    time: '10:32 AM',
  },
  {
    id: '3',
    senderId: 'other',
    text: 'That M3 looks incredible! Where did you get the exhaust?',
    time: '10:33 AM',
  },
  {
    id: '4',
    senderId: 'me',
    text: "It's an Akrapovic titanium system. Got it from Performance Parts UK - they're listed on RevNet actually!",
    time: '10:35 AM',
  },
  {
    id: '5',
    senderId: 'other',
    text: "Oh nice! I'll check them out. How's the sound?",
    time: '10:36 AM',
  },
];

const mockConversation = {
  id: '1',
  name: 'BimmerFan92',
  online: true,
};

const Conversation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      // Would send message here
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {mockConversation.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">{mockConversation.name}</h1>
            {mockConversation.online && (
              <p className="text-xs text-green-500">Online</p>
            )}
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                message.senderId === 'me'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-[10px] mt-1 ${
                message.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {message.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 p-3">
        <div className="flex items-center gap-2">
          <button className="p-2 text-muted-foreground hover:text-foreground">
            <Image className="w-5 h-5" />
          </button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-muted/50 border-0 rounded-full h-10"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="rounded-full h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
