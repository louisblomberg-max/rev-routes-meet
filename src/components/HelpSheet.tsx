import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  ArrowRight,
  ShieldAlert,
  Loader2,
  Check,
  Radio,
  MapPinned,
  X,
  Users,
  MapPin,
  Phone,
} from 'lucide-react';

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allProblems = [
  { title: 'Dead Battery', emoji: '🔋' },
  { title: 'Flat Tyre', emoji: '🛞' },
  { title: 'Out of Fuel', emoji: '⛽' },
  { title: 'Locked Out', emoji: '🔑' },
  { title: 'Mechanical', emoji: '🔧' },
  { title: 'Accident', emoji: '⚠️' },
];

const helpSources = [
  {
    id: 'members',
    icon: Users,
    title: 'Nearby Members',
    description: 'Community help – fastest response',
    colorClass: 'bg-routes',
    cta: '🚨 Alert Nearby Members',
  },
  {
    id: 'services',
    icon: MapPin,
    title: 'Recovery Services',
    description: 'Professional help – may include fees',
    colorClass: 'bg-services',
    cta: '📍 View Recovery Options',
  },
];

/* ── Stolen Vehicle Alert Sub-flow ── */
const StolenAlertFlow = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);

  const handleSend = () => {
    setStep(1);
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
  };

  const stages = [
    { label: 'Alerting nearby members', sub: '12 members notified', icon: Radio, color: 'text-routes' },
    { label: 'Sharing your location', sub: 'GPS coordinates sent', icon: MapPinned, color: 'text-services' },
    { label: 'Contacting 999', sub: '999 contacted', icon: Phone, color: 'text-destructive' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-destructive flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Vehicle Stolen
        </h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 px-5 py-4 space-y-4">
        {step === 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              This will immediately alert all RevNet members nearby and contact emergency services.
            </p>
            <div className="space-y-2">
              {stages.map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {stages.map((s, i) => {
              const done = step > i + 1 || (step === 3 && i === 2);
              const active = step === i + 1;
              return (
                <div key={s.label} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'bg-primary/5 border-primary/20' : active ? 'bg-muted border-primary/30' : 'bg-muted/50 border-border'}`}>
                  {active ? <Loader2 className={`w-5 h-5 ${s.color} animate-spin`} /> : done ? <Check className="w-5 h-5 text-primary" /> : <s.icon className={`w-5 h-5 ${s.color}`} />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    {done && <p className="text-xs text-muted-foreground">{s.sub}</p>}
                  </div>
                </div>
              );
            })}
            {step === 3 && (
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <p className="text-sm font-medium text-primary">Help is on the way. Stay safe.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-5 pt-3 border-t border-border">
        {step === 0 ? (
          <Button className="w-full h-12 rounded-xl font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleSend}>
            <ShieldAlert className="w-4 h-4 mr-2" /> Send Emergency Alert
          </Button>
        ) : step === 3 ? (
          <Button className="w-full h-12 rounded-xl font-semibold" onClick={onClose}>Done</Button>
        ) : null}
      </div>
    </div>
  );
};

/* ── Main Help Sheet ── */
const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [showStolen, setShowStolen] = useState(false);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedProblem(null);
      setSelectedSource(null);
      setDetails('');
      
      setShowStolen(false);
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    console.log('Help request:', { problem: selectedProblem, source: selectedSource, details });
    handleClose(false);
  };

  const canConfirm = selectedProblem && selectedSource && details.trim().length > 0;
  const activeSource = helpSources.find((s) => s.id === selectedSource);

  if (showStolen) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col p-0 gap-0">
          <StolenAlertFlow onClose={() => handleClose(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] flex flex-col p-0 gap-0">

        {/* ── 2. Header ── */}
        <div className="px-5 pt-4 pb-1">
          <h2 className="text-xl font-bold text-foreground">What's up?</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Tell us what's happened.</p>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5 pt-3">
          {/* ── 3. Problem Selection (3×2 grid) ── */}
          <div className="grid grid-cols-3 gap-2">
            {allProblems.map((p) => (
              <button
                key={p.title}
                onClick={() => setSelectedProblem(p.title)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                  selectedProblem === p.title
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="text-xl leading-none">{p.emoji}</span>
                <span className="text-xs font-semibold text-foreground leading-tight">{p.title}</span>
              </button>
            ))}
          </div>

          {/* ── 4. Details (Required) ── */}
          <div className="space-y-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Describe what happened <span className="text-destructive">*</span></p>
              <p className="text-xs text-muted-foreground mt-0.5">The more detail you provide, the faster help can reach you.</p>
            </div>
            <Textarea
              placeholder="E.g. Silver BMW 3 Series on the A34 northbound, just past junction 9. Front left tyre is flat, pulled over on the hard shoulder..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={`min-h-[90px] resize-none rounded-xl border-2 bg-muted/30 ${
                details.trim().length === 0 ? 'border-border focus:border-primary' : 'border-primary/40 focus:border-primary'
              }`}
            />
            {details.trim().length === 0 && selectedProblem && (
              <p className="text-[11px] text-muted-foreground">
                💡 Include your vehicle, location, and what you see — it helps responders find you quickly.
              </p>
            )}
          </div>

          {/* ── 5. Who Should Help? ── */}
          <div className={`space-y-2.5 transition-all duration-300 ${selectedProblem ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <p className="text-sm font-semibold text-foreground">Who should help?</p>
            <div className="space-y-2">
              {helpSources.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all w-full text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${source.colorClass} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{source.title}</p>
                      <p className="text-xs text-muted-foreground">{source.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Stolen Vehicle Link ── */}
          <button
            onClick={() => setShowStolen(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive">Vehicle Stolen? Tap here</span>
            <ArrowRight className="w-3.5 h-3.5 text-destructive/60 ml-auto" />
          </button>
        </div>

        {/* ── 7. Dynamic CTA ── */}
        <div className="p-5 pt-3 border-t border-border">
          <Button
            className="w-full h-12 rounded-xl text-base font-semibold"
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {canConfirm && activeSource ? (
              <span>{activeSource.cta}</span>
            ) : (
              'Select an issue & help source'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;
