import { useState } from 'react';
import { Drawer, DrawerContent, DrawerOverlay } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, X, Clock, Car } from 'lucide-react';
import type { EventAttendee } from '@/models';

interface AttendEventSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (registration: string) => void;
  eventTitle: string;
}

export const AttendEventSheet = ({ open, onClose, onConfirm, eventTitle }: AttendEventSheetProps) => {
  const [registration, setRegistration] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const trimmed = registration.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter your registration / number plate');
      return;
    }
    onConfirm(trimmed);
    setRegistration('');
    setError('');
  };

  const handleClose = () => {
    setRegistration('');
    setError('');
    onClose();
  };

  return (
    <Drawer open={open} onClose={handleClose} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DrawerOverlay className="bg-black/40" />
      <DrawerContent className="bg-card border-t border-border/50 rounded-t-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        <div className="px-5 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Confirm attendance</h3>
            <button onClick={handleClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground">
            To attend <span className="font-medium text-foreground">{eventTitle}</span>, enter your vehicle registration / number plate.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Registration / Number Plate</Label>
            <Input
              value={registration}
              onChange={(e) => {
                setRegistration(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="e.g. AB12 CDE"
              className="rounded-xl h-11 uppercase tracking-wider font-mono text-base"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 h-11 rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="flex-1 h-11 rounded-xl bg-events hover:bg-events/90 text-events-foreground font-semibold">
              Confirm Attendance
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

interface AttendeeListSheetProps {
  open: boolean;
  onClose: () => void;
  attendees: EventAttendee[];
  onRemoveAttendee?: (userId: string) => void;
}

export const AttendeeListSheet = ({ open, onClose, attendees, onRemoveAttendee }: AttendeeListSheetProps) => {
  return (
    <Drawer open={open} onClose={onClose} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DrawerOverlay className="bg-black/40" />
      <DrawerContent className="max-h-[80vh] bg-card border-t border-border/50 rounded-t-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>
        <div className="px-5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Attendee List</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {attendees.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No one has attended yet</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[60vh]">
              {attendees.map((a) => {
                const timeSince = getTimeSince(a.joinedAt);
                return (
                  <div key={a.userId} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
                    <Avatar className="h-9 w-9">
                      {a.profileImage && <AvatarImage src={a.profileImage} />}
                      <AvatarFallback className="text-xs bg-muted-foreground/20">
                        {a.displayName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.displayName || a.username}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Car className="w-3 h-3" /> {a.vehicleRegistration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Joined {timeSince}
                        </span>
                      </div>
                    </div>
                    {onRemoveAttendee && (
                      <button
                        onClick={() => onRemoveAttendee(a.userId)}
                        className="text-xs text-destructive hover:text-destructive/80 font-medium px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

function getTimeSince(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default AttendEventSheet;
