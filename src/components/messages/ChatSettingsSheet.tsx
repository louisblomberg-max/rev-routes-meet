import { useState } from 'react';
import { X, Edit2, Users, LogOut, Trash2, Bell, BellOff } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Participant {
  id: string;
  name: string;
  username: string;
  isAdmin?: boolean;
}

interface ChatSettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatName: string;
  isGroup: boolean;
  participants: Participant[];
  isMuted: boolean;
  onRename: (newName: string) => void;
  onToggleMute: () => void;
  onLeaveGroup: () => void;
  onDeleteChat: () => void;
}

const ChatSettingsSheet = ({
  open,
  onOpenChange,
  chatName,
  isGroup,
  participants,
  isMuted,
  onRename,
  onToggleMute,
  onLeaveGroup,
  onDeleteChat,
}: ChatSettingsSheetProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(chatName);

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== chatName) {
      onRename(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    setEditedName(chatName);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">Chat Settings</SheetTitle>
            <button onClick={handleClose} className="p-2 -mr-2 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full overflow-y-auto pb-20">
          {/* Chat Avatar & Name */}
          <div className="flex flex-col items-center py-6 border-b border-border/50">
            <Avatar className="w-20 h-20 mb-3">
              <AvatarFallback className={`text-2xl font-bold ${isGroup ? 'bg-primary/10 text-primary' : 'bg-muted text-foreground'}`}>
                {isGroup ? <Users className="w-8 h-8" /> : chatName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <div className="flex items-center gap-2 px-4 w-full max-w-xs">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-center font-semibold"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <Button size="sm" onClick={handleSaveName}>Save</Button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-xl font-bold text-foreground">{chatName}</span>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            
            {isGroup && (
              <p className="text-sm text-muted-foreground mt-1">
                {participants.length} members
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <button
              onClick={onToggleMute}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {isMuted ? (
                <Bell className="w-5 h-5 text-foreground" />
              ) : (
                <BellOff className="w-5 h-5 text-foreground" />
              )}
              <span className="font-medium text-foreground">
                {isMuted ? 'Unmute notifications' : 'Mute notifications'}
              </span>
            </button>
          </div>

          {/* Participants (for groups) */}
          {isGroup && (
            <div className="border-t border-border/50">
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Members
                </p>
              </div>
              <div className="divide-y divide-border/30">
                {participants.map(participant => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted text-foreground font-semibold text-sm">
                        {participant.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">@{participant.username}</p>
                    </div>
                    {participant.isAdmin && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border-t border-border/50 p-4 space-y-2 mt-auto">
            {isGroup && (
              <button
                onClick={onLeaveGroup}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Leave Group</span>
              </button>
            )}
            <button
              onClick={onDeleteChat}
              className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-destructive/10 transition-colors text-destructive"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Delete Chat</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatSettingsSheet;
