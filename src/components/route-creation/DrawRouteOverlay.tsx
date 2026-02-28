/**
 * Overlay for draw-route mode with real-time snap-to-roads per segment.
 */
import { useState, useCallback } from 'react';
import { Undo2, Trash2, Check, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  formatRouteDistance, formatRouteDuration, calculateDistance, estimateDuration,
  snapSegment, mergeSegments, buildRouteDraft,
  type SnappedSegment,
} from '@/services/routeService';
import type { RouteDraft } from '@/models/route';
import { toast } from 'sonner';

interface Props {
  waypoints: [number, number][];
  onSetWaypoints: (w: [number, number][]) => void;
  /** Called with snapped coordinates for live map display */
  onSnappedCoordsUpdate?: (coords: [number, number][]) => void;
  onFinish: (draft: RouteDraft) => void;
  onCancel: () => void;
}

const DrawRouteOverlay = ({ waypoints, onSetWaypoints, onSnappedCoordsUpdate, onFinish, onCancel }: Props) => {
  const [snapToRoad, setSnapToRoad] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [segments, setSegments] = useState<SnappedSegment[]>([]);
  const [snappedDistance, setSnappedDistance] = useState(0);
  const [snappedDuration, setSnappedDuration] = useState(0);

  // Calculate raw distance/duration
  const rawDistance = waypoints.length >= 2 ? calculateDistance(waypoints) : 0;
  const rawDuration = estimateDuration(rawDistance);

  const distance = snapToRoad && segments.length > 0 ? snappedDistance : rawDistance;
  const duration = snapToRoad && segments.length > 0 ? snappedDuration : rawDuration;

  // Snap the latest segment when a new waypoint is added
  const handleSnapNewSegment = useCallback(async (newWaypoints: [number, number][]) => {
    if (!snapToRoad || newWaypoints.length < 2) return;

    const from = newWaypoints[newWaypoints.length - 2];
    const to = newWaypoints[newWaypoints.length - 1];

    setIsSnapping(true);
    try {
      const seg = await snapSegment(from, to);
      setSegments(prev => {
        const updated = [...prev, seg];
        const merged = mergeSegments(updated);
        setSnappedDistance(merged.totalDistance);
        setSnappedDuration(merged.totalDuration);
        onSnappedCoordsUpdate?.(merged.coordinates);
        return updated;
      });
    } catch (e: any) {
      toast.error('Snap failed for segment', { description: e.message });
    } finally {
      setIsSnapping(false);
    }
  }, [snapToRoad, onSnappedCoordsUpdate]);

  // Expose this so AddRoute can call it after adding waypoints
  // We do it via a prop callback pattern
  const handleAddWaypoint = useCallback((pt: [number, number]) => {
    const newWps = [...waypoints, pt];
    onSetWaypoints(newWps);
    if (snapToRoad && newWps.length >= 2) {
      handleSnapNewSegment(newWps);
    }
  }, [waypoints, onSetWaypoints, snapToRoad, handleSnapNewSegment]);

  const handleUndo = () => {
    if (waypoints.length > 0) {
      onSetWaypoints(waypoints.slice(0, -1));
      if (segments.length > 0) {
        const newSegs = segments.slice(0, -1);
        setSegments(newSegs);
        if (newSegs.length > 0) {
          const merged = mergeSegments(newSegs);
          setSnappedDistance(merged.totalDistance);
          setSnappedDuration(merged.totalDuration);
          onSnappedCoordsUpdate?.(merged.coordinates);
        } else {
          setSnappedDistance(0);
          setSnappedDuration(0);
          onSnappedCoordsUpdate?.([]);
        }
      }
    }
  };

  const handleClear = () => {
    onSetWaypoints([]);
    setSegments([]);
    setSnappedDistance(0);
    setSnappedDuration(0);
    onSnappedCoordsUpdate?.([]);
  };

  const handleToggleSnap = async (checked: boolean) => {
    setSnapToRoad(checked);
    if (checked && waypoints.length >= 2) {
      // Rebuild all segments
      setIsSnapping(true);
      try {
        const newSegments: SnappedSegment[] = [];
        for (let i = 1; i < waypoints.length; i++) {
          const seg = await snapSegment(waypoints[i - 1], waypoints[i]);
          newSegments.push(seg);
        }
        setSegments(newSegments);
        const merged = mergeSegments(newSegments);
        setSnappedDistance(merged.totalDistance);
        setSnappedDuration(merged.totalDuration);
        onSnappedCoordsUpdate?.(merged.coordinates);
      } catch (e: any) {
        toast.error('Snap to roads failed', { description: e.message });
        setSnapToRoad(false);
      } finally {
        setIsSnapping(false);
      }
    } else if (!checked) {
      setSegments([]);
      setSnappedDistance(0);
      setSnappedDuration(0);
      onSnappedCoordsUpdate?.([]);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        handleAddWaypoint(pt);
      },
      () => toast.error('Could not get location'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleDone = useCallback(async () => {
    if (waypoints.length < 2) {
      toast.error('Place at least 2 points');
      return;
    }

    if (snapToRoad && segments.length > 0) {
      const merged = mergeSegments(segments);
      onFinish(buildRouteDraft(
        merged.coordinates, waypoints, true,
        merged.totalDistance, merged.totalDuration,
      ));
    } else {
      onFinish(buildRouteDraft(waypoints, waypoints, false));
    }
  }, [waypoints, snapToRoad, segments, onFinish]);

  return (
    <div className="absolute bottom-28 left-3 right-3 z-40">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-routes" />
            <span className="text-xs font-bold text-foreground">Draw Route</span>
          </div>
          <div className="flex items-center gap-3">
            {waypoints.length >= 2 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">{formatRouteDistance(distance)}</span>
                <span className="text-muted-foreground">•</span>
                <span className="font-semibold text-foreground">{formatRouteDuration(duration)}</span>
              </div>
            )}
            <button onClick={onCancel} className="text-[11px] text-muted-foreground hover:text-foreground font-medium">Cancel</button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mb-2">Tap the map to drop waypoints</p>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 p-2 bg-muted/40 rounded-xl">
            <Label htmlFor="snap" className="text-[11px] font-medium">Snap to roads</Label>
            <Switch id="snap" checked={snapToRoad} onCheckedChange={handleToggleSnap} disabled={isSnapping} className="scale-90" />
          </div>
          {waypoints.length === 0 && (
            <button onClick={handleUseCurrentLocation}
              className="flex-1 py-2 rounded-xl text-[11px] font-semibold bg-routes/10 text-routes border border-routes/20 hover:bg-routes/20 transition-colors flex items-center justify-center gap-1">
              <Crosshair className="w-3 h-3" /> My location
            </button>
          )}
          {waypoints.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleUndo} disabled={waypoints.length === 0} className="gap-1 rounded-xl h-8 text-[11px] px-2.5">
                <Undo2 className="w-3 h-3" /> Undo
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear} disabled={waypoints.length === 0} className="gap-1 rounded-xl h-8 text-[11px] px-2.5">
                <Trash2 className="w-3 h-3" /> Clear
              </Button>
            </>
          )}
        </div>

        <Button size="sm" onClick={handleDone} disabled={waypoints.length < 2 || isSnapping}
          className="w-full gap-1.5 bg-routes hover:bg-routes/90 text-routes-foreground rounded-xl font-semibold h-9 text-xs">
          {isSnapping ? 'Snapping...' : <><Check className="w-3.5 h-3.5" /> Done ({waypoints.length} pts)</>}
        </Button>
      </div>
    </div>
  );
};

export default DrawRouteOverlay;
