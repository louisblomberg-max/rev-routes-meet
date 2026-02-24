/**
 * Overlay for draw-route mode: user taps map to place waypoints.
 * Shows undo/clear/snap-to-road controls and done button.
 */
import { useState, useCallback } from 'react';
import { Undo2, Trash2, Navigation, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatRouteDistance, formatRouteDuration, calculateDistance, estimateDuration, snapToRoads, buildDraftFromCoords } from '@/services/routeService';
import type { DraftRoute } from '@/services/routeService';
import { toast } from 'sonner';

interface Props {
  waypoints: [number, number][];
  onSetWaypoints: (w: [number, number][]) => void;
  onFinish: (draft: DraftRoute) => void;
  onCancel: () => void;
}

const DrawRouteOverlay = ({ waypoints, onSetWaypoints, onFinish, onCancel }: Props) => {
  const [snapToRoad, setSnapToRoad] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const distance = waypoints.length >= 2 ? calculateDistance(waypoints) : 0;
  const duration = estimateDuration(distance);

  const handleUndo = () => {
    if (waypoints.length > 0) onSetWaypoints(waypoints.slice(0, -1));
  };

  const handleClear = () => onSetWaypoints([]);

  const handleDone = useCallback(async () => {
    if (waypoints.length < 2) {
      toast.error('Place at least 2 points');
      return;
    }

    if (snapToRoad) {
      setIsSnapping(true);
      try {
        const draft = await snapToRoads(waypoints);
        onFinish(draft);
      } catch (e: any) {
        toast.error('Snap to roads failed', { description: e.message });
        // Fall back to raw coordinates
        onFinish(buildDraftFromCoords(waypoints));
      } finally {
        setIsSnapping(false);
      }
    } else {
      onFinish(buildDraftFromCoords(waypoints));
    }
  }, [waypoints, snapToRoad, onFinish]);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl border border-border/40 px-5 py-4 w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground">Draw Route</span>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>

      <p className="text-xs text-muted-foreground mb-3">Tap the map to drop waypoints</p>

      {waypoints.length >= 2 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Distance</p>
            <p className="text-sm font-bold text-foreground">{formatRouteDistance(distance)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Est. Duration</p>
            <p className="text-sm font-bold text-foreground">{formatRouteDuration(duration)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 p-2 bg-muted/50 rounded-lg">
        <Label htmlFor="snap" className="text-xs">Snap to roads</Label>
        <Switch id="snap" checked={snapToRoad} onCheckedChange={setSnapToRoad} />
      </div>

      <div className="flex gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={waypoints.length === 0} className="flex-1 gap-1">
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear} disabled={waypoints.length === 0} className="flex-1 gap-1">
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </Button>
      </div>

      <Button size="sm" onClick={handleDone} disabled={waypoints.length < 2 || isSnapping}
        className="w-full gap-1.5 bg-routes hover:bg-routes/90 text-routes-foreground">
        {isSnapping ? 'Snapping...' : <><Check className="w-4 h-4" /> Done ({waypoints.length} pts)</>}
      </Button>
    </div>
  );
};

export default DrawRouteOverlay;
