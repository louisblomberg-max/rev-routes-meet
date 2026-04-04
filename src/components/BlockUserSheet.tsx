import { useState } from 'react';
import { ShieldOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BlockUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  targetUserId: string;
}

const BlockUserSheet = ({ open, onOpenChange, userName = 'this user', targetUserId }: BlockUserSheetProps) => {
  const { user } = useAuth();
  const [confirmed, setConfirmed] = useState(false);

  const handleBlock = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to block a user');
      return;
    }
    const { error } = await supabase.from('blocked_users').insert({ user_id: user.id, blocked_user_id: targetUserId });
    if (error) {
      toast.error('Failed to block user');
      return;
    }
    setConfirmed(true);
    toast.success(`${userName} has been blocked`);
    setTimeout(() => {
      onOpenChange(false);
      setConfirmed(false);
    }, 800);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ShieldOff className="w-4 h-4 text-destructive" />
            </div>
            <SheetTitle className="heading-md">Block {userName}?</SheetTitle>
          </div>
        </SheetHeader>

        {confirmed ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Check className="w-10 h-10 text-services mb-3" />
            <p className="heading-sm text-foreground">Blocked</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-foreground font-medium">This will:</p>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  Prevent them from messaging you
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  Hide their content from your feed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  Remove them from your friends list
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  They won't be notified
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-11" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1 h-11" onClick={handleBlock}>
                Block
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default BlockUserSheet;
