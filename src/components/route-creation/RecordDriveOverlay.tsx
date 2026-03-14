/**
 * Floating overlay shown while recording a drive.
 * Strava-like experience for vehicles — tracks speed, distance, duration, elevation.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Pause, Play, Square, Gauge, TrendingUp, Navigation, Timer } from 'lucide-react';
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
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [maxSpeed, setMaxSpeed] = useState(0); // km/h
  const [elevationGain, setElevationGain] = useState(0); // meters
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());
  const coordsRef = useRef<[number, number][]>([]);
  const lastAltitudeRef = useRef<number | null>(null);
  const speedsRef = useRef<number[]>([]);

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

        // Speed tracking (m/s → km/h)
        if (pos.coords.speed != null && pos.coords.speed >= 0) {
          const speedKmh = pos.coords.speed * 3.6;
          setCurrentSpeed(speedKmh);
          speedsRef.current.push(speedKmh);
          if (speedKmh > maxSpeed) {
            setMaxSpeed(speedKmh);
          }
        }

        // Elevation tracking
        if (pos.coords.altitude != null) {
          if (lastAltitudeRef.current != null) {
            const diff = pos.coords.altitude - lastAltitudeRef.current;
            if (diff > 0) {
              setElevationGain(prev => prev + diff);
            }
          }
          lastAltitudeRef.current = pos.coords.altitude;
        }
      },
      () => toast.error('GPS error'),
      { enableHighAccuracy: true },
    );
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [onCancel, onCoordsUpdate, maxSpeed]);

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
      setCurrentSpeed(0);
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
    const avgSpeed = elapsed > 0 ? (distance / 1000) / (elapsed / 3600) : 0;
    const draft = buildRouteDraft(
      coords,
      [coords[0], coords[coords.length - 1]],
      false,
      undefined,
      elapsed,
    );
    // Augment with recording stats
    draft.stats.maxSpeedKmh = maxSpeed;
    draft.stats.avgSpeedKmh = avgSpeed;
    draft.stats.elevationGainMeters = elevationGain;
    onFinish(draft);
  };

  const handleCancel = () => {
    stopTracking();
    onCancel();
  };

  const distance = calculateDistance(coords);

  return (
    <div className="absolute bottom-4 left-3 right-3 z-40">
      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 p-4">
        {/* Status bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-destructive animate-pulse'}`} />
            <span className="text-xs font-bold text-foreground">
              {isPaused ? 'Paused' : 'Recording Drive'}
            </span>
          </div>
          <button onClick={handleCancel} className="text-[11px] text-muted-foreground hover:text-foreground font-medium">Cancel</button>
        </div>

        {/* Live stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/40 rounded-xl p-2.5 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-routes" />
            <div>
              <p className="text-[9px] uppercase text-muted-foreground tracking-wider font-medium">Distance</p>
              <p className="text-sm font-bold text-foreground">{formatRouteDistance(distance)}</p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl p-2.5 flex items-center gap-2">
            <Timer className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-[9px] uppercase text-muted-foreground tracking-wider font-medium">Time</p>
              <p className="text-sm font-bold text-foreground">{formatRouteDuration(elapsed)}</p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl p-2.5 flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-routes" />
            <div>
              <p className="text-[9px] uppercase text-muted-foreground tracking-wider font-medium">Speed</p>
              <p className="text-sm font-bold text-foreground">{Math.round(currentSpeed)} <span className="text-[9px] font-normal text-muted-foreground">km/h</span></p>
            </div>
          </div>
          <div className="bg-muted/40 rounded-xl p-2.5 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-[9px] uppercase text-muted-foreground tracking-wider font-medium">Max Speed</p>
              <p className="text-sm font-bold text-foreground">{Math.round(maxSpeed)} <span className="text-[9px] font-normal text-muted-foreground">km/h</span></p>
            </div>
          </div>
        </div>

        {/* Elevation if available */}
        {elevationGain > 0 && (
          <div className="text-center text-[10px] text-muted-foreground mb-2">
            ↑ {Math.round(elevationGain)}m elevation gain
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePause} className="flex-1 gap-1.5 rounded-xl font-semibold h-10 text-xs">
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button size="sm" onClick={handleFinish} className="flex-1 gap-1.5 bg-routes hover:bg-routes/90 text-routes-foreground rounded-xl font-semibold h-10 text-xs">
            <Square className="w-3.5 h-3.5" />
            Finish Drive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordDriveOverlay;
