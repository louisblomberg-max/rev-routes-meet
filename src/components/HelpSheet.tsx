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
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import type { RevService } from '@/models';

interface HelpSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allProblems = [
  { title: 'Electrical', emoji: '⚡' },
  { title: 'Flat Tyre', emoji: '🛞' },
  { title: 'Out of Fuel', emoji: '⛽' },
  { title: 'Locked Out', emoji: '🔑' },
  { title: 'Mechanical', emoji: '🔧' },
  { title: 'Accident', emoji: '⚠️' },
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

  // Score services by relevance
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

  const handleServiceTap = (serviceId: string) => {
    onClose();
    navigate(`/services/${serviceId}`);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-border">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground truncate">
            {problem?.emoji} {issue} — Recovery Services
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {services.length} service{services.length !== 1 ? 's' : ''} that can help
          </p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Service list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
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
              className="w-full flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-services/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-services" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-foreground truncate">{svc.name}</p>
                  {svc.isVerified && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{svc.category} • {svc.distance}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
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

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
        <Button
          variant="outline"
          className="w-full h-10 rounded-xl text-sm font-semibold"
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
    // "Nearby Members" flow
    console.log('Help request:', { problem: selectedProblem, source: selectedSource, details });
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

  /* ── Services results sub-flow ── */
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

        {/* ── Header ── */}
        <div className="px-4 pt-3 pb-1">
          <h2 className="text-lg font-bold text-foreground">What's up?</h2>
          <p className="text-xs text-muted-foreground">Tell us what's happened.</p>
        </div>

        {/* ── Content ── */}
        <div className="px-4 pb-3 space-y-3 pt-2">
          {/* ── Problem Selection (3×2 grid) ── */}
          <div className="grid grid-cols-3 gap-1.5">
            {allProblems.map((p) => (
              <button
                key={p.title}
                onClick={() => setSelectedProblem(p.title)}
                className={`flex flex-col items-center gap-1 py-2 px-1.5 rounded-lg border-2 transition-all ${
                  selectedProblem === p.title
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <span className="text-lg leading-none">{p.emoji}</span>
                <span className="text-[10px] font-semibold text-foreground leading-tight">{p.title}</span>
              </button>
            ))}
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
                  ? getMatchingServices(state.services, selectedProblem).length
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

          {/* ── Stolen Vehicle Link ── */}
          <button
            onClick={() => setShowStolen(true)}
            className="w-full flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/15 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] font-semibold text-destructive">Vehicle Stolen? Tap here</span>
            <ArrowRight className="w-3 h-3 text-destructive/60 ml-auto" />
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
