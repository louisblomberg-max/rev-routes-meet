// ============================
// Dev Tools — Switch Users, Reset Data, QA Checklist, Random Content Generator
// ============================
import { useState, useEffect } from 'react';
import { FlaskConical, User, RotateCcw, CheckSquare, ChevronRight, Zap, AlertTriangle, MapPin, Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/integrations/supabase/client';

// ── Random content pools ──
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T,>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};
const randBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const UK_LAND_POINTS: { lat: number; lng: number; city: string }[] = [
  { lat: 51.5074, lng: -0.1278, city: 'London' },
  { lat: 52.4862, lng: -1.8904, city: 'Birmingham' },
  { lat: 53.4808, lng: -2.2426, city: 'Manchester' },
  { lat: 53.8008, lng: -1.5491, city: 'Leeds' },
  { lat: 51.4545, lng: -2.5879, city: 'Bristol' },
  { lat: 53.4084, lng: -2.9916, city: 'Liverpool' },
  { lat: 54.9783, lng: -1.6178, city: 'Newcastle' },
  { lat: 52.9548, lng: -1.1581, city: 'Nottingham' },
  { lat: 53.3811, lng: -1.4701, city: 'Sheffield' },
  { lat: 50.9097, lng: -1.4044, city: 'Southampton' },
  { lat: 50.8225, lng: -0.1372, city: 'Brighton' },
  { lat: 51.7520, lng: -1.2577, city: 'Oxford' },
  { lat: 52.2053, lng: 0.1218, city: 'Cambridge' },
  { lat: 51.3811, lng: -2.3590, city: 'Bath' },
  { lat: 50.7184, lng: -1.8795, city: 'Bournemouth' },
];
const randCoordUK = (): { lat: number; lng: number; city: string } => {
  const base = pick(UK_LAND_POINTS);
  return { lat: base.lat + (Math.random() - 0.5) * 0.1, lng: base.lng + (Math.random() - 0.5) * 0.1, city: base.city };
};

const EVENT_NAMES = [
  'Sunset Car Meet', 'Dawn Patrol Cars & Coffee', 'JDM All Stars', 'Euro Stance Show',
  'Supercar Saturday', 'Classic Concours', 'Track Attack Day', 'Coastal Cruise Meet',
];
const EVENT_TYPE_IDS = ['meets', 'shows', 'drive', 'track_day', 'motorsport'] as const;
const VEHICLE_TYPE_IDS = ['all', 'cars', 'bikes'] as const;
const EVENT_LOCATIONS_GEN = ['Ace Cafe', 'Caffeine & Machine', 'Goodwood Motor Circuit', 'Silverstone Circuit', 'Brands Hatch'];
const EVENT_DESCRIPTIONS = [
  'Join fellow enthusiasts for an incredible day of automotive passion.',
  'A relaxed morning meet with specialty coffee and some of the finest machines.',
  'High-octane track action with professional marshalling and timed sessions.',
];
const ROUTE_NAMES = ['Snake Pass Run', 'Cheddar Gorge Blast', 'Cat & Fiddle', 'Evo Triangle', 'Black Mountain Pass'];
const ROUTE_TYPES = ['Scenic', 'Twisty', 'Mixed', 'Mountain', 'Coastal'];
const ROUTE_DESCRIPTIONS = [
  'A stunning drive through winding countryside roads with incredible elevation changes.',
  'Fast-flowing B-roads through rolling hills with well-sighted corners.',
];
const SERVICE_CATEGORIES = ['Garages & Mechanics', 'Vehicle Servicing', 'Tyres & Wheels', 'Detailing & Car Care'];
const SERVICE_NAMES = ['Apex Motors', 'Trackside Garage', 'ProServe Auto', 'Mirror Finish Detailing'];
const USERNAMES = ['BimmerFan92', 'TurboTom', 'DriftKingUK', 'CleanFreak', 'TrackDayAddict'];

interface ProfilePreset {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  plan: string | null;
}

function generateRandomEvents(count: number) {
  const events = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + randBetween(1, 90));
    events.push({
      title: pick(EVENT_NAMES),
      description: pick(EVENT_DESCRIPTIONS),
      locationName: `${pick(EVENT_LOCATIONS_GEN)}, ${coords.city}`,
      location: `${pick(EVENT_LOCATIONS_GEN)}, ${coords.city}`,
      lat: coords.lat, lng: coords.lng,
      eventType: pick([...EVENT_TYPE_IDS]),
      vehicleType: pick([...VEHICLE_TYPE_IDS]),
      vehicleBrands: [], vehicleCategories: [], vehicleAge: 'all',
      startDate: futureDate.toISOString(), startTime: '12:00', endTime: '14:00',
      date: futureDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      visibility: 'public' as const,
      createdBy: pick(USERNAMES),
      maxAttendees: randBetween(10, 500), attendees: 0, attendeesList: [],
      firstComeFirstServe: false, entryFeeType: 'free' as const, currency: 'GBP',
      vehicleTypes: ['All Welcome'], tags: [], vehicleAges: [],
    });
  }
  return events;
}

function generateRandomRoutes(count: number) {
  const routes = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const distance = randBetween(8, 120);
    routes.push({
      name: pick(ROUTE_NAMES), description: pick(ROUTE_DESCRIPTIONS),
      distance: `${distance} mi`, type: pick(ROUTE_TYPES),
      vehicleType: pick(['car', 'bike', 'both'] as const),
      rating: parseFloat((randBetween(30, 50) / 10).toFixed(1)),
      createdBy: pick(USERNAMES), lat: coords.lat, lng: coords.lng,
      saves: 0, drives: 0, visibility: 'public' as const,
      tags: [], elevationGain: randBetween(50, 1200),
      durationMinutes: Math.round(distance * 2),
    });
  }
  return routes;
}

function generateRandomServices(count: number) {
  const services = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    services.push({
      name: `${pick(SERVICE_NAMES)}, ${coords.city}`,
      category: pick(SERVICE_CATEGORIES), serviceTypes: [pick(SERVICE_CATEGORIES)],
      rating: parseFloat((randBetween(30, 50) / 10).toFixed(1)),
      distance: `${(randBetween(1, 250) / 10).toFixed(1)} mi`,
      reviewCount: randBetween(3, 350), phone: `07${randBetween(100, 999)} ${randBetween(100000, 999999)}`,
      address: `${randBetween(1, 200)} High Street, ${coords.city}`,
      lat: coords.lat, lng: coords.lng,
      createdBy: pick(USERNAMES), visibility: 'public' as const,
      tags: [],
    });
  }
  return services;
}

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-sm p-4 ${className}`}>{children}</div>
);

const DevTools = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.PROD) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const { user: authUser, updateProfile, logout } = useAuth();
  const { state, events: eventsRepo, routes: routesRepo, services: servicesRepo } = useData();

  const [profiles, setProfiles] = useState<ProfilePreset[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(() => {
    return localStorage.getItem('revnet_dev_preset') || null;
  });

  useEffect(() => {
    (async () => {
      const { data: { user: su } } = await supabase.auth.getUser();
      if (!su?.id) { setIsAdmin(false); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', su.id)
        .maybeSingle();
      if (!profile?.is_admin) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      const { data } = await supabase.from('profiles').select('id, username, display_name, avatar_url, plan').limit(20);
      setProfiles(data || []);
      setLoadingProfiles(false);
    })();
  }, []);

  if (isAdmin === null) {
    return <div className="mobile-container bg-background min-h-dvh flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (isAdmin === false) {
    navigate('/settings', { replace: true });
    return null;
  }

  const switchUser = (profile: ProfilePreset) => {
    updateProfile({
      displayName: profile.display_name || 'User',
      username: profile.username || '',
      avatar: profile.avatar_url,
      // membershipPlan intentionally not written to profiles — read-only from subscriptions
    });
    setPlan((profile.plan as any) || 'free');
    setSubscriptionStatus('active');
    setActivePreset(profile.id);
    localStorage.setItem('revnet_dev_preset', profile.id);
    toast.success(`Switched to ${profile.display_name || profile.username}`, { description: `Plan: ${profile.plan || 'free'}` });
  };

  const resetData = () => {
    localStorage.removeItem('revnet_dev_preset');
    setActivePreset(null);
    toast.success('Dev data reset! Reload to take full effect.', {
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
      description: 'Auto-generated test event from Dev Tools.',
      locationName: 'Current Location', location: 'Current Location',
      lat, lng, eventType: 'meets', vehicleType: 'all',
      vehicleBrands: [], vehicleCategories: [], vehicleAge: 'all',
      startDate: new Date().toISOString(), startTime: '12:00', endTime: '14:00',
      date: new Date().toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      visibility: 'public' as const, createdBy: authUser?.id || 'dev',
      maxAttendees: 50, attendees: 0, attendeesList: [],
      firstComeFirstServe: false, entryFeeType: 'free', currency: 'GBP',
      vehicleTypes: ['All Welcome'], tags: [],
    });
    toast.success('Test event created at your location!', {
      action: { label: 'View Map', onClick: () => navigate('/', { state: { centerOn: { lat, lng }, category: 'events' } }) },
    });
  };

  const generateRandomContent = () => {
    generateRandomEvents(15).forEach(e => eventsRepo.create(e));
    generateRandomRoutes(15).forEach(r => routesRepo.create(r));
    generateRandomServices(15).forEach(s => servicesRepo.create(s));
    toast.success('Generated 45 items!', {
      description: '15 events, 15 routes, 15 services added.',
      action: { label: 'View Map', onClick: () => navigate('/') },
    });
  };

  const qaLinks = [
    { label: 'Add Event', route: '/add/event', color: 'text-events' },
    { label: 'Add Route', route: '/add/route', color: 'text-routes' },
    { label: 'Add Service', route: '/add/service', color: 'text-services' },
    { label: 'Add Club', route: '/add/club', color: 'text-clubs' },
    { label: 'Profile', route: '/profile', color: 'text-foreground' },
    { label: 'Settings', route: '/settings', color: 'text-foreground' },
  ];

  return (
    <div className="mobile-container bg-background min-h-dvh">
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
              <p className="font-bold text-foreground">Free (all features)</p>
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
          <Button onClick={generateRandomContent} className="w-full h-11 rounded-xl gap-2">
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
            {loadingProfiles ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))
            ) : profiles.length === 0 ? (
              <p className="text-xs text-muted-foreground">No profiles found in database.</p>
            ) : (
              profiles.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => switchUser(profile)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    activePreset === profile.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${planColor[profile.plan || 'free'] || planColor.free}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{profile.display_name || profile.username || 'Unknown'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">@{profile.username || 'no-username'} • {profile.plan || 'free'}</p>
                  </div>
                  {activePreset === profile.id && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5">Active</Badge>
                  )}
                </button>
              ))
            )}
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
            onClick={resetData}
            className="w-full h-11 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Dev Data
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
