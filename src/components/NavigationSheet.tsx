/**
 * NavigationSheet — draggable bottom sheet showing route preview + turn-by-turn steps.
 */

import { useNavigation } from '@/contexts/NavigationContext';
import { formatDistance, formatDuration, openExternalMaps } from '@/services/navigationService';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Navigation, X, LocateFixed, ExternalLink, Play, Square,
  ArrowUp, ArrowLeft as TurnLeft, ArrowRight as TurnRight,
  CornerUpLeft, CornerUpRight, RotateCcw, MapPin, ArrowUpRight,
  ArrowUpLeft, Milestone,
} from 'lucide-react';

const maneuverIcon = (type: string, modifier?: string) => {
  const cls = "w-4 h-4";
  if (type === 'turn') {
    if (modifier === 'left' || modifier === 'sharp left' || modifier === 'slight left') return <TurnLeft className={cls} />;
    if (modifier === 'right' || modifier === 'sharp right' || modifier === 'slight right') return <TurnRight className={cls} />;
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
  return <Milestone className={cls} />;
};

const NavigationSheet = () => {
  const {
    status, route, destination, steps, currentStepIndex,
    beginLiveNavigation, stopNavigation, recenter,
  } = useNavigation();

  if (status === 'idle' || status === 'loading') return null;

  const isOpen = status === 'previewing' || status === 'navigating';

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) stopNavigation(); }}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-base font-bold text-foreground">
              {status === 'navigating' ? 'Navigating' : 'Route Preview'}
            </DrawerTitle>
            <button
              onClick={stopNavigation}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Route summary */}
          {route && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Navigation className="w-4 h-4 text-routes" />
                {formatDistance(route.distance)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDuration(route.duration)}
              </div>
              {destination && (
                <div className="text-xs text-muted-foreground truncate flex-1">
                  → {destination.title}
                </div>
              )}
            </div>
          )}
        </DrawerHeader>

        {/* Action buttons */}
        <div className="px-4 pb-3 flex gap-2">
          {status === 'previewing' && (
            <Button
              onClick={beginLiveNavigation}
              className="flex-1 gap-2 bg-routes hover:bg-routes/90 text-white"
            >
              <Play className="w-4 h-4" />
              Start Navigation
            </Button>
          )}
          {status === 'navigating' && (
            <>
              <Button
                onClick={recenter}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <LocateFixed className="w-4 h-4" />
              </Button>
              <Button
                onClick={stopNavigation}
                className="flex-1 gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                <Square className="w-4 h-4" />
                Exit Navigation
              </Button>
            </>
          )}
          {destination && (
            <Button
              onClick={() => openExternalMaps(destination)}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Turn-by-turn steps */}
        <ScrollArea className="flex-1 max-h-[40vh]">
          <div className="px-4 pb-4 space-y-1">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  i === currentStepIndex && status === 'navigating'
                    ? 'bg-routes/10 border border-routes/30'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  i === currentStepIndex && status === 'navigating'
                    ? 'bg-routes text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {maneuverIcon(step.maneuver.type, step.maneuver.modifier)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${
                    i === currentStepIndex && status === 'navigating'
                      ? 'font-semibold text-foreground'
                      : 'text-foreground'
                  }`}>
                    {step.instruction}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistance(step.distance)} · {formatDuration(step.duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default NavigationSheet;
