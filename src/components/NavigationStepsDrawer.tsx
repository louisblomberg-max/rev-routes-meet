/**
 * NavigationStepsDrawer — expandable list of all turn-by-turn steps.
 * Tapping a step sets it as active (for map zoom).
 */

import { useNavigation } from '@/contexts/NavigationContext';
import { formatDistance, formatDuration } from '@/services/navigationService';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowUp, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight,
  RotateCcw, MapPin, Navigation, ArrowUpRight, ArrowUpLeft, Milestone,
} from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getIcon = (type: string, modifier?: string) => {
  const cls = 'w-4 h-4';
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
  return <ArrowUp className={cls} />;
};

const NavigationStepsDrawer = ({ open, onOpenChange }: Props) => {
  const { steps, currentStepIndex, status, setActiveStep } = useNavigation();

  const handleStepTap = (index: number) => {
    setActiveStep(index);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[70vh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base font-bold text-foreground">
            Route Steps ({steps.length})
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 max-h-[55vh]">
          <div className="px-4 pb-4 space-y-1">
            {steps.map((step, i) => {
              const isActive = i === currentStepIndex && status === 'navigating';
              return (
                <button
                  key={i}
                  onClick={() => handleStepTap(i)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-routes/10 border border-routes/30'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-routes text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getIcon(step.maneuver.type, step.maneuver.modifier)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${isActive ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                      {step.instruction}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistance(step.distance)} · {formatDuration(step.duration)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default NavigationStepsDrawer;
