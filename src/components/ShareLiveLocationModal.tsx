/**
 * ShareLiveLocationModal — sharing options for live trip progress.
 * Backend-ready: recipients will sync to Supabase realtime later.
 */

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useNavigation, LiveShareRecipient } from '@/contexts/NavigationContext';
import { Users, UserPlus, Shield, X, Radio, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ShareLiveLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHARE_OPTIONS: { type: LiveShareRecipient['type']; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'friends',
    label: 'Share with Friends',
    description: 'All your RevNet friends can see your live trip',
    icon: <Users className="w-5 h-5" />,
  },
  {
    type: 'specific',
    label: 'Share with Specific People',
    description: 'Choose exactly who can follow your journey',
    icon: <UserPlus className="w-5 h-5" />,
  },
  {
    type: 'club',
    label: 'Share with Club / Group',
    description: 'Members of your club or drive group',
    icon: <Shield className="w-5 h-5" />,
  },
];

const ShareLiveLocationModal = ({ open, onOpenChange }: ShareLiveLocationModalProps) => {
  const { liveSharing, toggleLiveSharing, setLiveSharingRecipients, stopLiveSharing } = useNavigation();

  const handleShareOption = (type: LiveShareRecipient['type'], label: string) => {
    const recipient: LiveShareRecipient = {
      id: crypto.randomUUID(),
      type,
      label,
    };

    const exists = liveSharing.recipients.some(r => r.type === type);
    if (exists) {
      setLiveSharingRecipients(liveSharing.recipients.filter(r => r.type !== type));
      toast.info(`Stopped sharing with ${label.toLowerCase()}`);
    } else {
      setLiveSharingRecipients([...liveSharing.recipients, recipient]);
      if (!liveSharing.isSharing) {
        toggleLiveSharing();
      }
      toast.success(`Sharing with ${label.toLowerCase()}`);
    }
  };

  const handleStopAll = () => {
    stopLiveSharing();
    toast.info('Live sharing stopped');
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh] bg-card">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-routes/10 flex items-center justify-center">
                <Radio className="w-4 h-4 text-routes" />
              </div>
              <DrawerTitle className="text-base font-bold text-foreground">
                Share Live Location
              </DrawerTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Let others follow your live trip progress and ETA.
          </p>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-2">
          {/* Sharing status */}
          {liveSharing.isSharing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-routes/10 rounded-lg border border-routes/20 mb-2">
              <div className="w-2 h-2 rounded-full bg-routes animate-pulse" />
              <span className="text-xs font-medium text-routes">
                Live sharing active
                {liveSharing.recipients.length > 0 && ` · ${liveSharing.recipients.length} group${liveSharing.recipients.length > 1 ? 's' : ''}`}
              </span>
            </div>
          )}

          {/* Options */}
          {SHARE_OPTIONS.map((opt) => {
            const isActive = liveSharing.recipients.some(r => r.type === opt.type);
            return (
              <button
                key={opt.type}
                onClick={() => handleShareOption(opt.type, opt.label)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'bg-routes/10 border-routes/30'
                    : 'bg-card border-border/50 hover:bg-muted/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-routes text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isActive ? 'text-routes' : 'text-foreground'}`}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-routes shrink-0" />
                )}
              </button>
            );
          })}

          {/* Stop sharing */}
          {liveSharing.isSharing && (
            <Button
              variant="outline"
              onClick={handleStopAll}
              className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 mt-2"
            >
              <X className="w-4 h-4" />
              Stop Sharing
            </Button>
          )}

          {/* Info */}
          <div className="flex items-start gap-2 px-3 py-2 mt-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your location is only shared while navigation is active. Sharing stops automatically when you end navigation.
            </p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ShareLiveLocationModal;
