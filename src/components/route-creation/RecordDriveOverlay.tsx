/**
 * Floating overlay shown while recording a drive.
 * Matches the premium SectionCard design system.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Pause, Play, Square, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRouteDistance, formatRouteDuration, calculateDistance, buildRouteDraft } from '@/services/routeService';
import type { RouteDraft } from '@/models/route';
import { toast } from 'sonner';

interface Props {
  onFinish: (draft: RouteDraft) => void;
  onCancel: () => void;
  onCoordsUpdate?: (coords: [number, number][]) => void;
}

const RecordDriveOverlay = ({ onFinish, onCancel, onCoordsUpdate }: Props) => {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());
  const coordsRef = useRef<[number, number][]>([]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      onCancel();
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        coordsRef.current = [...coordsRef.current, pt];
        setCoords([...coordsRef.current]);
        onCoordsUpdate?.([...coordsRef.current]);
      },
      () => toast.error('GPS error'),
      { enableHighAccuracy: true },
    );
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [onCancel, onCoordsUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      try { navigator.geolocation.clearWatch(watchIdRef.current); } catch (_) {}
    }
    if (timerRef.current) {
      try { clearInterval(timerRef.current); } catch (_) {}
    }
    watchIdRef.current = null;
    timerRef.current = null;
  }, []);

  useEffect(() => {
    startTracking();
    return stopTracking;
  }, [startTracking, stopTracking]);

  const handlePause = () => {
    if (isPaused) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      startTracking();
    } else {
      stopTracking();
    }
    setIsPaused(!isPaused);
  };

  const handleFinish = () => {
    stopTracking();
    if (coords.length < 2) {
      toast.error('Not enough GPS points recorded');
      return;
    }
    onFinish(buildRouteDraft(coords, [coords[0], coords[coords.length - 1]], false, undefined, elapsed));
  };

  const handleCancel = () => {
    stopTracking();
    onCancel();
  };

  const distance = calculateDistance(coords);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-[290px]">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-destructive animate-pulse'}`} />
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-routes" />
              <span className="text-sm font-bold text-foreground">
                {isPaused ? 'Paused' : 'Recording'}
              </span>
            </div>
          </div>
          <button onClick={handleCancel} className="text-xs text-muted-foreground hover:text-foreground font-medium">Cancel</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-muted/40">
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">Distance</p>
            <p className="text-lg font-bold text-foreground">{formatRouteDistance(distance)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40">
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider font-medium">Duration</p>
            <p className="text-lg font-bold text-foreground">{formatRouteDuration(elapsed)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePause} className="flex-1 gap-1.5 rounded-xl font-semibold">
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button size="sm" onClick={handleFinish} className="flex-1 gap-1.5 bg-routes hover:bg-routes/90 text-routes-foreground rounded-xl font-semibold">
            <Square className="w-4 h-4" />
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordDriveOverlay;
