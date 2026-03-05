import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Calendar, MapPin, Wrench, Users, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Discover Events',
    desc: 'Find car meets, shows and drive-outs happening near you.',
    details: ['See events on the map', 'Join upcoming meets', 'Create your own events', 'Track attendees'],
  },
  {
    icon: MapPin,
    title: 'Driving Routes',
    desc: 'Discover scenic roads and routes shared by the community.',
    details: ['Scenic and twisty routes', 'Import GPX files', 'Upload your own routes', 'Turn-by-turn navigation'],
  },
  {
    icon: Wrench,
    title: 'Automotive Services',
    desc: 'Find trusted garages, mechanics and specialists.',
    details: ['Mechanics', 'Detailing', 'Tuning specialists', 'Tyres and parts suppliers'],
  },
  {
    icon: Users,
    title: 'Clubs & Community',
    desc: 'Connect with other enthusiasts.',
    details: ['Join car clubs', 'Create communities', 'Share updates and events', 'Organise group drives'],
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    desc: 'Buy and sell vehicles, parts and accessories.',
    details: ['Vehicle listings', 'Parts marketplace', 'Direct messaging between buyers and sellers'],
  },
  {
    icon: AlertTriangle,
    title: 'SOS & Breakdown Help',
    desc: 'Get help from nearby RevNet members.',
    details: ['Flat tyre assistance', 'Out of fuel', 'Mechanical breakdown', 'Accident alerts'],
  },
];

const OnboardingFeatures = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (idx: number) => setExpanded(prev => prev === idx ? null : idx);

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/auth/signup" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= 0 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">What can you do on RevNet?</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Everything you need for car and motorcycle culture.
        </p>

        <div className="space-y-2.5">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            const isOpen = expanded === idx;
            return (
              <button
                key={idx}
                onClick={() => toggle(idx)}
                className="w-full text-left bg-card rounded-2xl border border-border/50 p-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <ul className="space-y-1.5">
                      {feat.details.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl px-6 py-4 safe-bottom z-20">
        <Button onClick={() => navigate('/onboarding/interests')} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Continue <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFeatures;
