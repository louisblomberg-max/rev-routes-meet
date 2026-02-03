import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
  ArrowRight,
  Heart,
  Bell,
  ShieldAlert,
  Radio,
  MapPinned,
  Loader2
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
  const [isAvailableToHelp, setIsAvailableToHelp] = useState(false);
  const [helpDistance, setHelpDistance] = useState(10);
  const [stolenAlertActive, setStolenAlertActive] = useState(false);
  const [stolenAlertStep, setStolenAlertStep] = useState(0);
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
      setStolenAlertActive(false);
      setStolenAlertStep(0);
    }
    onOpenChange(isOpen);
  };

  const handleStolenAlert = () => {
    setStolenAlertStep(1);
    // Simulate alerting nearby members
    setTimeout(() => setStolenAlertStep(2), 1500);
    // Simulate contacting emergency services
    setTimeout(() => setStolenAlertStep(3), 3000);
  };

  const canConfirm = selectedSource && selectedProblem;

  // Stolen Vehicle Alert Flow
  if (stolenAlertActive) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="rounded-t-[28px] max-h-[90vh] flex flex-col p-0 gap-0">
          <div className="bg-gradient-to-br from-red-600 to-red-700 px-6 pt-6 pb-5 rounded-t-[28px]">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-1 bg-white/30 rounded-full" />
            </div>
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-3 text-xl text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                Vehicle Stolen Alert
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {stolenAlertStep === 0 ? (
              <>
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Report Vehicle Theft</h3>
                  <p className="text-sm text-muted-foreground">
                    This will immediately alert all RevNet members within 10 miles and notify emergency services.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Radio className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Broadcast Alert</p>
                      <p className="text-xs text-muted-foreground">12 members nearby will be notified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <MapPinned className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Share Location</p>
                      <p className="text-xs text-muted-foreground">Your current location will be shared</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Emergency Services</p>
                      <p className="text-xs text-muted-foreground">999 will be contacted automatically</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {stolenAlertStep === 3 ? 'Alert Sent!' : 'Sending Alert...'}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    stolenAlertStep >= 1 ? 'bg-blue-50 border-blue-200' : 'bg-muted/50 border-border'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      stolenAlertStep >= 2 ? 'bg-blue-600' : 'bg-blue-100'
                    }`}>
                      {stolenAlertStep === 1 ? (
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      ) : stolenAlertStep >= 2 ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Radio className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Alerting Nearby Members</p>
                      <p className="text-xs text-muted-foreground">
                        {stolenAlertStep >= 2 ? '12 members notified' : 'Broadcasting to 12 members...'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    stolenAlertStep >= 2 ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/50 border-border'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      stolenAlertStep >= 3 ? 'bg-emerald-600' : 'bg-emerald-100'
                    }`}>
                      {stolenAlertStep === 2 ? (
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                      ) : stolenAlertStep >= 3 ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <MapPinned className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Location Shared</p>
                      <p className="text-xs text-muted-foreground">
                        {stolenAlertStep >= 3 ? 'GPS coordinates sent' : 'Sharing your location...'}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    stolenAlertStep >= 3 ? 'bg-red-50 border-red-200' : 'bg-muted/50 border-border'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      stolenAlertStep >= 3 ? 'bg-red-600' : 'bg-red-100'
                    }`}>
                      {stolenAlertStep >= 3 ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <Phone className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Emergency Services</p>
                      <p className="text-xs text-muted-foreground">
                        {stolenAlertStep >= 3 ? '999 contacted' : 'Waiting...'}
                      </p>
                    </div>
                  </div>
                </div>

                {stolenAlertStep === 3 && (
                  <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
                    <p className="text-sm font-medium text-green-800">
                      Help is on the way. Stay safe and wait for authorities.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-5 pt-3 border-t bg-background/80 backdrop-blur-sm">
            {stolenAlertStep === 0 ? (
              <div className="space-y-2">
                <Button 
                  className="w-full h-12 rounded-xl text-base font-semibold bg-red-600 hover:bg-red-700"
                  size="lg"
                  onClick={handleStolenAlert}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Send Emergency Alert
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStolenAlertActive(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : stolenAlertStep === 3 ? (
              <Button 
                className="w-full h-12 rounded-xl text-base font-semibold"
                size="lg"
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

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

          {/* Stolen Vehicle Button - Critical Action */}
          <button 
            onClick={() => setStolenAlertActive(true)}
            className="mt-3 w-full flex items-center justify-between gap-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl px-4 py-3 transition-all group border border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Vehicle Stolen?</p>
                <p className="text-[11px] text-white/70">Alert nearby members & emergency services</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Available to Help Toggle - Prominent Section */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isAvailableToHelp 
                      ? 'bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25' 
                      : 'bg-muted'
                  }`}>
                    <Heart className={`w-5 h-5 transition-colors ${isAvailableToHelp ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Available to Help</p>
                    <p className="text-xs text-muted-foreground">Get notified when others need help nearby</p>
                  </div>
                </div>
                <Switch 
                  checked={isAvailableToHelp} 
                  onCheckedChange={setIsAvailableToHelp}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              {isAvailableToHelp && (
                <div className="mt-4 space-y-3 pt-3 border-t border-primary/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Distance willing to travel</span>
                    <span className="text-sm font-semibold text-primary">{helpDistance} miles</span>
                  </div>
                  <Slider
                    value={[helpDistance]}
                    onValueChange={(value) => setHelpDistance(value[0])}
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>1 mile</span>
                    <span>50 miles</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 rounded-lg px-3 py-2">
                    <Bell className="w-3.5 h-3.5" />
                    <span>You'll receive alerts for help requests within {helpDistance} miles</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Need help yourself?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

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
