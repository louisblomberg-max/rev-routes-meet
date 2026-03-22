import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Star,
  Clock,
  ChevronLeft,
  Zap,
  CircleDot,
  Fuel,
  Key,
  Wrench,
  AlertTriangle,
  Car,
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import type { RevService } from '@/models';

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allProblems = [
  { title: 'Electrical', icon: Zap },
  { title: 'Flat Tyre', icon: CircleDot },
  { title: 'Out of Fuel', icon: Fuel },
  { title: 'Locked Out', icon: Key },
  { title: 'Mechanical', icon: Wrench },
  { title: 'Accident', icon: AlertTriangle },
];

/** Maps each SOS issue to the service categories / serviceType keywords that can help */
const issueToServiceMap: Record<string, { categories: string[]; keywords: string[] }> = {
  'Electrical':  { categories: ['Garages & Mechanics', 'Vehicle Servicing', 'Tuning & Performance'], keywords: ['Diagnostics', 'Servicing', 'Electrical'] },
  'Flat Tyre':   { categories: ['Tyres & Wheels', 'Garages & Mechanics', 'Recovery & Roadside Assistance'], keywords: ['Tyre Fitting', 'Puncture Repair', 'Tyres', 'Balancing'] },
  'Out of Fuel':  { categories: ['Recovery & Roadside Assistance', 'Garages & Mechanics'], keywords: ['Recovery', 'Fuel'] },
  'Locked Out':   { categories: ['Recovery & Roadside Assistance', 'Garages & Mechanics'], keywords: ['Locksmith', 'Recovery'] },
  'Mechanical':   { categories: ['Garages & Mechanics', 'Vehicle Servicing', 'Tuning & Performance'], keywords: ['Servicing', 'Engine Rebuild', 'Diagnostics'] },
  'Accident':     { categories: ['Recovery & Roadside Assistance', 'Bodywork & Paint', 'Garages & Mechanics'], keywords: ['Body Restoration', 'Paint', 'Recovery'] },
};

function getMatchingServices(services: RevService[], issue: string): RevService[] {
  const mapping = issueToServiceMap[issue];
  if (!mapping) return services;

  const scored = services.map(svc => {
    let score = 0;
    if (mapping.categories.includes(svc.category)) score += 2;
    const svcKeywords = [...svc.serviceTypes, ...svc.tags];
    for (const kw of mapping.keywords) {
      if (svcKeywords.some(sk => sk.toLowerCase().includes(kw.toLowerCase()))) score += 1;
    }
    return { svc, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score || b.svc.rating - a.svc.rating)
    .map(s => s.svc);
}

const helpSources = [
  {
    id: 'members',
    icon: Users,
    title: 'Nearby Members',
    description: 'Broadcasts to members with "Available to Help" on',
    colorClass: 'bg-routes',
    cta: 'Alert Nearby Members',
  },
  {
    id: 'services',
    icon: MapPin,
    title: 'Recovery Services',
    description: 'Pans to map with matching services for your issue',
    colorClass: 'bg-services',
    cta: 'View Recovery Services',
  },
];

/* ── Stolen Vehicle Alert Sub-flow ── */
const StolenAlertFlow = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleSend = () => {
    setStep(1);
    setTimeout(() => setStep(2), 1500);
    setTimeout(() => setStep(3), 3000);
  };

  const stages = [
    { label: 'Alerting all members within 50 miles', sub: 'Broadcast sent to nearby members', icon: Radio, color: 'text-routes' },
    { label: 'Sharing your GPS location', sub: 'GPS coordinates shared with responders', icon: MapPinned, color: 'text-services' },
    { label: 'Contacting 999', sub: '999 emergency services contacted', icon: Phone, color: 'text-destructive' },
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
              This will immediately alert <span className="font-semibold text-foreground">all RevNet members within 50 miles</span> and contact emergency services.
            </p>
            <div className="space-y-2">
              {stages.map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Your vehicle will be added to the RevNet Stolen Vehicle Alert list, visible to all members nearby.
            </p>
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
          </div>
        )}
      </div>
      <div className="p-5 pt-3 border-t border-border space-y-2">
        {step === 0 ? (
          <Button className="w-full h-12 rounded-xl font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleSend}>
            <ShieldAlert className="w-4 h-4 mr-2" /> Send Emergency Alert
          </Button>
        ) : step === 3 ? (
          <div className="space-y-2">
            <Button className="w-full h-12 rounded-xl font-semibold" onClick={onClose}>Done</Button>
            <Button
              variant="outline"
              className="w-full h-10 rounded-xl text-sm font-semibold"
              onClick={() => { onClose(); navigate('/stolen-vehicles'); }}
            >
              <Car className="w-4 h-4 mr-2" /> View Stolen Vehicle Alerts
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ── Main Help Sheet ── */
const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const { state } = useData();
  const navigate = useNavigate();
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
    if (selectedSource === 'services' && selectedProblem) {
      // Close sheet and navigate to map with services category active
      handleClose(false);
      navigate('/', { state: { category: 'services', sosIssue: selectedProblem } });
      return;
    }
    // "Nearby Members" flow — broadcasts to users with 'available to help' on
    console.log('Help request (broadcast to available-to-help members):', { problem: selectedProblem, source: selectedSource, details });
    handleClose(false);
  };

  const canConfirm = selectedProblem && selectedSource && details.trim().length > 0;
  const activeSource = helpSources.find((s) => s.id === selectedSource);

  const matchingServices = selectedProblem
    ? getMatchingServices(state.services, selectedProblem)
    : [];

  /* ── Stolen sub-flow ── */
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
      <SheetContent side="bottom" className="rounded-t-2xl flex flex-col p-0 gap-0">

        {/* ── Header ── */}
        <div className="px-4 pt-3 pb-1">
          <h2 className="text-lg font-bold text-foreground">What's up?</h2>
          <p className="text-xs text-muted-foreground">Tell us what's happened.</p>
        </div>

        {/* ── Content ── */}
        <div className="px-4 pb-3 space-y-3 pt-2">
          {/* ── Problem Selection (3×2 grid) ── */}
          <div className="grid grid-cols-3 gap-1.5">
            {allProblems.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.title}
                  onClick={() => setSelectedProblem(p.title)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1.5 rounded-lg border-2 transition-all ${
                    selectedProblem === p.title
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:border-primary/30'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${selectedProblem === p.title ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-[10px] font-semibold text-foreground leading-tight">{p.title}</span>
                </button>
              );
            })}
          </div>

          {/* ── Details (Required) ── */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-foreground">Add details <span className="text-destructive">*</span></p>
            <Textarea
              placeholder="Vehicle, location, what you see — helps responders find you fast..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={`min-h-[60px] text-xs resize-none rounded-lg border-2 bg-muted/30 ${
                details.trim().length === 0 ? 'border-border focus:border-primary' : 'border-primary/40 focus:border-primary'
              }`}
            />
          </div>

          {/* ── Who Should Help? (side by side) ── */}
          <div className={`space-y-1.5 transition-all duration-300 ${selectedProblem ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <p className="text-xs font-semibold text-foreground">Who should help?</p>
            <div className="grid grid-cols-2 gap-1.5">
              {helpSources.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;
                const serviceCount = source.id === 'services' && selectedProblem
                  ? matchingServices.length
                  : 0;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all text-center ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-md ${source.colorClass} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-[11px] font-bold text-foreground leading-tight">{source.title}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      {source.id === 'services' && selectedProblem
                        ? `${serviceCount} matching service${serviceCount !== 1 ? 's' : ''}`
                        : source.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Vehicle Stolen Button (bigger, prominent) ── */}
          <button
            onClick={() => setShowStolen(true)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-destructive/10 border-2 border-destructive/30 hover:bg-destructive/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-sm font-bold text-destructive">Vehicle Stolen?</span>
              <p className="text-[10px] text-destructive/70">Alerts all members within 50 miles</p>
            </div>
            <ArrowRight className="w-4 h-4 text-destructive/60 shrink-0" />
          </button>

          <button
            onClick={() => { handleClose(false); navigate('/stolen-vehicles'); }}
            className="w-full text-center py-2 text-xs font-semibold text-destructive/70 hover:text-destructive transition-colors"
          >
            View Stolen Vehicle Alerts
          </button>
        </div>

        {/* ── Dynamic CTA ── */}
        <div className="px-4 pb-4 pt-2 border-t border-border">
          <Button
            className="w-full h-11 rounded-xl text-sm font-semibold"
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
