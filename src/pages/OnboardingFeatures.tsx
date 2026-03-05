import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Calendar, MapPin, Wrench, Users, ShoppingBag, Radio, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Discover Events & Meets',
    desc: 'Find car meets, drive-outs, shows and track days happening around the world.',
    details: [
      'See upcoming events on the map',
      'View event details and attendees',
      'Join events hosted by clubs and communities',
      'Create and manage your own events',
    ],
  },
  {
    icon: MapPin,
    title: 'Explore Driving Routes',
    desc: 'Discover the best driving roads shared by the community.',
    details: [
      'Scenic and twisty routes',
      'Upload or import GPX routes',
      'Save routes for later',
      'Follow routes directly on the map',
    ],
  },
  {
    icon: Wrench,
    title: 'Automotive Services',
    desc: 'Locate trusted garages and specialists near you.',
    details: [
      'Mechanics',
      'Detailing services',
      'Performance tuning',
      'Tyres and parts suppliers',
    ],
  },
  {
    icon: Users,
    title: 'Clubs & Communities',
    desc: 'Connect with enthusiasts who share your interests.',
    details: [
      'Join car clubs',
      'Organise group drives',
      'Share posts and updates',
      'Discover communities worldwide',
    ],
  },
  {
    icon: Radio,
    title: 'Location Sharing',
    desc: 'Share your location with friends during drives.',
    details: [
      'Live location for group drives',
      'Find friends nearby',
      'Meet up easily during events',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'SOS Breakdown Help',
    desc: 'Get help when you need it most.',
    details: [
      'Flat tyre assistance',
      'Out of fuel',
      'Mechanical breakdowns',
      'Accident alerts',
    ],
  },
];

const OnboardingFeatures = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (idx: number) => setExpanded(prev => prev === idx ? null : idx);

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/auth" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-foreground text-center mb-1">
          What you can do on RevNet
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Everything you need for automotive culture in one place.
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
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
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
        <Button onClick={() => navigate('/onboarding/vehicle')} className="w-full h-14 text-base font-semibold rounded-full gap-2">
          Continue <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFeatures;
