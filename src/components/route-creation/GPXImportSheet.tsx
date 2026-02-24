/**
 * Sheet for importing a GPX file.
 */
import { useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { FileUp } from 'lucide-react';
import { parseGPX, buildDraftFromCoords } from '@/services/routeService';
import type { DraftRoute } from '@/services/routeService';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (draft: DraftRoute) => void;
}

const GPXImportSheet = ({ open, onOpenChange, onImport }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const coords = parseGPX(text);
      const draft = buildDraftFromCoords(coords);
      toast.success(`Imported ${coords.length} points`);
      onImport(draft);
      onOpenChange(false);
    } catch (err: any) {
      toast.error('Failed to parse GPX', { description: err.message });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>Import GPX File</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 rounded-full bg-routes/10 flex items-center justify-center">
            <FileUp className="w-8 h-8 text-routes" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Select a .gpx file from your device to import a route
          </p>
          <input ref={inputRef} type="file" accept=".gpx" className="hidden" onChange={handleFile} />
          <Button onClick={() => inputRef.current?.click()} className="bg-routes hover:bg-routes/90 text-routes-foreground">
            Choose File
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GPXImportSheet;
