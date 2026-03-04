/**
 * NavigationHUD — full-screen bottom HUD during active navigation.
 * Shows: turn icon, instruction, remaining distance + ETA, End/Mute/Recenter buttons.
 */

import { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { formatDistance, formatDuration } from '@/services/navigationService';
import { Button } from '@/components/ui/button';
import NavigationStepsDrawer from '@/components/NavigationStepsDrawer';
import {
  Navigation, X, LocateFixed, Volume2, VolumeX,
  ArrowUp, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight,
  RotateCcw, MapPin, ArrowUpRight, ArrowUpLeft, Milestone,
  List, Play,
} from 'lucide-react';

const getManeuverIcon = (type: string, modifier?: string, size = 'w-8 h-8') => {
  const cls = size;
  if (type === 'turn') {
    if (modifier?.includes('left')) return <ArrowLeft className={cls} />;
    if (modifier?.includes('right')) return <ArrowRight className={cls} />;
  }
  if (type === 'fork') {
    if (modifier?.includes('left')) return <ArrowUpLeft className={cls} />;
    return <ArrowUpRight className={cls} />;
  }
  if (type === 'merge') return <CornerUpRight className={cls} />;
  if (type === 'roundabout' || type === 'rotary') return <RotateCcw className={cls} />;
  if (type === 'arrive') return <MapPin className={cls} />;
  if (type === 'depart') return <Navigation className={cls} />;
  if (type === 'off ramp') return <CornerUpLeft className={cls} />;
  if (type === 'on ramp') return <CornerUpRight className={cls} />;
  if (type === 'new name' || type === 'continue') return <ArrowUp className={cls} />;
  return <ArrowUp className={cls} />;
};

const NavigationHUD = () => {
  const {
    status, route, destination, steps, currentStepIndex,
    distanceRemainingMeters, etaSeconds, muted,
    beginLiveNavigation, stopNavigation, recenter, toggleMute,
    cameraFollowMode, setActiveStep,
  } = useNavigation();
  const [stepsOpen, setStepsOpen] = useState(false);

  if (status !== 'previewing' && status !== 'navigating') return null;

  const currentStep = steps[currentStepIndex];
  const isNavigating = status === 'navigating';

  return (
    <>
      <div className="fixed left-0 right-0 bottom-0 z-50 animate-slide-up">
        {/* Navigation instruction banner */}
        {isNavigating && currentStep && (
          <div className="mx-3 mb-2 bg-routes rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                {getManeuverIcon(currentStep.maneuver.type, currentStep.maneuver.modifier)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/70">
                  in {formatDistance(currentStep.distance)}
                </p>
                <p className="text-base font-bold text-white leading-tight truncate">
                  {currentStep.instruction}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preview banner */}
        {status === 'previewing' && route && (
          <div className="mx-3 mb-2 bg-card rounded-2xl p-4 shadow-lg border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-routes/10 flex items-center justify-center shrink-0">
                <Navigation className="w-6 h-6 text-routes" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground truncate">
                  {destination?.title || 'Route Preview'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDistance(route.distance)} · {formatDuration(route.duration)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom control bar */}
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 safe-bottom">
          <div className="max-w-md mx-auto px-4 py-3">
            {/* Stats row (navigating only) */}
            {isNavigating && (
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <p className="text-xl font-bold text-foreground">{formatDuration(etaSeconds)}</p>
                  <p className="text-xs text-muted-foreground">ETA</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{formatDistance(distanceRemainingMeters)}</p>
                  <p className="text-xs text-muted-foreground">remaining</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2">
              {status === 'previewing' && (
                <Button
                  onClick={beginLiveNavigation}
                  className="flex-1 gap-2 bg-routes hover:bg-routes/90 text-white py-5 text-base font-semibold"
                >
                  <Play className="w-5 h-5" />
                  Start
                </Button>
              )}

              {isNavigating && (
                <>
                  <Button
                    onClick={stopNavigation}
                    variant="destructive"
                    className="flex-1 gap-2 py-5 text-base font-semibold"
                  >
                    <X className="w-5 h-5" />
                    End
                  </Button>
                </>
              )}

              {isNavigating && (
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-12 w-12"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
              )}

              {isNavigating && cameraFollowMode === 'free' && (
                <Button
                  onClick={recenter}
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-12 w-12 border-routes text-routes"
                >
                  <LocateFixed className="w-5 h-5" />
                </Button>
              )}

              <Button
                onClick={() => setStepsOpen(true)}
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
              >
                <List className="w-5 h-5" />
              </Button>

              {status === 'previewing' && (
                <Button
                  onClick={stopNavigation}
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-12 w-12"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Steps drawer */}
      <NavigationStepsDrawer
        open={stepsOpen}
        onOpenChange={setStepsOpen}
      />
    </>
  );
};

export default NavigationHUD;
