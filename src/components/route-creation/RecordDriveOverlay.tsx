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
    <div className="absolute bottom-28 left-3 right-3 z-40">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-destructive animate-pulse'}`} />
            <span className="text-xs font-bold text-foreground">
              {isPaused ? 'Paused' : 'Recording'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-foreground">{formatRouteDistance(distance)}</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-semibold text-foreground">{formatRouteDuration(elapsed)}</span>
            </div>
            <button onClick={handleCancel} className="text-[11px] text-muted-foreground hover:text-foreground font-medium ml-1">Cancel</button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePause} className="flex-1 gap-1.5 rounded-xl font-semibold h-9 text-xs">
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button size="sm" onClick={handleFinish} className="flex-1 gap-1.5 bg-routes hover:bg-routes/90 text-routes-foreground rounded-xl font-semibold h-9 text-xs">
            <Square className="w-3.5 h-3.5" />
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordDriveOverlay;
