/**
 * Bottom sheet to pick route creation method: Record, Draw, Import GPX
 */
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Navigation, PenTool, FileUp } from 'lucide-react';

export type RouteMethod = 'record' | 'draw' | 'gpx';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (method: RouteMethod) => void;
}

const methods = [
  { id: 'record' as const, icon: Navigation, label: 'Record Drive', desc: 'Track your drive with GPS in real-time' },
  { id: 'draw' as const, icon: PenTool, label: 'Draw Route', desc: 'Tap the map to plot waypoints' },
  { id: 'gpx' as const, icon: FileUp, label: 'Import GPX', desc: 'Upload a .gpx file from your device' },
];

const RouteMethodSheet = ({ open, onOpenChange, onSelect }: Props) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="bottom" className="rounded-t-2xl pb-8">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-lg font-bold">Create a Route</SheetTitle>
      </SheetHeader>
      <div className="space-y-2">
        {methods.map(m => (
          <button
            key={m.id}
            onClick={() => { onSelect(m.id); onOpenChange(false); }}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/60 hover:bg-muted transition-colors active:scale-[0.98]"
          >
            <div className="w-11 h-11 rounded-full bg-routes/10 flex items-center justify-center flex-shrink-0">
              <m.icon className="w-5 h-5 text-routes" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground text-sm">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </SheetContent>
  </Sheet>
);

export default RouteMethodSheet;
