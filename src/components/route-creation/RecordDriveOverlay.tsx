/**
 * Floating overlay shown while recording a drive.
 * Shows distance, duration, pause/finish buttons.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRouteDistance, formatRouteDuration, calculateDistance } from '@/services/routeService';
import type { DraftRoute } from '@/services/routeService';
import { toast } from 'sonner';

interface Props {
  onFinish: (draft: DraftRoute) => void;
  onCancel: () => void;
}

const RecordDriveOverlay = ({ onFinish, onCancel }: Props) => {
  const [coords, setCoords] = useState<[number, number][]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      onCancel();
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setCoords(prev => [...prev, pt]);
      },
      () => toast.error('GPS error'),
      { enableHighAccuracy: true },
    );
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [onCancel]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
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
    const distance = calculateDistance(coords);
    onFinish({
      geometry: { type: 'LineString', coordinates: coords },
      distance,
      duration: elapsed,
      startLat: coords[0][1],
      startLng: coords[0][0],
      endLat: coords[coords.length - 1][1],
      endLng: coords[coords.length - 1][0],
    });
  };

  const distance = calculateDistance(coords);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl border border-border/40 px-5 py-4 w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-destructive animate-pulse'}`} />
          <span className="text-xs font-semibold text-foreground">
            {isPaused ? 'Paused' : 'Recording'}
          </span>
        </div>
        <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Distance</p>
          <p className="text-lg font-bold text-foreground">{formatRouteDistance(distance)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Duration</p>
          <p className="text-lg font-bold text-foreground">{formatRouteDuration(elapsed)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handlePause} className="flex-1 gap-1.5">
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        <Button size="sm" onClick={handleFinish} className="flex-1 gap-1.5 bg-routes hover:bg-routes/90 text-routes-foreground">
          <Square className="w-4 h-4" />
          Finish
        </Button>
      </div>
    </div>
  );
};

export default RecordDriveOverlay;
