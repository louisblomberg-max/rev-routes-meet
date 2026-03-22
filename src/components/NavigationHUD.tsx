/**
 * NavigationHUD — full-screen navigation overlay.
 * Handles: route preview, active turn-by-turn, arrived state.
 * Layout: top instruction banner, right floating controls, bottom trip card.
 */

import { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { formatDistance, formatDuration } from '@/services/navigationService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NavigationStepsDrawer from '@/components/NavigationStepsDrawer';
import ShareLiveLocationModal from '@/components/ShareLiveLocationModal';
import {
  Navigation, X, LocateFixed, Volume2, VolumeX,
  ArrowUp, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight,
  RotateCcw, MapPin, ArrowUpRight, ArrowUpLeft,
  List, Play, Layers, Radio, CheckCircle2, Clock,
  Route as RouteIcon, ChevronDown,
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

const TYPE_LABELS: Record<string, string> = {
  events: 'Event', routes: 'Route', services: 'Service', clubs: 'Club',
};

const TYPE_COLORS: Record<string, string> = {
  events: 'bg-events/10 text-events border-events/20',
  routes: 'bg-routes/10 text-routes border-routes/20',
  services: 'bg-services/10 text-services border-services/20',
  clubs: 'bg-clubs/10 text-clubs border-clubs/20',
};

const NavigationHUD = () => {
  const {
    status, route, destination, steps, currentStepIndex,
    distanceRemainingMeters, etaSeconds, muted, isOverviewMode,
    liveSharing, cameraFollowMode,
    beginLiveNavigation, stopNavigation, recenter, toggleMute,
    toggleOverview, setActiveStep,
  } = useNavigation();
  const [stepsOpen, setStepsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  if (status === 'idle' || status === 'loading') return null;

  const currentStep = steps[currentStepIndex];
  const isNavigating = status === 'navigating';
  const isPreviewing = status === 'previewing';
  const hasArrived = status === 'arrived';
  const destType = destination?.itemType || 'routes';

  return (
    <>
      {/* ═══ TOP: Turn-by-turn instruction banner (navigating only) ═══ */}
      {isNavigating && currentStep && (
        <div className="fixed top-0 left-0 right-0 z-50 safe-top animate-fade-down">
          <div className="mx-3 mt-2 bg-routes rounded-2xl p-4 shadow-lg">
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
        </div>
      )}

      {/* ═══ RIGHT: Floating controls (navigating only) ═══ */}
      {isNavigating && (
        <div className="fixed right-3 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 animate-fade-up">
          {/* Recenter */}
          {cameraFollowMode === 'free' && (
            <button
              onClick={recenter}
              className="w-11 h-11 rounded-xl bg-card/95 backdrop-blur-md shadow-md border border-border/50 flex items-center justify-center hover:bg-card active:scale-90 transition-all"
              aria-label="Recenter"
            >
              <LocateFixed className="w-[18px] h-[18px] text-routes" />
            </button>
          )}

          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="w-11 h-11 rounded-xl bg-card/95 backdrop-blur-md shadow-md border border-border/50 flex items-center justify-center hover:bg-card active:scale-90 transition-all"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <VolumeX className="w-[18px] h-[18px] text-muted-foreground" />
            ) : (
              <Volume2 className="w-[18px] h-[18px] text-foreground" />
            )}
          </button>

          {/* Overview */}
          <button
            onClick={toggleOverview}
            className={`w-11 h-11 rounded-xl backdrop-blur-md shadow-md border flex items-center justify-center hover:bg-card active:scale-90 transition-all ${
              isOverviewMode ? 'bg-routes/10 border-routes/30' : 'bg-card/95 border-border/50'
            }`}
            aria-label="Overview"
          >
            <Layers className={`w-[18px] h-[18px] ${isOverviewMode ? 'text-routes' : 'text-foreground'}`} />
          </button>

          {/* Share live location */}
          <button
            onClick={() => setShareOpen(true)}
            className={`w-11 h-11 rounded-xl backdrop-blur-md shadow-md border flex items-center justify-center hover:bg-card active:scale-90 transition-all ${
              liveSharing.isSharing ? 'bg-routes/10 border-routes/30' : 'bg-card/95 border-border/50'
            }`}
            aria-label="Share live location"
          >
            <Radio className={`w-[18px] h-[18px] ${liveSharing.isSharing ? 'text-routes' : 'text-foreground'}`} />
          </button>

          {/* Steps list */}
          <button
            onClick={() => setStepsOpen(true)}
            className="w-11 h-11 rounded-xl bg-card/95 backdrop-blur-md shadow-md border border-border/50 flex items-center justify-center hover:bg-card active:scale-90 transition-all"
            aria-label="Route steps"
          >
            <List className="w-[18px] h-[18px] text-foreground" />
          </button>
        </div>
      )}

      {/* ═══ BOTTOM: Trip card / preview / arrived ═══ */}
      <div className="fixed left-0 right-0 bottom-0 z-50 animate-slide-up">
        {/* Live sharing indicator */}
        {liveSharing.isSharing && (isNavigating || isPreviewing) && (
          <div className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 bg-routes/10 backdrop-blur-md rounded-xl border border-routes/20">
            <div className="w-2 h-2 rounded-full bg-routes animate-pulse" />
            <span className="text-xs font-medium text-routes">
              Sharing live location
              {liveSharing.recipients.length > 0 && ` with ${liveSharing.recipients.length} group${liveSharing.recipients.length > 1 ? 's' : ''}`}
            </span>
          </div>
        )}

        {/* ── Arrived state ── */}
        {hasArrived && (
          <div className="mx-3 mb-2 bg-card rounded-2xl p-5 shadow-lg border border-border/50">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">You've arrived!</p>
                <p className="text-sm text-muted-foreground mt-0.5">{destination?.title}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Route preview card ── */}
        {isPreviewing && route && (
          <div className="mx-3 mb-2 bg-card rounded-2xl p-4 shadow-lg border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-routes/10 flex items-center justify-center shrink-0">
                <Navigation className="w-6 h-6 text-routes" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-foreground truncate">
                    {destination?.title || 'Route Preview'}
                  </p>
                  {destination?.itemType && (
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${TYPE_COLORS[destType]}`}>
                      {TYPE_LABELS[destType]}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <RouteIcon className="w-3.5 h-3.5" />
                    {formatDistance(route.distance)}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(route.duration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Share toggle */}
            <button
              onClick={() => setShareOpen(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 mb-3 hover:bg-muted transition-colors"
            >
              <Radio className={`w-4 h-4 ${liveSharing.isSharing ? 'text-routes' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium text-foreground">
                {liveSharing.isSharing ? 'Live sharing active' : 'Share live location'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
            </button>
          </div>
        )}

        {/* ── Navigating trip card ── */}
        {isNavigating && (
          <div className="mx-3 mb-2 bg-card rounded-2xl p-4 shadow-lg border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-routes/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-routes" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {destination?.title}
                </p>
                {destination?.itemType && (
                  <Badge variant="outline" className={`text-[10px] mt-0.5 ${TYPE_COLORS[destType]}`}>
                    {TYPE_LABELS[destType]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
                <p className="text-lg font-bold text-foreground">{formatDuration(etaSeconds)}</p>
                <p className="text-[10px] text-muted-foreground font-medium">ETA</p>
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
                <p className="text-lg font-bold text-foreground">{formatDistance(distanceRemainingMeters)}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Distance</p>
              </div>
              <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
                <p className="text-lg font-bold text-foreground">{formatDuration(etaSeconds)}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Time left</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom action bar ── */}
        <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 safe-bottom">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex gap-2">
              {isPreviewing && (
                <>
                  <Button
                    onClick={beginLiveNavigation}
                    className="flex-1 gap-2 bg-routes hover:bg-routes/90 text-white py-5 text-base font-semibold"
                  >
                    <Play className="w-5 h-5" />
                    Start Navigation
                  </Button>
                  <Button
                    onClick={stopNavigation}
                    variant="outline"
                    size="icon"
                    className="shrink-0 h-12 w-12"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </>
              )}

              {isNavigating && (
                <Button
                  onClick={stopNavigation}
                  variant="destructive"
                  className="flex-1 gap-2 py-5 text-base font-semibold"
                >
                  <X className="w-5 h-5" />
                  End Navigation
                </Button>
              )}

              {hasArrived && (
                <Button
                  onClick={stopNavigation}
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-5 text-base font-semibold"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Done
                </Button>
              )}

              {/* Steps button (preview only) */}
              {isPreviewing && (
                <Button
                  onClick={() => setStepsOpen(true)}
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-12 w-12"
                >
                  <List className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Drawers ═══ */}
      <NavigationStepsDrawer open={stepsOpen} onOpenChange={setStepsOpen} />
      <ShareLiveLocationModal open={shareOpen} onOpenChange={setShareOpen} />
    </>
  );
};

export default NavigationHUD;
