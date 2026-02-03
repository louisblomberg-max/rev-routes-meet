import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Battery, 
  Fuel, 
  KeyRound, 
  AlertTriangle, 
  Wrench, 
  Phone,
  MapPin,
  Users,
  Check
} from 'lucide-react';

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const helpSources = [
  {
    id: 'members',
    icon: Users,
    title: 'Nearby Members',
    description: 'Get help from RevNet community members near you',
  },
  {
    id: 'services',
    icon: MapPin,
    title: 'Find Services',
    description: 'Locate professional breakdown & recovery services',
  },
];

const problemTypes = [
  {
    icon: Battery,
    title: 'Dead Battery',
    description: 'Need a jump start or battery replacement',
  },
  {
    icon: Car,
    title: 'Flat Tyre',
    description: 'Puncture or tyre blowout',
  },
  {
    icon: Fuel,
    title: 'Out of Fuel',
    description: 'Run out of petrol or diesel',
  },
  {
    icon: KeyRound,
    title: 'Locked Out',
    description: 'Keys locked inside vehicle',
  },
  {
    icon: Wrench,
    title: 'Mechanical Issue',
    description: 'Engine, brakes, or other problems',
  },
  {
    icon: AlertTriangle,
    title: 'Accident',
    description: 'Collision or vehicle damage',
  },
];

const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  const handleConfirm = () => {
    // Future: Submit help request
    console.log('Help request:', { source: selectedSource, problem: selectedProblem });
    onOpenChange(false);
    setSelectedSource(null);
    setSelectedProblem(null);
  };

  const canConfirm = selectedSource && selectedProblem;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] flex flex-col">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Need Help?
          </SheetTitle>
          <SheetDescription>
            Select who you want help from and what's happened
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-5">
          {/* Emergency Notice */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <Phone className="w-4 h-4" />
              <span>In an emergency, always call 999 first</span>
            </div>
          </div>

          {/* Step 1: Help Source */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
              Who do you want help from?
            </p>
            <div className="grid gap-2">
              {helpSources.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border bg-card hover:bg-accent/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{source.title}</p>
                      <p className="text-xs text-muted-foreground">{source.description}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Problem Type */}
          <div className={`space-y-2 transition-opacity ${selectedSource ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
              What's the problem?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {problemTypes.map((problem) => {
                const Icon = problem.icon;
                const isSelected = selectedProblem === problem.title;
                return (
                  <button
                    key={problem.title}
                    onClick={() => setSelectedProblem(problem.title)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border bg-card hover:bg-accent/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="text-xs font-medium text-foreground">{problem.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="pt-4 border-t mt-4">
          <Button 
            className="w-full" 
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {canConfirm ? 'Request Help' : 'Select options above'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;
