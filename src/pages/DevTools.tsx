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
// Pre-defined UK land coordinates (cities/towns) to guarantee on-land placement
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
  { lat: 52.6309, lng: -1.1398, city: 'Leicester' },
  { lat: 51.2802, lng: -0.7500, city: 'Guildford' },
  { lat: 52.1936, lng: -2.2216, city: 'Worcester' },
  { lat: 51.0543, lng: -1.3100, city: 'Winchester' },
  { lat: 53.2307, lng: -0.5406, city: 'Lincoln' },
  { lat: 52.0406, lng: -0.7594, city: 'Milton Keynes' },
  { lat: 51.8860, lng: -2.0880, city: 'Cheltenham' },
  { lat: 54.5260, lng: -1.5526, city: 'Darlington' },
  { lat: 53.7632, lng: -2.7044, city: 'Preston' },
  { lat: 52.5162, lng: -2.0816, city: 'Wolverhampton' },
  { lat: 51.5820, lng: -0.3360, city: 'Watford' },
  { lat: 51.2684, lng: 1.0780, city: 'Canterbury' },
  { lat: 50.3755, lng: -4.1427, city: 'Plymouth' },
  { lat: 50.2660, lng: -5.0527, city: 'Truro' },
  { lat: 54.7753, lng: -1.5849, city: 'Durham' },
];
// Jitter around a known land point (±0.05° ≈ 3 mi)
const randCoordUK = (): { lat: number; lng: number; city: string } => {
  const base = pick(UK_LAND_POINTS);
  return {
    lat: base.lat + (Math.random() - 0.5) * 0.1,
    lng: base.lng + (Math.random() - 0.5) * 0.1,
    city: base.city,
  };
};

const EVENT_NAMES = [
  'Sunset Car Meet', 'Dawn Patrol Cars & Coffee', 'Nürburgring Night', 'JDM All Stars', 'Euro Stance Show',
  'Supercar Saturday', 'Classic Concours', 'Track Attack Day', 'Coastal Cruise Meet', 'Modified Nationals',
  'Drift Nights', 'Muscle Car Mania', 'Italian Stallions Meet', 'Bikes & Burgers', 'Sunday Showdown',
  'Retro Rides Gathering', 'Rev Harder Track Day', 'EV Owners Social', 'Rally Stage Experience', 'Midnight Run',
  'Chrome & Coffee', 'Petrolhead Picnic', 'Alpine Run Convoy', 'Detailing Demo Day', 'Dyno Day',
];
const EVENT_TYPE_IDS = ['meets', 'shows', 'drive', 'track_day', 'motorsport', 'autojumble', 'off_road'] as const;
const VEHICLE_TYPE_IDS = ['all', 'cars', 'bikes', 'big_stuff', 'military'] as const;
const VEHICLE_CATEGORY_OPTIONS_GEN = ['jdm', 'supercars', 'muscle-car', 'american', 'european', '4x4', 'row'];
const VEHICLE_AGE_OPTIONS_GEN = ['all', 'classics', 'modern', 'vintage', 'pre_2000', 'pre_1990', 'pre_1980', 'pre_1970', 'pre_1960', 'pre_1950'];

const CAR_BRANDS_GEN = [
  'Abarth','Alfa Romeo','Alpine','Aston Martin','Audi','Bentley','BMW','Bugatti',
  'Cadillac','Chevrolet','Chrysler','Citroën','Cupra','Dacia','Dodge','Ferrari',
  'Fiat','Ford','Genesis','GMC','Honda','Hyundai','Infiniti','Jaguar','Jeep',
  'Kia','Koenigsegg','Lamborghini','Land Rover','Lexus','Lotus','Maserati',
  'Mazda','McLaren','Mercedes-Benz','Mini','Mitsubishi','Nissan','Pagani',
  'Peugeot','Polestar','Porsche','Renault','Rolls Royce','Seat','Skoda',
  'Subaru','Suzuki','Tesla','Toyota','Vauxhall','Volkswagen','Volvo',
];
const BIKE_BRANDS_GEN = [
  'Aprilia','Benelli','BMW Motorrad','CFMoto','Ducati','Harley-Davidson','Honda',
  'Husqvarna','Indian','Kawasaki','KTM','Moto Guzzi','MV Agusta','Royal Enfield',
  'Suzuki','Triumph','Yamaha','Zero Motorcycles',
];

const EVENT_LOCATIONS_GEN = [
  'Ace Cafe', 'Caffeine & Machine', 'Goodwood Motor Circuit', 'Silverstone Circuit',
  'Brands Hatch', 'Castle Combe Circuit', 'Donnington Park', 'Beaulieu Motor Museum',
  'Brooklands Museum', 'Blenheim Palace', 'Santa Pod Raceway', 'Bicester Heritage',
  'Shelsley Walsh Hill Climb', 'Oulton Park', 'Box Hill Viewpoint',
  'The Paddock', 'Main Car Park', 'Exhibition Hall', 'South Field', 'Circuit Entrance',
];

const USERNAMES = [
  'BimmerFan92', 'TurboTom', 'DriftKingUK', 'CleanFreak', 'TrackDayAddict', 'V8Thunder',
  'JDMLover', 'PorschePete', 'ClassicCarl', 'EVDave', 'ModifiedMike', 'BikerBen',
  'GarageQueen', 'BoostJunkie', 'ApexHunter',
];

const EVENT_DESCRIPTIONS = [
  'Join fellow enthusiasts for an incredible day of automotive passion. Food trucks, live DJ, and prizes for best in show. All skill levels and marques are welcome to attend.',
  'A relaxed morning meet with specialty coffee, freshly baked pastries, and some of the finest machines in the region. Bring your pride and joy for a chilled Sunday morning.',
  'High-octane track action with professional marshalling, timed sessions, and on-board photography available. Helmets required. All experience levels welcome with instructor support.',
  'Cruise through stunning scenery with a group of like-minded petrolheads. Route cards and walkie-talkies provided. Approximately 60 miles of B-roads finishing at a pub lunch.',
  'Annual charity car show raising money for local causes. Trophy categories include Best Paint, Best Engine Bay, and People\'s Choice. Family-friendly with food and entertainment.',
  'Late-night meet under the lights for the modified car community. Bring your best spec and cleanest build. Sound-off competition at 10pm followed by a short cruise.',
  'Family-friendly automotive festival with go-karts for kids, a detailing masterclass, and vendor village. Over 200 cars expected across all categories and decades of motoring.',
  'Exclusive gathering for supercars and hypercars only. Champagne reception, professional photography included, and scenic group drive through the countryside to finish the day off.',
  'Monthly recurring meet at a legendary venue that brings together the community rain or shine. Great atmosphere, good people, and some seriously impressive machinery on display.',
  'A spirited group drive through the countryside finishing with a fantastic pub lunch. Expect around 60 miles of flowing B-roads with some truly stunning views along the way.',
  'Celebrating Japanese automotive culture with a curated display of JDM icons. From classic Skylines to modern GR Yaris builds, this meet showcases the best of Japan.',
  'American muscle and classic car showcase with live music, BBQ, and drag racing demonstrations. Bring your V8 and join the rumble for a truly unforgettable weekend event.',
  'Track day exclusively for motorcycle riders with marshalled sessions and professional coaching available. All bike types welcome from sports to adventure. Full leathers mandatory for safety.',
  'A dedicated EV and hybrid owners social with charging available on site. Tech talks, range challenges, and a chance to compare the latest electric vehicles up close.',
  'Classic and vintage car rally through picturesque villages with timed checkpoints. Open to pre-1990 vehicles only. Period dress encouraged but not required for participants.',
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  meets: 'Meets', shows: 'Shows', drive: 'Drive', track_day: 'Track Day', motorsport: 'Motorsport', autojumble: 'Autojumble', off_road: 'Off-Road',
};

function generateRandomEvents(count: number) {
  const events = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const eventType = pick([...EVENT_TYPE_IDS]);
    const vehicleType = pick([...VEHICLE_TYPE_IDS]);
    const vehicleCategories = Math.random() > 0.3 ? pickN(VEHICLE_CATEGORY_OPTIONS_GEN, randBetween(1, 2)) : [];
    const vehicleAges = Math.random() > 0.5 ? pickN(VEHICLE_AGE_OPTIONS_GEN.filter(a => a !== 'all'), randBetween(1, 3)) : ['all'];

    // Pick brands based on vehicle type
    let vehicleBrands: string[] = [];
    if (vehicleType === 'cars') {
      vehicleBrands = pickN(CAR_BRANDS_GEN, randBetween(1, 3));
    } else if (vehicleType === 'bikes') {
      vehicleBrands = pickN(BIKE_BRANDS_GEN, randBetween(1, 2));
    } else {
      vehicleBrands = pickN([...CAR_BRANDS_GEN, ...BIKE_BRANDS_GEN], randBetween(1, 3));
    }

    // Generate a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + randBetween(1, 90));
    const hours = randBetween(7, 20);
    const mins = pick(['00', '30']);
    const startTime = `${String(hours).padStart(2, '0')}:${mins}`;
    const endHours = Math.min(hours + randBetween(2, 5), 23);
    const endTime = `${String(endHours).padStart(2, '0')}:${mins}`;

    const hasFee = Math.random() > 0.5;
    const maxAttendees = randBetween(10, 500);
    const locationName = `${pick(EVENT_LOCATIONS_GEN)}, ${coords.city}`;

    events.push({
      title: pick(EVENT_NAMES),
      description: pick(EVENT_DESCRIPTIONS),
      locationName,
      location: locationName,
      lat: coords.lat,
      lng: coords.lng,

      // Structured fields
      eventType,
      vehicleType,
      vehicleBrands,
      vehicleCategories,
      vehicleAge: vehicleAges.includes('all') ? 'all' : vehicleAges[0],
      vehicleAges: vehicleAges.filter(a => a !== 'all'),

      // Dates
      startDate: futureDate.toISOString(),
      startTime,
      endTime,

      // Legacy date for display
      date: futureDate.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ` • ${startTime}`,

      visibility: pick(['public', 'public', 'public', 'club', 'friends'] as const),
      createdBy: pick(USERNAMES),
      maxAttendees,
      attendees: randBetween(0, Math.floor(maxAttendees * 0.6)),
      attendeesList: [],
      firstComeFirstServe: Math.random() > 0.5,
      entryFeeType: hasFee ? 'paid' as const : 'free' as const,
      entryFeeAmount: hasFee ? randBetween(3, 45) : undefined,
      currency: 'GBP',

      // Legacy
      entryFee: hasFee ? `£${randBetween(3, 45)}` : 'Free',
      vehicleTypes: vehicleType === 'all' ? ['All Welcome'] : [vehicleType === 'cars' ? 'Cars' : 'Bikes'],
      ticketLimit: maxAttendees,
      tags: [],
    });
  }
  return events;
}

// ── Random Route pools ──
const ROUTE_NAMES = [
  'Snake Pass Run', 'Cheddar Gorge Blast', 'Cat & Fiddle', 'Evo Triangle', 'Black Mountain Pass',
  'Buttertubs Pass', 'Bealach na Bà', 'Hardknott Pass', 'Great Orme Loop', 'Cotswold Cruise',
  'Peak District Peaks', 'Lake District Explorer', 'Scottish Highlands Run', 'Welsh Dragon Trail', 'Dartmoor Dash',
  'North Coast 500 Taster', 'South Downs Sprint', 'Forest of Dean Loop', 'Yorkshire Moors Ride', 'Brecon Beacons Circuit',
];
const ROUTE_TYPES = ['Scenic', 'Twisty', 'Mixed', 'Mountain', 'Coastal', 'Forest'];
const ROUTE_DESCRIPTIONS = [
  'A stunning drive through winding countryside roads with incredible elevation changes and panoramic views at every turn.',
  'Fast-flowing B-roads through rolling hills with well-sighted corners and minimal traffic. Perfect weekend blast.',
  'Technical mountain pass with tight hairpins and dramatic scenery. Not for the faint-hearted but incredibly rewarding.',
  'Relaxed coastal cruise with sea views, quaint villages, and great stopping points for photos and refreshments.',
  'A mix of fast straights and technical sections through dense forest. Watch for loose gravel on corners after rain.',
  'Classic enthusiast route with smooth tarmac, flowing bends, and a legendary pub at the halfway point.',
];
const SURFACE_TYPES: ('tarmac' | 'gravel' | 'mixed' | 'dirt')[] = ['tarmac', 'tarmac', 'tarmac', 'gravel', 'mixed'];
const TRAFFIC_LEVELS: ('low' | 'moderate' | 'heavy')[] = ['low', 'low', 'moderate', 'heavy'];
const DIFFICULTIES: ('easy' | 'moderate' | 'challenging' | 'expert')[] = ['easy', 'moderate', 'challenging', 'expert'];

function generateRandomRoutes(count: number) {
  const routes = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const distance = randBetween(8, 120);
    const duration = Math.round(distance * randBetween(1, 3));
    routes.push({
      name: pick(ROUTE_NAMES),
      description: pick(ROUTE_DESCRIPTIONS),
      distance: `${distance} mi`,
      type: pick(ROUTE_TYPES),
      vehicleType: pick(['car', 'bike', 'both'] as const),
      rating: parseFloat((randBetween(30, 50) / 10).toFixed(1)),
      createdBy: pick(USERNAMES),
      lat: coords.lat,
      lng: coords.lng,
      saves: randBetween(0, 200),
      drives: randBetween(5, 500),
      visibility: 'public' as const,
      tags: pickN(['scenic', 'technical', 'beginner-friendly', 'expert', 'weekend-favourite'], randBetween(1, 3)),
      elevationGain: randBetween(50, 1200),
      scenicRating: randBetween(1, 5),
      trafficLevel: pick(TRAFFIC_LEVELS),
      surfaceType: pick(SURFACE_TYPES),
      difficulty: pick(DIFFICULTIES),
      safetyTags: pickN(['Narrow roads', 'Avoid at night', 'Livestock crossing', 'Speed cameras', 'Flood risk'], randBetween(0, 2)),
      durationMinutes: duration,
    });
  }
  return routes;
}

// ── Random Service pools ──
const SERVICE_CATEGORIES = [
  'Garages & Mechanics', 'Vehicle Servicing', 'Tyres & Wheels', 'Bodywork & Paint',
  'Detailing & Car Care', 'Tuning & Performance', 'Parts & Accessories',
  'Recovery & Roadside Assistance', 'Storage & Parking', 'Shipping & Transportation',
];
const SERVICE_NAMES_MAP: Record<string, string[]> = {
  'Garages & Mechanics': ['Apex Motors', 'Trackside Garage', 'Revline Auto', 'Precision Mechanicals', 'AllStar Autos'],
  'Vehicle Servicing': ['ProServe Auto', 'QuickFit Express', 'ServiceFirst', 'MasterTech Servicing', 'DriveRight MOT'],
  'Tyres & Wheels': ['RubberRoad Tyres', 'GripKing Wheels', 'AllSeason Tyres', 'RimTech Alloys', 'TyreVault'],
  'Bodywork & Paint': ['Chrome Finish Body', 'Paintwerks', 'DentMaster Pro', 'AutoGlow Bodyshop', 'Prestige Paint'],
  'Detailing & Car Care': ['Mirror Finish Detailing', 'Obsessed Detailing', 'ShowroomShine', 'Wax & Buff Co', 'CeramicCoat Pro'],
  'Tuning & Performance': ['BoostWorks', 'Dyno Kings', 'TurboTech Tuning', 'Rev Limit Performance', 'PowerCurve Tuning'],
  'Parts & Accessories': ['PartsFinder UK', 'AutoSpares Direct', 'BreakersYard Plus', 'ModParts Online', 'FastFit Accessories'],
  'Recovery & Roadside Assistance': ['RapidRecovery 24/7', 'RoadRescue UK', 'NightOwl Recovery', 'SafeTow Services', 'AA Partner Recovery'],
  'Storage & Parking': ['SecureStore Cars', 'VaultPark', 'DriveIn Storage', 'ClassicCar Barn', 'CoverGuard Storage'],
  'Shipping & Transportation': ['AutoShip UK', 'CarCarrier Express', 'TransPort Pro', 'BikeMove Ltd', 'EnclosedTransit'],
};

function generateRandomServices(count: number) {
  const services = [];
  for (let i = 0; i < count; i++) {
    const coords = randCoordUK();
    const category = pick(SERVICE_CATEGORIES);
    const names = SERVICE_NAMES_MAP[category] || ['Auto Service'];
    const rating = parseFloat((randBetween(30, 50) / 10).toFixed(1));
    const reviewCount = randBetween(3, 350);
    const dist = (randBetween(1, 250) / 10).toFixed(1);
    services.push({
      name: `${pick(names)}, ${coords.city}`,
      category,
      serviceTypes: [category],
      rating,
      distance: `${dist} mi`,
      reviewCount,
      openingHours: pick(['Mon-Fri 8am-6pm', 'Mon-Sat 9am-5pm', '24/7', 'Mon-Fri 7am-7pm']),
      phone: `07${randBetween(100, 999)} ${randBetween(100000, 999999)}`,
      address: `${randBetween(1, 200)} ${pick(['High Street', 'Industrial Estate', 'Station Road', 'Mill Lane', 'Park Road'])}, ${coords.city}`,
      isOpen: Math.random() > 0.3,
      priceRange: pick(['£', '££', '£££']),
      lat: coords.lat,
      lng: coords.lng,
      createdBy: pick(USERNAMES),
      visibility: 'public' as const,
      tags: pickN(['trusted', 'fast-turnaround', 'specialist', 'budget-friendly', 'premium'], randBetween(1, 3)),
      yearsInBusiness: randBetween(1, 40),
      isVerified: Math.random() > 0.5,
      serviceMode: pick(['fixed', 'mobile'] as const),
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
      description: 'Auto-generated test event from Dev Tools for quick testing and verification of the event system.',
      locationName: 'Current Location',
      location: 'Current Location',
      lat, lng,
      eventType: 'meets',
      vehicleType: 'all',
      vehicleBrands: [],
      vehicleCategories: [],
      vehicleAge: 'all',
      startDate: new Date().toISOString(),
      startTime: '12:00',
      endTime: '14:00',
      date: new Date().toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }),
      visibility: 'public' as const,
      createdBy: authUser?.id || 'dev',
      maxAttendees: 50,
      attendees: 0,
      attendeesList: [],
      firstComeFirstServe: false,
      entryFeeType: 'free',
      currency: 'GBP',
      vehicleTypes: ['All Welcome'],
      tags: [],
    });
    toast.success('Test event created at your location!', {
      description: 'Switch to Discovery → Events to see the pin.',
      action: { label: 'View Map', onClick: () => navigate('/', { state: { centerOn: { lat, lng }, category: 'events' } }) },
    });
  };

  const generateRandomContent = () => {
    const events = generateRandomEvents(15);
    events.forEach(e => eventsRepo.create(e));

    const routes = generateRandomRoutes(15);
    routes.forEach(r => routesRepo.create(r));

    const services = generateRandomServices(15);
    services.forEach(s => servicesRepo.create(s));

    toast.success(`Generated 45 items!`, {
      description: '15 events, 15 routes, 15 services added.',
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
