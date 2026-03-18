import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, Calendar, MapPin, Wrench, Users, ShoppingBag, Radio, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Automotive Events & Meets',
    desc: 'Discover car meets, shows, drive-outs and track days happening near you or anywhere in the world.',
    details: [
      'Explore events directly on the map',
      'See upcoming meets, shows and drive-outs around you',
      'View full event details including location, attendees and organiser',
      'Join community organised events',
      'Create and manage your own events',
    ],
  },
  {
    icon: MapPin,
    title: 'Driving Routes & Road Discovery',
    desc: 'Explore incredible driving roads shared by the global RevNet community.',
    details: [
      'Discover scenic and twisty driving roads recommended by other drivers',
      'Upload, record or draw your own routes',
      'Import GPX route files',
      'Save routes for future drives',
      'Follow routes directly on the map with navigation',
    ],
  },
  {
    icon: Wrench,
    title: 'Trusted Automotive Services',
    desc: 'Find reliable garages, specialists and automotive services wherever you are.',
    details: [
      'Search nearby garages and mechanics',
      'Discover detailing, tuning, bodywork and performance specialists',
      'Filter services by category',
      'Locate tyres, parts suppliers and automotive workshops',
      'Contact businesses directly or navigate to them',
    ],
  },
  {
    icon: Users,
    title: 'Car Clubs & Communities',
    desc: 'Connect with enthusiasts who share your passion for cars and motorcycles.',
    details: [
      'Discover clubs near you or worldwide',
      'Join communities based on vehicle brands or interests',
      'Organise group drives and events',
      'Share posts, updates and photos with club members',
    ],
  },
  {
    icon: Radio,
    title: 'Live Drive Location Sharing',
    desc: 'Stay connected with friends during drives, meets and road trips.',
    details: [
      'Share live location with friends during drives',
      'See friends nearby on the map',
      'Coordinate meet-ups during events',
      'Track group drives together',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'SOS & Community Assistance',
    desc: 'Get help when you need it from nearby drivers or trusted services.',
    details: [
      'Request help from nearby RevNet members',
      'Offer assistance to drivers in your area',
      'Find nearby recovery vehicles or garages',
      'Report breakdowns, accidents or issues instantly',
      'Share your location so responders can reach you quickly',
    ],
  },
];

const OnboardingFeatures = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (idx: number) => setExpanded(prev => prev === idx ? null : idx);

  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/auth" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i === 0 ? 'bg-primary' : 'bg-black/10'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-black text-center mb-1">
          What you can do on RevNet
        </h1>
        <p className="text-sm text-black/50 text-center mb-6">
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
                className="w-full text-left bg-white rounded-2xl border border-black/10 p-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-black">{feat.title}</h3>
                    <p className="text-xs text-black/50 leading-relaxed">{feat.desc}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-black/40 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    <ul className="space-y-1.5">
                      {feat.details.map((d, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-black/50">
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

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={() => navigate('/onboarding/vehicle')} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-white text-black hover:bg-white/90 border border-black/10">
          Continue <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default OnboardingFeatures;
