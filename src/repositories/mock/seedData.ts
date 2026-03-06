// ============================
// Seed Data — Realistic UK automotive content with tags
// ============================

import type {
  RevEvent, RevRoute, RevService, Club, ClubPost, ClubEvent,
  ForumPost, ForumComment, MarketplaceListing,
  Vehicle, Friend, UserActivity, ClubMembership,
} from '@/models';

// ── Events ──
export const seedEvents: RevEvent[] = [
  {
    id: 'ev-1', title: 'Porsche Owners Meet', description: 'Monthly meet for Porsche owners across the South East.',
    date: 'Sat, Mar 15 • 10:00 AM', location: 'Ace Cafe, London', lat: 51.5404, lng: -0.2260,
    vehicleTypes: ['Porsche Only'], eventType: 'Meets', attendees: 47, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, tags: ['meets', 'euro', 'porsche', 'supercars'],
  },
  {
    id: 'ev-2', title: 'JDM Night Drive', description: 'Evening cruise for Japanese car enthusiasts.',
    date: 'Fri, Mar 21 • 8:00 PM', location: 'Box Hill, Surrey', lat: 51.2547, lng: -0.3147,
    vehicleTypes: ['Japanese Cars'], eventType: 'Group Drive', attendees: 89, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, tags: ['drive-outs', 'jdm', 'group drive', 'performance'],
  },
  {
    id: 'ev-3', title: 'Classic Car Sunday', description: 'Celebrating pre-1990 classics at the iconic Brooklands.',
    date: 'Sun, Mar 23 • 9:00 AM', location: 'Brooklands Museum', lat: 51.3460, lng: -0.4687,
    vehicleTypes: ['Pre-1990 Classics'], eventType: 'Show / Exhibition', attendees: 156, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, tags: ['car shows', 'classic', 'show / exhibition'],
  },
  {
    id: 'ev-4', title: 'Supercar Breakfast', description: 'Early morning coffee with exotic machinery.',
    date: 'Sat, Apr 5 • 8:00 AM', location: 'The Ivy, Chelsea', lat: 51.4900, lng: -0.1687,
    vehicleTypes: ['Supercars Only'], eventType: 'Cars & Coffee', attendees: 32, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, tags: ['cars & coffee', 'supercars', 'performance'],
  },
  {
    id: 'ev-5', title: 'Brands Hatch Track Day', description: 'Open track session for all skill levels.',
    date: 'Sun, Apr 13 • 7:30 AM', location: 'Brands Hatch Circuit', lat: 51.3574, lng: 0.2614,
    vehicleTypes: ['All Welcome'], eventType: 'Track Day', attendees: 64, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, entryFee: '£85',
    tags: ['track days', 'track', 'performance', 'motorsport'],
  },
  {
    id: 'ev-6', title: 'Euro Car Meet', description: 'European car meet at Caffeine & Machine.',
    date: 'Sat, Apr 19 • 11:00 AM', location: 'Caffeine & Machine', lat: 52.2840, lng: -1.5310,
    vehicleTypes: ['European Cars'], eventType: 'Meets', attendees: 120, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, tags: ['meets', 'euro', 'bmw', 'mercedes', 'audi'],
  },
  {
    id: 'ev-7', title: 'Bike Night', description: 'Weekly motorcycle meet at Ace Cafe.',
    date: 'Thu, Mar 27 • 7:00 PM', location: 'Ace Cafe, London', lat: 51.5404, lng: -0.2260,
    vehicleTypes: ['Motorcycles Only'], eventType: 'Meets', attendees: 78, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: true, recurrenceType: 'weekly',
    tags: ['meets', 'motorcycle', 'motorcycle groups'],
  },
  {
    id: 'ev-8', title: 'Goodwood Cars & Coffee', description: 'Monthly morning meet at the Motor Circuit.',
    date: 'Sun, Apr 6 • 9:00 AM', location: 'Goodwood Motor Circuit', lat: 50.8614, lng: -0.7520,
    vehicleTypes: ['All Welcome'], eventType: 'Cars & Coffee', attendees: 245, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: true, recurrenceType: 'monthly',
    tags: ['cars & coffee', 'events', 'car shows'],
  },
  {
    id: 'ev-9', title: 'BMW M Power Day', description: 'All BMW M cars welcome. Show off your build.',
    date: 'Sat, Apr 26 • 10:00 AM', location: 'Silverstone, Northamptonshire', lat: 52.0786, lng: -1.0169,
    vehicleTypes: ['BMW Only'], eventType: 'Meets', attendees: 95, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, tags: ['meets', 'bmw', 'euro', 'performance'],
  },
  {
    id: 'ev-10', title: 'American Muscle Cruise', description: 'V8 rumble through the countryside.',
    date: 'Sun, May 4 • 11:00 AM', location: 'Beaulieu Motor Museum', lat: 50.8690, lng: -1.4530,
    vehicleTypes: ['American Muscle'], eventType: 'Drive-Out', attendees: 38, createdBy: 'seed', createdAt: new Date().toISOString(),
    visibility: 'public', isMultiDay: false, isRecurring: false, tags: ['drive-outs', 'american', 'muscle', 'v8'],
  },
];

// ── Routes ──
export const seedRoutes: RevRoute[] = [
  {
    id: 'rt-1', name: 'South Downs Scenic', description: 'Beautiful rolling hills through the South Downs.',
    distance: '45 mi', type: 'Scenic', vehicleType: 'both', rating: 4.8, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 50.9200, lng: -0.1500, visibility: 'public', tags: ['scenic', 'scenic routes'],
    trafficLevel: 'low', surfaceType: 'tarmac', difficulty: 'easy', durationMinutes: 75, scenicRating: 5,
  },
  {
    id: 'rt-2', name: 'Welsh Dragon Pass', description: 'One of the best driving roads in the UK. Tight corners and elevation changes.',
    distance: '82 mi', type: 'Twisty', vehicleType: 'car', rating: 4.9, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 52.7500, lng: -3.4500, visibility: 'public', tags: ['twisty', 'twisty roads', 'performance', 'track'],
    trafficLevel: 'low', surfaceType: 'tarmac', difficulty: 'challenging', durationMinutes: 150, elevationGain: 840, scenicRating: 5,
  },
  {
    id: 'rt-3', name: 'Coastal Run — Jurassic Coast', description: 'Stunning views along the Dorset coastline.',
    distance: '38 mi', type: 'Coastal', vehicleType: 'both', rating: 4.7, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 50.6200, lng: -2.4500, visibility: 'public', tags: ['scenic', 'scenic routes', 'coastal'],
    trafficLevel: 'moderate', surfaceType: 'tarmac', difficulty: 'easy', durationMinutes: 65, scenicRating: 5,
  },
  {
    id: 'rt-4', name: 'Cotswolds Explorer', description: 'Gentle cruise through honey-stone villages.',
    distance: '67 mi', type: 'Scenic', vehicleType: 'both', rating: 4.6, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 51.8400, lng: -1.6800, visibility: 'public', tags: ['scenic', 'scenic routes'],
    trafficLevel: 'low', surfaceType: 'tarmac', difficulty: 'easy', durationMinutes: 110,
  },
  {
    id: 'rt-5', name: 'Scottish Highlands A82', description: 'Epic highland driving. Loch Lomond to Fort William.',
    distance: '120 mi', type: 'Scenic', vehicleType: 'both', rating: 4.9, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 56.8200, lng: -5.1000, visibility: 'public', tags: ['scenic', 'scenic routes', 'twisty roads'],
    trafficLevel: 'low', surfaceType: 'tarmac', difficulty: 'moderate', durationMinutes: 210, elevationGain: 520, scenicRating: 5,
  },
  {
    id: 'rt-6', name: 'Peak District Loop', description: 'Winding roads through the peaks. Popular with bikers.',
    distance: '55 mi', type: 'Twisty', vehicleType: 'bike', rating: 4.7, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 53.3500, lng: -1.7800, visibility: 'public', tags: ['twisty', 'twisty roads', 'motorcycle'],
    trafficLevel: 'moderate', surfaceType: 'tarmac', difficulty: 'moderate', durationMinutes: 90,
  },
  {
    id: 'rt-7', name: 'Lake District Explorer', description: 'Stunning passes including Kirkstone and Wrynose.',
    distance: '72 mi', type: 'Scenic', vehicleType: 'both', rating: 4.8, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 54.4500, lng: -3.0900, visibility: 'public', tags: ['scenic', 'scenic routes', 'twisty roads'],
    trafficLevel: 'low', surfaceType: 'tarmac', difficulty: 'challenging', durationMinutes: 130, elevationGain: 680,
    safetyTags: ['Narrow roads', 'Livestock crossing'],
  },
  {
    id: 'rt-8', name: 'Surrey Hills Blast', description: 'Quick blast through the Surrey Hills. Box Hill classic.',
    distance: '28 mi', type: 'Twisty', vehicleType: 'both', rating: 4.5, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 51.2547, lng: -0.3147, visibility: 'public', tags: ['twisty', 'twisty roads', 'performance'],
    trafficLevel: 'moderate', surfaceType: 'tarmac', difficulty: 'easy', durationMinutes: 45,
  },
  {
    id: 'rt-9', name: 'Forest of Dean Off-Road', description: 'Gravel tracks through ancient woodland.',
    distance: '18 mi', type: 'Off-road', vehicleType: 'car', rating: 4.3, createdBy: 'seed', createdAt: new Date().toISOString(),
    lat: 51.8000, lng: -2.6000, visibility: 'public', tags: ['off-road', 'off-road routes'],
    trafficLevel: 'low', surfaceType: 'gravel', difficulty: 'moderate', durationMinutes: 60,
  },
];

// ── Services ──
export const seedServices: RevService[] = [
  {
    id: 'svc-1', name: 'Euro Specialists', category: 'Mechanic', serviceTypes: ['German Cars', 'Diagnostics', 'Servicing'],
    rating: 4.9, distance: '2.3 mi', reviewCount: 127, openingHours: 'Mon-Fri: 8am-6pm, Sat: 9am-2pm',
    phone: '020 7123 4567', address: '45 Motor Lane, London SW1 2AB', isOpen: true, priceRange: '££',
    lat: 51.4950, lng: -0.1420, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['mechanics', 'euro', 'bmw', 'mercedes', 'audi', 'porsche'],
  },
  {
    id: 'svc-2', name: 'Quick Fit Garage', category: 'Garage', serviceTypes: ['MOT', 'Tyres', 'Brakes', 'Exhausts'],
    rating: 4.5, distance: '0.8 mi', reviewCount: 89, openingHours: 'Mon-Sat: 8am-6pm',
    phone: '020 7234 5678', address: '12 High Street, London E1 4CD', isOpen: true, priceRange: '£',
    lat: 51.5170, lng: -0.0720, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['mechanics', 'tyres', 'mot'],
  },
  {
    id: 'svc-3', name: 'Premium Detailing Co', category: 'Detailing', serviceTypes: ['Full Valet', 'Ceramic Coating', 'PPF', 'Interior'],
    rating: 4.8, distance: '3.1 mi', reviewCount: 203, openingHours: 'Mon-Sat: 9am-5pm',
    phone: '020 7345 6789', address: '78 Shine Road, London NW3 5EF', isOpen: true, priceRange: '£££',
    lat: 51.5500, lng: -0.1650, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['detailing', 'ceramic coating', 'ppf'],
  },
  {
    id: 'svc-4', name: 'Performance Parts UK', category: 'Parts', serviceTypes: ['Performance', 'OEM', 'Aftermarket', 'Accessories'],
    rating: 4.7, distance: '5.2 mi', reviewCount: 156, openingHours: 'Mon-Fri: 9am-5:30pm',
    phone: '020 7456 7890', address: '23 Speed Way, London SE5 6GH', isOpen: false, priceRange: '££',
    lat: 51.4700, lng: -0.0900, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['parts suppliers', 'performance', 'tuning'],
  },
  {
    id: 'svc-5', name: 'TyrePro Centre', category: 'Tyres', serviceTypes: ['Tyre Fitting', 'Wheel Alignment', 'Balancing', 'Puncture Repair'],
    rating: 4.6, distance: '1.5 mi', reviewCount: 312, openingHours: 'Mon-Sat: 8am-7pm, Sun: 10am-4pm',
    phone: '020 7567 8901', address: '56 Rubber Road, London W2 7IJ', isOpen: true, priceRange: '£',
    lat: 51.5150, lng: -0.1850, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['tyres', 'wheel alignment'],
  },
  {
    id: 'svc-6', name: 'SpeedTune Garage', category: 'Tuning', serviceTypes: ['ECU Remapping', 'Dyno Testing', 'Turbo Upgrades', 'Exhaust Systems'],
    rating: 4.8, distance: '6.7 mi', reviewCount: 94, openingHours: 'Tue-Sat: 9am-6pm',
    phone: '020 7789 0123', address: '34 Power Street, London E14 9MN', isOpen: true, priceRange: '£££',
    lat: 51.5050, lng: -0.0200, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['tuning', 'performance', 'ecu', 'turbo'],
  },
  {
    id: 'svc-7', name: 'JDM Imports Workshop', category: 'Specialist', serviceTypes: ['JDM Servicing', 'Import Prep', 'Performance Tuning'],
    rating: 4.9, distance: '8.2 mi', reviewCount: 67, openingHours: 'Mon-Fri: 9am-6pm',
    phone: '020 7890 1234', address: '12 Drift Lane, London SE18 3OP', isOpen: true, priceRange: '££',
    lat: 51.4850, lng: 0.0600, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['mechanics', 'jdm', 'tuning', 'performance'],
  },
  {
    id: 'svc-8', name: 'Classic Car Restoration', category: 'Specialist', serviceTypes: ['Body Restoration', 'Engine Rebuild', 'Paint', 'Interior Retrim'],
    rating: 4.9, distance: '12 mi', reviewCount: 45, openingHours: 'Mon-Fri: 8am-5pm',
    phone: '020 7901 2345', address: '89 Heritage Way, Surrey KT1 2QR', isOpen: true, priceRange: '£££',
    lat: 51.3900, lng: -0.3000, createdBy: 'seed', createdAt: new Date().toISOString(), visibility: 'public',
    tags: ['mechanics', 'classic', 'body shop', 'restoration'],
  },
];

// ── Clubs ──
export const seedClubs: Club[] = [
  {
    id: 'club-1', name: 'BMW Enthusiasts UK', tagline: 'For BMW owners & fans', location: 'Nationwide',
    locationCoords: { lat: 51.5074, lng: -0.1278 }, members: 2340, image: null,
    description: 'The largest BMW community in the UK.', createdBy: 'seed', createdAt: new Date().toISOString(),
    tags: ['brand specific', 'bmw', 'euro', 'performance'], vehicleFocus: ['BMW'],
  },
  {
    id: 'club-2', name: 'Porsche Club GB', tagline: 'Porsche passion since 1961', location: 'London & South East',
    locationCoords: { lat: 51.4900, lng: -0.1687 }, members: 1856, image: null,
    description: 'The official Porsche Club Great Britain.', createdBy: 'seed', createdAt: new Date().toISOString(),
    tags: ['brand specific', 'porsche', 'euro', 'supercars'], vehicleFocus: ['Porsche'],
  },
  {
    id: 'club-3', name: 'JDM Legends', tagline: 'Japanese car culture', location: 'Manchester Area',
    locationCoords: { lat: 53.4808, lng: -2.2426 }, members: 987, image: null,
    description: 'Celebrating Japanese automotive culture.', createdBy: 'seed', createdAt: new Date().toISOString(),
    tags: ['brand specific', 'jdm', 'performance'], vehicleFocus: ['Nissan', 'Toyota', 'Honda', 'Subaru', 'Mazda'],
  },
  {
    id: 'club-4', name: 'Classic Mini Club', tagline: 'Original Mini enthusiasts', location: 'Nationwide',
    locationCoords: { lat: 52.4862, lng: -1.8904 }, members: 3421, image: null,
    description: 'For lovers of the original Mini.', createdBy: 'seed', createdAt: new Date().toISOString(),
    tags: ['brand specific', 'classic', 'local club'], vehicleFocus: ['Mini'],
  },
  {
    id: 'club-5', name: 'Track Day Addicts', tagline: 'Living for the apex', location: 'UK Wide',
    locationCoords: { lat: 52.0786, lng: -1.0169 }, members: 1245, image: null,
    description: 'For those who can\'t get enough of circuit driving.', createdBy: 'seed', createdAt: new Date().toISOString(),
    tags: ['track club', 'track', 'performance', 'motorsport'], vehicleFocus: [],
  },
  {
    id: 'club-6', name: 'London Riders', tagline: 'Ride together, ride safe', location: 'London',
    locationCoords: { lat: 51.5074, lng: -0.1278 }, members: 890, image: null,
    description: 'Motorcycle riding group for London and surrounds.', createdBy: 'seed', createdAt: new Date().toISOString(),
    tags: ['motorcycle club', 'motorcycle', 'local club'], vehicleFocus: [],
  },
];

export const seedClubPosts: ClubPost[] = [
  { id: 'cp-1', clubId: 'club-1', author: 'BimmerFan92', authorAvatar: null, content: 'Just finished my M3 restoration!', createdAt: '2h ago', likes: 47, comments: 12, isPinned: false },
  { id: 'cp-2', clubId: 'club-1', author: 'E30Steve', authorAvatar: null, content: 'Anyone know a good specialist for E30 rust repair?', createdAt: '5h ago', likes: 8, comments: 23, isPinned: false },
  { id: 'cp-3', clubId: 'club-1', author: 'ClubAdmin', authorAvatar: null, content: '🎉 Summer meet confirmed for July 15th!', createdAt: '1d ago', likes: 156, comments: 45, isPinned: true },
];

export const seedClubEvents: ClubEvent[] = [
  { id: 'ce-1', clubId: 'club-1', title: 'Summer Meet 2024', date: 'Sat, Jul 15 • 10:00 AM', location: 'Caffeine & Machine', attendees: 89 },
  { id: 'ce-2', clubId: 'club-1', title: 'Track Day - Brands Hatch', date: 'Sun, Aug 20 • 8:00 AM', location: 'Brands Hatch Circuit', attendees: 32 },
];

export const seedForumPosts: ForumPost[] = [];
export const seedForumComments: ForumComment[] = [];
export const seedMarketplaceListings: MarketplaceListing[] = [];

// User-specific
export const seedUserVehicles: Vehicle[] = [];
export const seedUserFriends: Friend[] = [];
export const seedUserActivities: UserActivity[] = [];
export const seedUserClubMemberships: ClubMembership[] = [];
export const seedUserSavedRoutes: string[] = [];
export const seedUserAttendingEvents: string[] = [];
