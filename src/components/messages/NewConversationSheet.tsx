import { useState, useEffect, useRef } from 'react';
import { X, Search, Users, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  name: string;
  username: string;
  avatar_url?: string | null;
}

interface NewConversationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateConversation: (selectedUsers: User[], groupName?: string) => void;
}

const NewConversationSheet = ({ open, onOpenChange, onCreateConversation }: NewConversationSheetProps) => {
  const { user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch suggested users on mount
  useEffect(() => {
    if (!open || !authUser?.id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) {
        setUsers(data.map(p => ({ id: p.id, name: p.display_name || p.username || 'User', username: p.username || '', avatar_url: p.avatar_url })));
      }
      setLoading(false);
    })();
  }, [open, authUser?.id]);

  // Debounced search
  useEffect(() => {
    if (!authUser?.id) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!searchQuery.trim()) {
      // Reset to suggested
      (async () => {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .neq('id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) {
          setUsers(data.map(p => ({ id: p.id, name: p.display_name || p.username || 'User', username: p.username || '', avatar_url: p.avatar_url })));
        }
      })();
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .ilike('username', `%${searchQuery.trim()}%`)
        .neq('id', authUser.id)
        .limit(10);
      if (data) {
        setUsers(data.map(p => ({ id: p.id, name: p.display_name || p.username || 'User', username: p.username || '', avatar_url: p.avatar_url })));
      }
      setLoading(false);
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, authUser?.id]);

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

          {/* Group Name Input */}
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
            {loading ? (
              <div className="px-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {users.map(user => {
                  const isSelected = selectedUsers.some(u => u.id === user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                    >
                      <Avatar className="w-11 h-11">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} />}
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
            )}

            {!loading && users.length === 0 && (
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
