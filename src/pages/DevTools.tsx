// ============================
// Dev Tools — Switch Users, Reset Data, QA Checklist, Random Content Generator
// ============================
import { useState } from 'react';
import { FlaskConical, User, RotateCcw, CheckSquare, ChevronRight, Zap, Crown, CreditCard, AlertTriangle, MapPin, Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { useData } from '@/contexts/DataContext';
import { MOCK_USER_PRESETS, type MockUserPreset } from '@/data/mockUsers';

// ── Random content pools ──
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T,>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};
const randBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randCoordUK = (): { lat: number; lng: number } => ({
  lat: 50.5 + Math.random() * 5.5, // ~50.5 to 56.0
  lng: -4.5 + Math.random() * 5.5, // ~-4.5 to 1.0
});

const EVENT_NAMES = [
  'Sunset Car Meet', 'Dawn Patrol Cars & Coffee', 'Nürburgring Night', 'JDM All Stars', 'Euro Stance Show',
  'Supercar Saturday', 'Classic Concours', 'Track Attack Day', 'Coastal Cruise Meet', 'Modified Nationals',
  'Drift Nights', 'Muscle Car Mania', 'Italian Stallions Meet', 'Bikes & Burgers', 'Sunday Showdown',
  'Retro Rides Gathering', 'Rev Harder Track Day', 'EV Owners Social', 'Rally Stage Experience', 'Midnight Run',
  'Chrome & Coffee', 'Petrolhead Picnic', 'Alpine Run Convoy', 'Detailing Demo Day', 'Dyno Day',
];
const EVENT_TYPES = ['Meets', 'Cars & Coffee', 'Track Day', 'Group Drive', 'Show / Exhibition', 'Drive-Out'];
const EVENT_VEHICLE_TYPES = [
  'All Welcome', 'Japanese Cars', 'European Cars', 'Supercars Only', 'Classic Cars',
  'Motorcycles Only', 'American Muscle', 'BMW Only', 'Porsche Only', 'Modified Only',
];
const EVENT_LOCATIONS = [
  'Ace Cafe, London', 'Caffeine & Machine, Warwickshire', 'Goodwood Motor Circuit', 'Silverstone Circuit',
  'Brands Hatch, Kent', 'Castle Combe Circuit', 'Donnington Park', 'Beaulieu Motor Museum',
  'Brooklands Museum, Surrey', 'Blenheim Palace', 'Santa Pod Raceway', 'Bicester Heritage',
  'Shelsley Walsh Hill Climb', 'Oulton Park, Cheshire', 'Box Hill, Surrey',
];
const EVENT_TAGS_POOL = [
  'meets', 'cars & coffee', 'track days', 'drive-outs', 'car shows', 'jdm', 'euro', 'american',
  'classic', 'supercars', 'motorcycle', 'performance', 'track', 'drift', 'modified', 'ev',
  'motorsport', 'show / exhibition', 'group drive', 'bmw', 'porsche', 'mercedes', 'audi',
];

const ROUTE_NAMES = [
  'Snake Pass Blast', 'Amalfi of Wales', 'Highlands Glory Road', 'Jurassic Coastliner',
  'Snowdonia Summit Run', 'Brecon Beacons Loop', 'North Coast 500 Slice', 'Cat & Fiddle Classic',
  'Black Mountain Pass', 'Cheddar Gorge Sprint', 'Devil\'s Staircase', 'Buttertubs Pass',
  'Hardknott Pass Challenge', 'Great Orme Coastal', 'Bealach na Bà', 'A4069 Black Mountain',
  'Yorkshire Moors Explorer', 'Dartmoor Wilderness', 'Border Ridge Run', 'Exmoor Twisties',
];
const ROUTE_TYPES = ['Scenic', 'Twisty', 'Coastal', 'Off-road', 'Mixed', 'Track'];
const ROUTE_TAGS_POOL = [
  'scenic', 'scenic routes', 'twisty', 'twisty roads', 'coastal', 'off-road', 'off-road routes',
  'performance', 'track', 'motorcycle', 'classic',
];

const SERVICE_NAMES = [
  'ProTune Performance', 'Shine Studio Detailing', 'German Auto Clinic', 'Apex Motorsport',
  'Heritage Garage', 'TurboTech Tuning', 'Prestige Parts Co.', 'WrapKing Studios',
  'Drift Spec Garage', 'MotorMedic 24/7', 'JDM Workshop', 'Tyre Kingdom',
  'Body Perfect Repairs', 'Chrome Finish Detailing', 'EV Charge Solutions',
  'Bolt-On Performance', 'Classic Restore Co.', 'Two Wheels Workshop', 'Paint Correction Pro', 'GearHead Garage',
];
const SERVICE_CATEGORIES = ['Mechanic', 'Detailing', 'Tuning', 'Tyres', 'Parts', 'Specialist', 'Garage'];
const SERVICE_TYPES_POOL: Record<string, string[]> = {
  Mechanic: ['Servicing', 'Diagnostics', 'Brakes', 'Suspension', 'Clutch', 'Timing Belt'],
  Detailing: ['Full Valet', 'Ceramic Coating', 'PPF', 'Interior', 'Machine Polish', 'Paint Correction'],
  Tuning: ['ECU Remapping', 'Dyno Testing', 'Turbo Upgrades', 'Exhaust Systems', 'Intake Kits'],
  Tyres: ['Tyre Fitting', 'Wheel Alignment', 'Balancing', 'Puncture Repair', 'Run Flats'],
  Parts: ['Performance', 'OEM', 'Aftermarket', 'Accessories', 'Body Kits'],
  Specialist: ['Diagnostics', 'Wiring', 'ECU Tuning', 'Audio Install', 'Air Ride'],
  Garage: ['MOT', 'Servicing', 'Brakes', 'Exhausts', 'Air Con Regas'],
};
const SERVICE_TAGS_POOL = [
  'mechanics', 'detailing', 'tuning', 'tyres', 'parts suppliers', 'performance',
  'jdm', 'euro', 'classic', 'body shop', 'ceramic coating', 'ppf', 'ecu', 'turbo',
];
const SERVICE_ADDRESSES = [
  '12 Motor Lane, London', '45 High Street, Birmingham', '78 Speed Way, Manchester',
  '23 Garage Road, Bristol', '56 Engine Close, Leeds', '89 Pit Lane, Sheffield',
  '34 Track Avenue, Nottingham', '67 Circuit Drive, Liverpool', '91 Horsepower Way, Brighton',
  '15 Torque Street, Oxford', '42 RPM Road, Cambridge', '73 Boost Lane, Southampton',
];
const PRICE_RANGES = ['£', '££', '£££'];
const OPENING_HOURS = [
  'Mon-Fri: 8am-6pm', 'Mon-Sat: 8am-6pm', 'Mon-Fri: 9am-5:30pm',
  'Mon-Sat: 9am-5pm', 'Tue-Sat: 9am-6pm', 'Mon-Sat: 8am-7pm, Sun: 10am-4pm',
];
const USERNAMES = [
  'BimmerFan92', 'TurboTom', 'DriftKingUK', 'CleanFreak', 'TrackDayAddict', 'V8Thunder',
  'JDMLover', 'PorschePete', 'ClassicCarl', 'EVDave', 'ModifiedMike', 'BikerBen',
  'GarageQueen', 'BoostJunkie', 'ApexHunter',
];

function generateRandomEvents(count: number) {
  const events = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const eventType = pick(EVENT_TYPES);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + randBetween(1, 90));
    const hours = randBetween(7, 20);
    const dateStr = futureDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) + ` • ${hours}:00 ${hours < 12 ? 'AM' : 'PM'}`;
    const hasFee = Math.random() > 0.6;

    events.push({
      title: pick(EVENT_NAMES),
      description: `A fantastic ${eventType.toLowerCase()} event for automotive enthusiasts. Join us for an amazing day out!`,
      location: pick(EVENT_LOCATIONS),
      lat: coords.lat,
      lng: coords.lng,
      date: dateStr,
      eventType,
      vehicleTypes: [pick(EVENT_VEHICLE_TYPES)],
      visibility: 'public' as const,
      createdBy: pick(USERNAMES),
      attendees: randBetween(5, 300),
      isMultiDay: Math.random() > 0.85,
      isRecurring: Math.random() > 0.8,
      recurrenceType: Math.random() > 0.5 ? 'weekly' as const : 'monthly' as const,
      entryFee: hasFee ? `£${randBetween(5, 85)}` : undefined,
      tags: pickN(EVENT_TAGS_POOL, randBetween(2, 5)),
    });
  }
  return events;
}

function generateRandomRoutes(count: number) {
  const routes = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const type = pick(ROUTE_TYPES);
    const distanceMi = randBetween(8, 150);
    const vehicleType = pick(['car', 'bike', 'both'] as const);

    routes.push({
      name: pick(ROUTE_NAMES),
      description: `A stunning ${type.toLowerCase()} drive through beautiful British countryside. ${distanceMi} miles of pure driving pleasure.`,
      distance: `${distanceMi} mi`,
      type,
      vehicleType,
      rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      createdBy: pick(USERNAMES),
      lat: coords.lat,
      lng: coords.lng,
      saves: randBetween(0, 200),
      drives: randBetween(0, 500),
      visibility: 'public' as const,
      tags: pickN(ROUTE_TAGS_POOL, randBetween(2, 4)),
      elevationGain: type === 'Twisty' || type === 'Scenic' ? randBetween(100, 900) : undefined,
      scenicRating: randBetween(3, 5),
      trafficLevel: pick(['low', 'moderate', 'heavy'] as const),
      surfaceType: type === 'Off-road' ? pick(['gravel', 'dirt', 'mixed'] as const) : 'tarmac' as const,
      difficulty: pick(['easy', 'moderate', 'challenging', 'expert'] as const),
      durationMinutes: Math.round(distanceMi * 1.5 + randBetween(10, 40)),
      safetyTags: Math.random() > 0.5 ? pickN(['Narrow roads', 'Low car warning', 'Avoid at night', 'Speed cameras', 'Livestock crossing'], randBetween(1, 2)) : undefined,
    });
  }
  return routes;
}

function generateRandomServices(count: number) {
  const services = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const category = pick(SERVICE_CATEGORIES);
    const serviceTypes = pickN(SERVICE_TYPES_POOL[category] || ['General'], randBetween(2, 4));

    services.push({
      name: pick(SERVICE_NAMES),
      category,
      serviceTypes,
      rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
      distance: `${(Math.random() * 15).toFixed(1)} mi`,
      reviewCount: randBetween(5, 400),
      openingHours: pick(OPENING_HOURS),
      phone: `0${randBetween(1, 9)}${randBetween(100, 999)} ${randBetween(100, 999)} ${randBetween(1000, 9999)}`,
      address: pick(SERVICE_ADDRESSES),
      isOpen: Math.random() > 0.3,
      priceRange: pick(PRICE_RANGES),
      lat: coords.lat,
      lng: coords.lng,
      createdBy: pick(USERNAMES),
      visibility: 'public' as const,
      tags: pickN(SERVICE_TAGS_POOL, randBetween(2, 4)),
    });
  }
  return services;
}

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-sm p-4 ${className}`}>{children}</div>
);

const DevTools = () => {
  const navigate = useNavigate();
  const { user: authUser, updateProfile, logout } = useAuth();
  const { setPlan, setSubscriptionStatus, currentPlan, effectivePlan, getPlanLabel } = usePlan();
  const { state, events: eventsRepo, routes: routesRepo, services: servicesRepo } = useData();

  const [activePreset, setActivePreset] = useState<string | null>(() => {
    return localStorage.getItem('revnet_dev_preset') || null;
  });

  const switchUser = (preset: MockUserPreset) => {
    updateProfile({ ...preset.authUser });
    setPlan(preset.planId);
    setSubscriptionStatus('active');
    state.setCurrentUser(prev => prev ? {
      ...prev,
      id: preset.authUser.id,
      email: preset.authUser.email || '',
      displayName: preset.authUser.displayName || 'User',
      username: preset.authUser.username || 'user',
      avatar: preset.authUser.avatar || null,
      bio: preset.authUser.bio || '',
      location: preset.authUser.location || '',
      plan: preset.planId,
      eventCredits: preset.eventCredits,
      routeCredits: preset.routeCredits,
    } : prev);
    setActivePreset(preset.id);
    localStorage.setItem('revnet_dev_preset', preset.id);
    toast.success(`Switched to ${preset.label}`, { description: preset.description });
  };

  const resetMockData = () => {
    localStorage.removeItem('revnet_dev_preset');
    setActivePreset(null);
    toast.success('Mock data reset! Reload to take full effect.', {
      action: { label: 'Reload', onClick: () => window.location.reload() },
    });
  };

  const planColor: Record<string, string> = {
    free: 'bg-muted text-muted-foreground',
    pro: 'bg-routes/10 text-routes',
    club: 'bg-clubs/10 text-clubs',
  };

  const testPublishToMap = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => createTestEvent(pos.coords.latitude, pos.coords.longitude),
      () => createTestEvent(51.5074, -0.1278),
      { timeout: 3000 },
    );
  };

  const createTestEvent = (lat: number, lng: number) => {
    eventsRepo.create({
      title: `Test Event ${Date.now().toString(36)}`,
      description: 'Auto-generated test event from Dev Tools',
      location: 'Current Location',
      lat, lng,
      date: new Date().toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      eventType: 'Meets',
      vehicleTypes: ['All Welcome'],
      visibility: 'public' as const,
      createdBy: state.currentUser?.id || 'dev',
      attendees: 0,
      isMultiDay: false,
      isRecurring: false,
      tags: ['meets'],
    });
    toast.success('Test event created at your location!', {
      description: 'Switch to Discovery → Events to see the pin.',
      action: { label: 'View Map', onClick: () => navigate('/', { state: { centerOn: { lat, lng }, category: 'events' } }) },
    });
  };

  const generateRandomContent = () => {
    const events = generateRandomEvents(15);
    const routes = generateRandomRoutes(15);
    const services = generateRandomServices(15);

    events.forEach(e => eventsRepo.create(e));
    routes.forEach(r => routesRepo.create(r));
    services.forEach(s => servicesRepo.create(s));

    toast.success(`Generated 45 items!`, {
      description: '15 events, 15 routes, 15 services added to the map.',
      action: { label: 'View Map', onClick: () => navigate('/') },
    });
  };

  const qaLinks = [
    { label: 'Add Event', route: '/add/event', color: 'text-events' },
    { label: 'Add Route', route: '/add/route', color: 'text-routes' },
    { label: 'Add Service', route: '/add/service', color: 'text-services' },
    { label: 'Add Club', route: '/add/club', color: 'text-clubs' },
    { label: 'Upgrade / Plans', route: '/upgrade', color: 'text-primary' },
    { label: 'Profile', route: '/profile', color: 'text-foreground' },
    { label: 'Settings', route: '/settings', color: 'text-foreground' },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-10 h-10 rounded-xl bg-muted/80 hover:bg-muted" />
          <FlaskConical className="w-5 h-5 text-amber-600" />
          <h1 className="text-lg font-bold text-foreground">Dev Tools</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 pb-28">

        {/* Current State */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">Current State</h2>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Plan</span>
              <p className="font-bold text-foreground">{getPlanLabel(effectivePlan)}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Event Credits</span>
              <p className="font-bold text-foreground">{state.currentUser?.eventCredits ?? 0}{state.currentUser?.eventCredits === -1 ? ' (∞)' : ''}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Events</span>
              <p className="font-bold text-foreground">{state.events.length}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Routes</span>
              <p className="font-bold text-foreground">{state.routes.length}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">Services</span>
              <p className="font-bold text-foreground">{state.services.length}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5">
              <span className="text-muted-foreground">User</span>
              <p className="font-bold text-foreground truncate">{authUser?.displayName || 'None'}</p>
            </div>
          </div>
        </SectionCard>

        {/* Random Content Generator */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <Shuffle className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Random Content Generator</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Generate 15 random events, 15 routes and 15 services with realistic data, scattered across the UK.
          </p>
          <Button
            onClick={generateRandomContent}
            className="w-full h-11 rounded-xl gap-2"
          >
            <Shuffle className="w-4 h-4" />
            Generate 45 Random Items
          </Button>
        </SectionCard>

        {/* Switch User */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Switch User</h2>
          </div>
          <div className="space-y-2">
            {MOCK_USER_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => switchUser(preset)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  activePreset === preset.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${planColor[preset.planId]}`}>
                  {preset.planId === 'free' ? <User className="w-4 h-4" /> :
                   preset.planId === 'pro' ? <Crown className="w-4 h-4" /> :
                   <CreditCard className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{preset.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{preset.description}</p>
                </div>
                {activePreset === preset.id && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">Active</Badge>
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* QA Quick Links */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <CheckSquare className="w-4 h-4 text-services" />
            <h2 className="text-sm font-bold text-foreground">QA Checklist</h2>
          </div>
          <div className="space-y-1">
            {qaLinks.map(link => (
              <button
                key={link.route}
                onClick={() => navigate(link.route)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <span className={`text-sm font-medium ${link.color}`}>{link.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
          <Button
            onClick={testPublishToMap}
            className="w-full h-11 rounded-xl mt-3 gap-2 bg-events hover:bg-events/90 text-white"
          >
            <MapPin className="w-4 h-4" />
            Test Publish → Map Pin
          </Button>
        </SectionCard>

        {/* Reset */}
        <SectionCard>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h2 className="text-sm font-bold text-foreground">Danger Zone</h2>
          </div>
          <Button
            variant="outline"
            onClick={resetMockData}
            className="w-full h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All Mock Data
          </Button>
          <Button
            variant="outline"
            onClick={() => { logout(); navigate('/auth'); }}
            className="w-full h-11 rounded-xl mt-2 border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            Log Out & Reset Session
          </Button>
        </SectionCard>
      </div>
    </div>
  );
};

export default DevTools;
