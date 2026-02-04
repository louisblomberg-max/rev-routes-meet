import { useState } from 'react';
import { X, Search, Users, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  name: string;
  username: string;
}

interface NewConversationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateConversation: (selectedUsers: User[], groupName?: string) => void;
}

const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Turner', username: 'alexturner' },
  { id: 'u2', name: 'Sarah Mitchell', username: 'sarahm' },
  { id: 'u3', name: 'Marcus Chen', username: 'mchen92' },
  { id: 'u4', name: 'Emma Wilson', username: 'emmaw' },
  { id: 'u5', name: 'Jake Roberts', username: 'jakeroberts' },
  { id: 'u6', name: 'Lisa Park', username: 'lisapark' },
  { id: 'u7', name: 'David Kim', username: 'dkim' },
  { id: 'u8', name: 'Rachel Green', username: 'rachelg' },
];

const NewConversationSheet = ({ open, onOpenChange, onCreateConversation }: NewConversationSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        const newSelection = prev.filter(u => u.id !== user.id);
        if (newSelection.length <= 1) setIsGroupMode(false);
        return newSelection;
      }
      const newSelection = [...prev, user];
      if (newSelection.length > 1) setIsGroupMode(true);
      return newSelection;
    });
  };

  const handleCreate = () => {
    if (selectedUsers.length === 0) return;
    onCreateConversation(selectedUsers, isGroupMode && groupName ? groupName : undefined);
    // Reset state
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setIsGroupMode(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setIsGroupMode(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold">New Message</SheetTitle>
            <button onClick={handleClose} className="p-2 -mr-2 text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="px-4 py-3 border-b border-border/50">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {user.name}
                    <X className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Group Name Input (shown when multiple users selected) */}
          {isGroupMode && (
            <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <Input
                  placeholder="Group name (optional)"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 bg-transparent border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0"
                />
              </div>
            </div>
          )}

          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 h-10 rounded-xl"
                autoFocus
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {searchQuery ? 'Search Results' : 'Suggested'}
              </p>
            </div>
            <div className="divide-y divide-border/30">
              {filteredUsers.map(user => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="bg-muted text-foreground font-semibold">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="p-4 border-t border-border/50 bg-background">
            <Button
              onClick={handleCreate}
              disabled={selectedUsers.length === 0}
              className="w-full h-12 rounded-xl font-semibold"
            >
              {selectedUsers.length === 0 
                ? 'Select users to start' 
                : selectedUsers.length === 1 
                  ? 'Start Conversation' 
                  : `Create Group (${selectedUsers.length})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NewConversationSheet;
