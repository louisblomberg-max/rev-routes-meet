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
  ChevronRight
} from 'lucide-react';

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const problemTypes = [
  {
    icon: Battery,
    title: 'Dead Battery',
    description: 'Need a jump start or battery replacement',
    color: 'bg-amber-500',
  },
  {
    icon: Car,
    title: 'Flat Tyre',
    description: 'Puncture or tyre blowout',
    color: 'bg-blue-500',
  },
  {
    icon: Fuel,
    title: 'Out of Fuel',
    description: 'Run out of petrol or diesel',
    color: 'bg-orange-500',
  },
  {
    icon: KeyRound,
    title: 'Locked Out',
    description: 'Keys locked inside vehicle',
    color: 'bg-purple-500',
  },
  {
    icon: Wrench,
    title: 'Mechanical Issue',
    description: 'Engine, brakes, or other problems',
    color: 'bg-slate-500',
  },
  {
    icon: AlertTriangle,
    title: 'Accident',
    description: 'Collision or vehicle damage',
    color: 'bg-red-500',
  },
];

const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  const handleProblemSelect = (title: string) => {
    setSelectedProblem(title);
    // Future: Navigate to help request flow
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Need Help?
          </SheetTitle>
          <SheetDescription>
            Select what's happened and we'll connect you with nearby help
          </SheetDescription>
        </SheetHeader>

        {/* Emergency Notice */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
            <Phone className="w-4 h-4" />
            <span>In an emergency, always call 999 first</span>
          </div>
        </div>

        {/* Problem Types Grid */}
        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-muted-foreground">What's the problem?</p>
          <div className="grid gap-2">
            {problemTypes.map((problem) => {
              const Icon = problem.icon;
              return (
                <button
                  key={problem.title}
                  onClick={() => handleProblemSelect(problem.title)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedProblem === problem.title
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-accent/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${problem.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{problem.title}</p>
                    <p className="text-xs text-muted-foreground">{problem.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Help Options */}
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium text-muted-foreground">Or get help from...</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-xs">Nearby Members</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex-col gap-1">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-xs">Find Services</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;
