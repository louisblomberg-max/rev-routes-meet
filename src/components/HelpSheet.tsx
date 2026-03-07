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
  KeyRound,
  Wrench,
  AlertTriangle,
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
  { title: 'Locked Out', icon: KeyRound },
  { title: 'Mechanical', icon: Wrench },
  { title: 'Accident', icon: AlertTriangle },
];

/** Maps each SOS issue to the service categories / serviceType keywords that can help */
const issueToServiceMap: Record<string, { categories: string[]; keywords: string[] }> = {
  'Electrical':  { categories: ['Mechanic', 'Garage', 'Specialist'], keywords: ['Diagnostics', 'Servicing', 'Electrical'] },
  'Flat Tyre':   { categories: ['Tyres', 'Garage'], keywords: ['Tyre Fitting', 'Puncture Repair', 'Tyres', 'Balancing'] },
  'Out of Fuel':  { categories: ['Garage', 'Mechanic'], keywords: ['Recovery', 'Fuel'] },
  'Locked Out':   { categories: ['Mechanic', 'Garage', 'Specialist'], keywords: ['Locksmith', 'Recovery'] },
  'Mechanical':   { categories: ['Mechanic', 'Garage', 'Specialist', 'Tuning'], keywords: ['Servicing', 'Engine Rebuild', 'Diagnostics'] },
  'Accident':     { categories: ['Garage', 'Specialist', 'Mechanic'], keywords: ['Body Restoration', 'Paint', 'Recovery'] },
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
    description: 'Community help — fastest response',
    cta: 'Alert Nearby Members',
  },
  {
    id: 'services',
    icon: MapPin,
    title: 'Recovery Services',
    description: 'Professional help — may include fees',
    cta: 'View Recovery Options',
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
            <div className="space-y-2.5">
              {stages.map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl bg-card shadow-soft">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <span className="text-sm font-medium text-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-2.5">
            {stages.map((s, i) => {
              const done = step > i + 1 || (step === 3 && i === 2);
              const active = step === i + 1;
              return (
                <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${done ? 'bg-primary/5' : active ? 'bg-card shadow-soft' : 'bg-card/50'}`}>
                  {active ? <Loader2 className={`w-5 h-5 ${s.color} animate-spin`} /> : done ? <Check className="w-5 h-5 text-primary" /> : <s.icon className={`w-5 h-5 ${s.color}`} />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    {done && <p className="text-xs text-muted-foreground">{s.sub}</p>}
                  </div>
                </div>
              );
            })}
            {step === 3 && (
              <div className="mt-4 p-4 rounded-2xl bg-primary/5 text-center">
                <p className="text-sm font-medium text-primary">Help is on the way. Stay safe.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-5 pt-3">
        {step === 0 ? (
          <Button className="w-full h-12 rounded-[14px] font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleSend}>
            <ShieldAlert className="w-4 h-4 mr-2" /> Send Emergency Alert
          </Button>
        ) : step === 3 ? (
          <Button className="w-full h-12 rounded-[14px] font-semibold" onClick={onClose}>Done</Button>
        ) : null}
      </div>
    </div>
  );
};

/* ── Service Results View ── */
const ServiceResults = ({
  issue,
  services,
  onBack,
  onClose,
}: {
  issue: string;
  services: RevService[];
  onBack: () => void;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const problem = allProblems.find(p => p.title === issue);
  const ProblemIcon = problem?.icon || Wrench;

  const handleServiceTap = (serviceId: string) => {
    onClose();
    navigate(`/services/${serviceId}`);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground truncate flex items-center gap-2">
            <ProblemIcon className="w-4 h-4 text-destructive" />
            {issue} — Recovery
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {services.length} service{services.length !== 1 ? 's' : ''} that can help
          </p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
        {services.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No matching services found</p>
            <p className="text-xs text-muted-foreground mt-1">Try alerting nearby members instead</p>
          </div>
        ) : (
          services.map((svc) => (
            <button
              key={svc.id}
              onClick={() => handleServiceTap(svc.id)}
              className="w-full flex items-start gap-3 p-4 rounded-2xl bg-card shadow-soft hover:shadow-premium transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-services/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-services" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground truncate">{svc.name}</p>
                  {svc.isVerified && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{svc.category} · {svc.distance}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-services fill-services" />
                    <span className="text-[11px] font-semibold text-foreground">{svc.rating}</span>
                    <span className="text-[10px] text-muted-foreground">({svc.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className={`text-[10px] font-semibold ${svc.isOpen ? 'text-green-500' : 'text-destructive'}`}>
                      {svc.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>
                {svc.serviceTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {svc.serviceTypes.slice(0, 3).map(st => (
                      <span key={st} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {st}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground">{svc.distance}</span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="px-5 pb-5 pt-3 space-y-2">
        <Button
          variant="outline"
          className="w-full h-11 rounded-[14px] text-sm font-semibold"
          onClick={() => {
            onClose();
            navigate('/services');
          }}
        >
          Browse All Services
        </Button>
      </div>
    </div>
  );
};

/* ── Main Help Sheet ── */
const HelpSheet = ({ open, onOpenChange }: HelpSheetProps) => {
  const { state } = useData();
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [showStolen, setShowStolen] = useState(false);
  const [showServices, setShowServices] = useState(false);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedProblem(null);
      setSelectedSource(null);
      setDetails('');
      setShowStolen(false);
      setShowServices(false);
    }
    onOpenChange(isOpen);
  };

  const handleConfirm = () => {
    if (selectedSource === 'services' && selectedProblem) {
      setShowServices(true);
      return;
    }
    console.log('Help request:', { problem: selectedProblem, source: selectedSource, details });
    handleClose(false);
  };

  const canConfirm = selectedProblem && selectedSource && details.trim().length > 0;
  const activeSource = helpSources.find((s) => s.id === selectedSource);

  const matchingServices = selectedProblem
    ? getMatchingServices(state.services, selectedProblem)
    : [];

  if (showStolen) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col p-0 gap-0">
          <StolenAlertFlow onClose={() => handleClose(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  if (showServices && selectedProblem) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] flex flex-col p-0 gap-0">
          <ServiceResults
            issue={selectedProblem}
            services={matchingServices}
            onBack={() => setShowServices(false)}
            onClose={() => handleClose(false)}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-2xl flex flex-col p-0 gap-0">

        {/* Header */}
        <div className="px-5 pt-5 pb-2">
          <h2 className="text-lg font-bold text-foreground">Emergency Help</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Tell us what happened</p>
        </div>

        {/* Content */}
        <div className="px-5 pb-4 space-y-4 pt-2">
          {/* Problem Selection (3x2 grid) */}
          <div className="grid grid-cols-3 gap-2">
            {allProblems.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedProblem === p.title;
              return (
                <button
                  key={p.title}
                  onClick={() => setSelectedProblem(p.title)}
                  className={`flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-primary/10 shadow-soft ring-2 ring-primary/30'
                      : 'bg-card shadow-soft hover:shadow-premium'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-primary/15' : 'bg-muted'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>{p.title}</span>
                </button>
              );
            })}
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground">Add details <span className="text-destructive">*</span></p>
            <Textarea
              placeholder="Vehicle, location, and situation details help responders reach you faster."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={`min-h-[70px] text-sm resize-none rounded-[14px] bg-muted border-0 focus:ring-2 focus:ring-primary/30 ${
                details.trim().length > 0 ? 'ring-1 ring-primary/20' : ''
              }`}
            />
          </div>

          {/* Who Should Help? */}
          <div className={`space-y-2 transition-all duration-300 ${selectedProblem ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <p className="text-xs font-semibold text-foreground">Who should help?</p>
            <div className="grid grid-cols-2 gap-2.5">
              {helpSources.map((source) => {
                const Icon = source.icon;
                const isSelected = selectedSource === source.id;
                const serviceCount = source.id === 'services' && selectedProblem
                  ? getMatchingServices(state.services, selectedProblem).length
                  : 0;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSource(source.id)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all text-center ${
                      isSelected
                        ? 'bg-primary/10 shadow-soft ring-2 ring-primary/30'
                        : 'bg-card shadow-soft hover:shadow-premium'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-primary/15' : 'bg-muted'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="text-xs font-bold text-foreground leading-tight">{source.title}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {source.id === 'services' && selectedProblem
                        ? `${serviceCount} matching`
                        : source.description}
                    </p>
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

          {/* Stolen Vehicle Link */}
          <button
            onClick={() => setShowStolen(true)}
            className="w-full flex items-center gap-2.5 p-3 rounded-2xl bg-destructive/8 hover:bg-destructive/12 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-destructive" />
            <span className="text-xs font-semibold text-destructive">Vehicle Stolen? Tap here</span>
            <ArrowRight className="w-3.5 h-3.5 text-destructive/60 ml-auto" />
          </button>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-2">
          <Button
            className="w-full h-12 rounded-[14px] text-sm font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            size="lg"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {canConfirm && activeSource ? (
              <span>{activeSource.cta}</span>
            ) : (
              'Select Issue & Request Help'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HelpSheet;