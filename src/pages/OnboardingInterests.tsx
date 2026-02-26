import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Route, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';

const EVENT_INTERESTS = ['Meets', 'Cars & Coffee', 'Track Days', 'Shows', 'Group Drives'];
const ROUTE_INTERESTS = ['Scenic', 'Twisties', 'Coastal', 'Off-road', 'Track'];
const SERVICE_INTERESTS = ['Mechanics', 'Detailing', 'Parts', 'Tyres', 'Tuning', 'MOT', 'EV Charging'];

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-sm p-5 ${className}`}>{children}</div>
);

const SectionTitle = ({ icon: Icon, color, children }: { icon: React.ElementType; color: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-3">
    <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center`}>
      <Icon className="w-4 h-4" />
    </div>
    <h2 className="text-base font-bold text-foreground">{children}</h2>
  </div>
);

const OnboardingInterests = () => {
  const navigate = useNavigate();
  const { updateProfile, setOnboardingStep } = useAuth();

  const [events, setEvents] = useState<string[]>([]);
  const [routes, setRoutes] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [distance, setDistance] = useState([25]);

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
  };

  const chipClass = (active: boolean, activeColor: string) =>
    `px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
      active
        ? `${activeColor} shadow-sm`
        : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-primary/40'
    }`;

  const handleContinue = () => {
    updateProfile({ interests: { events, routes, services } } as any);
    setOnboardingStep(3);
    navigate('/onboarding/permissions');
  };

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= 2 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-caption mt-1.5">Step 3 of 5 — Interests</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-5 overflow-y-auto pb-28">
        <div>
          <h1 className="heading-lg text-foreground mb-1">What are you into?</h1>
          <p className="text-sm text-muted-foreground">Pick your interests to personalise Discovery</p>
        </div>

        {/* Events */}
        <SectionCard>
          <SectionTitle icon={Calendar} color="bg-events/10 text-events">Events</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {EVENT_INTERESTS.map(item => (
              <button key={item} onClick={() => toggle(events, setEvents, item)} className={chipClass(events.includes(item), 'bg-events text-events-foreground border-events')}>
                {item}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Routes */}
        <SectionCard>
          <SectionTitle icon={Route} color="bg-routes/10 text-routes">Routes</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {ROUTE_INTERESTS.map(item => (
              <button key={item} onClick={() => toggle(routes, setRoutes, item)} className={chipClass(routes.includes(item), 'bg-routes text-routes-foreground border-routes')}>
                {item}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Services */}
        <SectionCard>
          <SectionTitle icon={Wrench} color="bg-services/10 text-services">Services</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {SERVICE_INTERESTS.map(item => (
              <button key={item} onClick={() => toggle(services, setServices, item)} className={chipClass(services.includes(item), 'bg-services text-services-foreground border-services')}>
                {item}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Distance */}
        <SectionCard>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">Search Radius</h2>
            <span className="text-sm font-semibold text-primary">{distance[0]} miles</span>
          </div>
          <Slider value={distance} onValueChange={setDistance} min={5} max={100} step={5} className="w-full" />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">5 mi</span>
            <span className="text-[10px] text-muted-foreground">100 mi</span>
          </div>
        </SectionCard>
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/30 px-6 py-4 safe-bottom">
        <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingInterests;
