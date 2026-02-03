import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Check,
  MessageSquare,
  ArrowRight
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
    description: 'Community members near you',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'services',
    icon: MapPin,
    title: 'Recovery Services',
    description: 'Professional breakdown help',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

const problemTypes = [
  { icon: Battery, title: 'Dead Battery', emoji: '🔋' },
  { icon: Car, title: 'Flat Tyre', emoji: '🛞' },
  { icon: Fuel, title: 'Out of Fuel', emoji: '⛽' },
  { icon: KeyRound, title: 'Locked Out', emoji: '🔑' },
  { icon: Wrench, title: 'Mechanical', emoji: '🔧' },
  { icon: AlertTriangle, title: 'Accident', emoji: '⚠️' },
];

const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const handleConfirm = () => {
    console.log('Help request:', { source: selectedSource, problem: selectedProblem, details });
    onOpenChange(false);
    setSelectedSource(null);
    setSelectedProblem(null);
    setDetails('');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedSource(null);
      setSelectedProblem(null);
      setDetails('');
    }
    onOpenChange(isOpen);
  };

  const canConfirm = selectedSource && selectedProblem;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-[28px] max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-destructive/90 to-destructive px-6 pt-6 pb-5 rounded-t-[28px]">
          <div className="flex items-center justify-center mb-3">
            <div className="w-10 h-1 bg-white/30 rounded-full" />
          </div>
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-3 text-xl text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              Need Help?
            </SheetTitle>
          </SheetHeader>
          
          {/* Emergency Notice */}
          <div className="mt-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2.5">
            <Phone className="w-4 h-4 text-white" />
            <span className="text-sm text-white/90">In an emergency, call <span className="font-bold">999</span> first</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Step 1: Help Source */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-sm">1</span>
              <p className="text-sm font-semibold text-foreground">Who should help you?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {helpSources.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center overflow-hidden ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${source.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{source.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{source.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Problem Type */}
          <div className={`space-y-3 transition-all duration-300 ${selectedSource ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2 pointer-events-none'}`}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shadow-sm">2</span>
              <p className="text-sm font-semibold text-foreground">What's the issue?</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {problemTypes.map((problem) => {
                const isSelected = selectedProblem === problem.title;
                return (
                  <button
                    key={problem.title}
                    onClick={() => setSelectedProblem(problem.title)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <span className="text-2xl">{problem.emoji}</span>
                    <p className="text-[11px] font-medium text-foreground leading-tight">{problem.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Additional Details (Optional) */}
          <div className={`space-y-3 transition-all duration-300 ${selectedProblem ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-2 pointer-events-none'}`}>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center">
                <MessageSquare className="w-3 h-3" />
              </span>
              <p className="text-sm font-semibold text-foreground">Add details <span className="font-normal text-muted-foreground">(optional)</span></p>
            </div>
            <Textarea
              placeholder="E.g. I'm on the A34 near junction 9, silver BMW 3 series..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[80px] resize-none rounded-xl border-2 focus:border-primary bg-muted/30"
            />
          </div>
        </div>

        {/* Confirm Button */}
        <div className="p-5 pt-3 border-t bg-background/80 backdrop-blur-sm">
          <Button 
            className="w-full h-12 rounded-xl text-base font-semibold shadow-lg"
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {canConfirm ? (
              <>
                Request Help
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'Complete the steps above'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;
