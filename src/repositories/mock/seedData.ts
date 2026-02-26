// ============================
// Community Seed Data
// ============================
// This data represents content created by OTHER users.
// The current user starts with zero personal data.

import type {
  RevEvent, RevRoute, RevService, Club, ClubPost, ClubEvent,
  ForumPost, ForumComment, MarketplaceListing,
} from '@/models';

export const seedEvents: RevEvent[] = [
  { id: 'e1', title: 'Porsche Owners Meet', date: 'Sat, Feb 15 • 10:00 AM', location: 'Ace Cafe, London', vehicleType: 'Porsche Only', eventType: 'Meets', attendees: 47, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'e2', title: 'JDM Night Drive', date: 'Fri, Feb 21 • 8:00 PM', location: 'Box Hill, Surrey', vehicleType: 'Japanese Cars', eventType: 'Group Drive', attendees: 89, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'e3', title: 'Classic Car Sunday', date: 'Sun, Feb 23 • 9:00 AM', location: 'Brooklands Museum', vehicleType: 'Pre-1990 Classics', eventType: 'Show / Exhibition', attendees: 156, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'e4', title: 'Supercar Breakfast', date: 'Sat, Mar 1 • 8:00 AM', location: 'The Ivy, Chelsea', vehicleType: 'Supercars Only', eventType: 'Cars & Coffee', attendees: 32, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'e5', title: 'Brands Hatch Track Day', date: 'Sun, Mar 8 • 7:30 AM', location: 'Brands Hatch Circuit', vehicleType: 'All Welcome', eventType: 'Track Day', attendees: 64, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'e6', title: 'Euro Car Meet', date: 'Sat, Mar 15 • 11:00 AM', location: 'Caffeine & Machine', vehicleType: 'European Cars', eventType: 'Meets', attendees: 120, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'e7', title: 'Bike Night', date: 'Thu, Mar 20 • 7:00 PM', location: 'Ace Cafe, London', vehicleType: 'Motorcycles Only', eventType: 'Meets', attendees: 78, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'e8', title: 'Cars & Coffee', date: 'Sun, Mar 23 • 9:00 AM', location: 'Goodwood Motor Circuit', vehicleType: 'All Welcome', eventType: 'Cars & Coffee', attendees: 245, createdBy: 'user-seed', createdAt: '2024-02-01' },
];

export const seedRoutes: RevRoute[] = [
  { id: 'r1', name: 'Coastal Run', distance: '38 miles', type: 'Coastal', vehicleType: 'both', rating: 4.7, createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 'r2', name: 'Mountain Pass', distance: '52 miles', type: 'Twisty', vehicleType: 'both', rating: 4.8, createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 'r3', name: 'South Downs Scenic', distance: '45 miles', type: 'Scenic', vehicleType: 'both', rating: 4.8, createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 'r4', name: 'Welsh Dragon Pass', distance: '82 miles', type: 'Twisty', vehicleType: 'car', rating: 4.9, createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 'r5', name: 'Cotswolds Explorer', distance: '67 miles', type: 'Scenic', vehicleType: 'both', rating: 4.6, createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 'r6', name: 'Scottish Highlands A82', distance: '120 miles', type: 'Scenic', vehicleType: 'both', rating: 4.9, createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 'r7', name: 'Peak District Loop', distance: '55 miles', type: 'Mixed', vehicleType: 'bike', rating: 4.7, createdBy: 'user-seed', createdAt: '2024-01-01' },
];

export const seedServices: RevService[] = [
  { id: 's1', name: 'Euro Specialists', category: 'Mechanic', serviceTypes: ['German Cars', 'Diagnostics', 'Servicing'], rating: 4.9, distance: '2.3 miles', reviewCount: 127, openingHours: 'Mon-Fri: 8am - 6pm, Sat: 9am - 2pm', phone: '020 7123 4567', address: '45 Motor Lane, London SW1 2AB', isOpen: true, priceRange: '££', createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 's2', name: 'Quick Fit Garage', category: 'Garage', serviceTypes: ['MOT', 'Tyres', 'Brakes', 'Exhausts'], rating: 4.5, distance: '0.8 miles', reviewCount: 89, openingHours: 'Mon-Sat: 8am - 6pm', phone: '020 7234 5678', address: '12 High Street, London E1 4CD', isOpen: true, priceRange: '£', createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 's3', name: 'Premium Detailing Co', category: 'Detailing', serviceTypes: ['Full Valet', 'Ceramic Coating', 'PPF', 'Interior'], rating: 4.8, distance: '3.1 miles', reviewCount: 203, openingHours: 'Mon-Sat: 9am - 5pm', phone: '020 7345 6789', address: '78 Shine Road, London NW3 5EF', isOpen: true, priceRange: '£££', createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 's4', name: 'Performance Parts UK', category: 'Parts', serviceTypes: ['Performance', 'OEM', 'Aftermarket', 'Accessories'], rating: 4.7, distance: '5.2 miles', reviewCount: 156, openingHours: 'Mon-Fri: 9am - 5:30pm', phone: '020 7456 7890', address: '23 Speed Way, London SE5 6GH', isOpen: false, priceRange: '££', createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 's5', name: 'TyrePro Centre', category: 'Tyres', serviceTypes: ['Tyre Fitting', 'Wheel Alignment', 'Balancing', 'Puncture Repair'], rating: 4.6, distance: '1.5 miles', reviewCount: 312, openingHours: 'Mon-Sat: 8am - 7pm, Sun: 10am - 4pm', phone: '020 7567 8901', address: '56 Rubber Road, London W2 7IJ', isOpen: true, priceRange: '£', createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 's6', name: 'AutoElectric Solutions', category: 'Specialist', serviceTypes: ['Diagnostics', 'Wiring', 'ECU Tuning', 'Audio Install'], rating: 4.9, distance: '4.8 miles', reviewCount: 78, openingHours: 'Mon-Fri: 8:30am - 5:30pm', phone: '020 7678 9012', address: '89 Circuit Lane, London N1 8KL', isOpen: false, priceRange: '££', createdBy: 'user-seed', createdAt: '2024-01-01' },
  { id: 's7', name: 'SpeedTune Garage', category: 'Tuning', serviceTypes: ['ECU Remapping', 'Dyno Testing', 'Turbo Upgrades', 'Exhaust Systems'], rating: 4.8, distance: '6.7 miles', reviewCount: 94, openingHours: 'Tue-Sat: 9am - 6pm', phone: '020 7789 0123', address: '34 Power Street, London E14 9MN', isOpen: true, priceRange: '£££', createdBy: 'user-seed', createdAt: '2024-01-01' },
];

export const seedClubs: Club[] = [
  { id: 'c1', name: 'BMW Enthusiasts UK', handle: 'bmwenthusiastsuk', tagline: 'For BMW owners & fans', location: 'Nationwide', members: 2340, image: null, description: 'The largest BMW community in the UK.', rules: ['Be respectful', 'No spam', 'Keep discussions on-topic', 'No hate speech'], createdBy: 'user-seed', createdAt: '2023-01-01', visibility: 'public', joinApproval: 'auto', postingPermissions: 'anyMember', clubType: 'Brand-specific', categories: ['BMW'], vehicleFocus: ['Cars'], roles: { ownerId: 'user-seed', adminIds: [], moderatorIds: [] } },
  { id: 'c2', name: 'Porsche Club GB', handle: 'porscheclubgb', tagline: 'Porsche passion since 1961', location: 'London & South East', members: 1856, image: null, description: 'The official Porsche Club Great Britain.', rules: ['Respect fellow members', 'Share experiences', 'Follow event guidelines'], createdBy: 'user-seed', createdAt: '2023-01-01', visibility: 'public', joinApproval: 'adminApproval', postingPermissions: 'anyMember', clubType: 'Brand-specific', categories: ['Porsche'], vehicleFocus: ['Cars', 'Supercars'], roles: { ownerId: 'user-seed', adminIds: [], moderatorIds: [] } },
  { id: 'c3', name: 'JDM Legends', handle: 'jdmlegends', tagline: 'Japanese car culture', location: 'Manchester Area', members: 987, image: null, description: 'Celebrating Japanese automotive culture.', rules: ['JDM cars only', 'Be respectful', 'Share your builds'], createdBy: 'user-seed', createdAt: '2023-01-01', visibility: 'public', joinApproval: 'auto', postingPermissions: 'anyMember', clubType: 'Car Club', categories: ['JDM'], vehicleFocus: ['Cars', 'JDM'], roles: { ownerId: 'user-seed', adminIds: [], moderatorIds: [] } },
  { id: 'c4', name: 'Classic Mini Club', handle: 'classicminiclub', tagline: 'Original Mini enthusiasts', location: 'Nationwide', members: 3421, image: null, description: 'For lovers of the original Mini.', rules: ['Classic Minis only', 'Help fellow enthusiasts', 'Share restoration progress'], createdBy: 'user-seed', createdAt: '2023-01-01', visibility: 'public', joinApproval: 'auto', postingPermissions: 'anyMember', clubType: 'Classic', categories: ['Classics'], vehicleFocus: ['Classic'], roles: { ownerId: 'user-seed', adminIds: [], moderatorIds: [] } },
  { id: 'c5', name: 'Track Day Addicts', handle: 'trackdayaddicts', tagline: 'Living for the apex', location: 'UK Wide', members: 1245, image: null, description: 'For those who can\'t get enough of circuit driving.', rules: ['Safety first', 'No reckless driving talk', 'Help newcomers'], createdBy: 'user-seed', createdAt: '2023-01-01', visibility: 'public', joinApproval: 'auto', postingPermissions: 'anyMember', clubType: 'Track / Performance', categories: ['Track'], vehicleFocus: ['Cars', 'All Welcome'], roles: { ownerId: 'user-seed', adminIds: [], moderatorIds: [] } },
  { id: 'c6', name: 'Electric Vehicle UK', handle: 'evuk', tagline: 'The future is electric', location: 'Nationwide', members: 4521, image: null, description: 'Everything EV.', rules: ['Be welcoming to EV newcomers', 'No ICE vs EV debates', 'Share charging locations'], createdBy: 'user-seed', createdAt: '2023-01-01', visibility: 'public', joinApproval: 'auto', postingPermissions: 'anyMember', clubType: 'Car Club', categories: ['EV'], vehicleFocus: ['Cars'], roles: { ownerId: 'user-seed', adminIds: [], moderatorIds: [] } },
];

export const seedClubPosts: ClubPost[] = [
  { id: 'cp1', clubId: 'c1', author: 'BimmerFan92', authorAvatar: null, content: 'Just finished my M3 restoration! 6 months of weekends but totally worth it.', createdAt: '2h ago', likes: 47, comments: 12, isPinned: false },
  { id: 'cp2', clubId: 'c1', author: 'E30Steve', authorAvatar: null, content: 'Anyone know a good specialist for E30 rust repair in the Midlands?', createdAt: '5h ago', likes: 8, comments: 23, isPinned: false },
  { id: 'cp3', clubId: 'c1', author: 'ClubAdmin', authorAvatar: null, content: '🎉 ANNOUNCEMENT: Summer meet confirmed for July 15th at Caffeine & Machine!', createdAt: '1d ago', likes: 156, comments: 45, isPinned: true },
];

export const seedClubEvents: ClubEvent[] = [
  { id: 'ce1', clubId: 'c1', title: 'Summer Meet 2024', date: 'Sat, Jul 15 • 10:00 AM', location: 'Caffeine & Machine', attendees: 89 },
  { id: 'ce2', clubId: 'c1', title: 'Track Day - Brands Hatch', date: 'Sun, Aug 20 • 8:00 AM', location: 'Brands Hatch Circuit', attendees: 32 },
];

export const seedForumPosts: ForumPost[] = [
  { id: 'fp1', title: 'Best oil for E46 M3 track days?', body: 'I\'m planning to take my E46 M3 to a few track days this summer. Currently using Castrol Edge 5W-30 but wondering if I should switch to something more track-focused.', type: 'question', category: 'mods', author: 'BimmerFan92', createdAt: '2024-02-14T10:30:00Z', upvotes: 47, downvotes: 2, comments: 23 },
  { id: 'fp2', title: 'My experience with ceramic coating after 2 years', body: 'Got my GT-R ceramic coated back in 2022. Here\'s my honest review after 2 years of daily driving.', type: 'advice', category: 'general', clubId: 'c3', clubName: 'JDM Legends', author: 'GTROwner', createdAt: '2024-02-14T08:15:00Z', upvotes: 89, downvotes: 5, comments: 34 },
  { id: 'fp3', title: 'GTI vs Golf R for a daily driver - help me decide', body: 'Looking to upgrade from my 1.4 TSI Golf. Torn between the GTI and Golf R.', type: 'discussion', category: 'buying', author: 'VWNewbie', createdAt: '2024-02-13T16:45:00Z', upvotes: 156, downvotes: 8, comments: 89 },
  { id: 'fp4', title: 'Dashboard rattle fix - finally solved it!', body: 'After 6 months of annoying dashboard rattles in my Civic Type R, I finally tracked it down.', type: 'advice', category: 'troubleshooting', author: 'QuietRider', createdAt: '2024-02-12T14:20:00Z', upvotes: 234, downvotes: 3, comments: 45 },
  { id: 'fp5', title: 'First track day tips for beginners?', body: 'I\'ve booked my first track day at Brands Hatch next month. What should I know?', type: 'question', category: 'track', author: 'TrackRookie', createdAt: '2024-02-12T09:00:00Z', upvotes: 78, downvotes: 1, comments: 56 },
  { id: 'fp6', title: 'Modified car insurance - who are you with?', body: 'Just remapped my Focus ST and added a decat. Looking for insurance.', type: 'discussion', category: 'insurance', clubId: 'c1', clubName: 'BMW Enthusiasts UK', author: 'ModdedFocus', createdAt: '2024-02-11T20:30:00Z', upvotes: 112, downvotes: 4, comments: 67 },
  { id: 'fp7', title: 'Coolant leak from water pump - DIY or garage?', body: 'Noticed a small coolant leak coming from what looks like the water pump area on my 330i.', type: 'question', category: 'troubleshooting', author: 'DIYMechanic', createdAt: '2024-02-11T11:15:00Z', upvotes: 34, downvotes: 0, comments: 28 },
  { id: 'fp8', title: 'Coilover recommendations under £1500?', body: 'Looking for a good set of coilovers for my MX-5 NB. Budget is around £1500.', type: 'question', category: 'mods', author: 'MX5Mike', createdAt: '2024-02-10T15:45:00Z', upvotes: 67, downvotes: 2, comments: 41 },
];

export const seedForumComments: ForumComment[] = [
  { id: 'fc1', postId: 'fp1', author: 'TrackDayPro', content: 'I run Motul 300V 10W-40 in my E46 M3. It\'s designed for track use.', createdAt: '2024-02-14T11:00:00Z', upvotes: 15, downvotes: 0, replies: [
    { id: 'fc1r1', postId: 'fp1', parentId: 'fc1', author: 'BimmerFan92', content: 'Thanks! How often do you change it if you\'re doing track days regularly?', createdAt: '2024-02-14T11:30:00Z', upvotes: 3, downvotes: 0 },
    { id: 'fc1r2', postId: 'fp1', parentId: 'fc1', author: 'TrackDayPro', content: 'Every 3-4 track days or 3000 miles, whichever comes first.', createdAt: '2024-02-14T12:00:00Z', upvotes: 8, downvotes: 0 },
  ]},
  { id: 'fc2', postId: 'fp1', author: 'OilExpert', content: 'Red Line 5W-30 is another solid option.', createdAt: '2024-02-14T13:00:00Z', upvotes: 12, downvotes: 1 },
  { id: 'fc3', postId: 'fp1', author: 'E46Fanatic', content: 'Whatever you choose, make sure you\'re checking oil temps on track.', createdAt: '2024-02-14T14:30:00Z', upvotes: 21, downvotes: 0, replies: [
    { id: 'fc3r1', postId: 'fp1', parentId: 'fc3', author: 'BimmerFan92', content: 'Good point - I do have a factory oil cooler but might upgrade.', createdAt: '2024-02-14T15:00:00Z', upvotes: 2, downvotes: 0 },
  ]},
];

export const seedMarketplaceListings: MarketplaceListing[] = [
  { id: 'ml1', title: '2019 BMW M3 Competition', price: '£52,995', location: 'London', category: 'Cars', image: null, mileage: '24,000 miles', createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'ml2', title: '2021 Ducati Panigale V4', price: '£18,500', location: 'Birmingham', category: 'Bikes', image: null, mileage: '3,200 miles', createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'ml3', title: 'Genuine BBS LM Wheels 19"', price: '£2,800', location: 'Manchester', category: 'Parts', image: null, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'ml4', title: '2018 Porsche 911 Carrera S', price: '£79,995', location: 'Surrey', category: 'Cars', image: null, mileage: '18,500 miles', createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'ml5', title: 'Akrapovic Exhaust - S1000RR', price: '£1,200', location: 'Leeds', category: 'Parts', image: null, createdBy: 'user-seed', createdAt: '2024-02-01' },
  { id: 'ml6', title: '2020 Honda CBR1000RR-R', price: '£16,995', location: 'Bristol', category: 'Bikes', image: null, mileage: '5,800 miles', createdBy: 'user-seed', createdAt: '2024-02-01' },
];
