import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zwfbncnephciqywnmdns.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZmJuY25lcGhjaXF5d25tZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODI1MzYsImV4cCI6MjA4OTc1ODUzNn0.GiMvSdmbKh0vvUGsKhvEmFW_MCzYhS9U9lJxyFKkK2s'
);

// Sign in as test user
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node scripts/seed-test-data.mjs <email> <password>');
  process.exit(1);
}

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
if (authError) {
  console.error('Auth failed:', authError.message);
  process.exit(1);
}

const userId = authData.user.id;
console.log('Authenticated as:', userId);

// Check existing profiles
const { data: profiles } = await supabase.from('profiles').select('id, display_name').limit(5);
console.log('Existing profiles:', profiles?.map(p => `${p.id} (${p.display_name})`));

const createdBy = userId;

// Insert 5 test events at UK locations
const events = [
  {
    created_by: createdBy, title: 'London Classic Car Meet', description: 'Monthly classic car gathering in central London. All classics welcome — bring your pride and joy for a relaxed Sunday morning meet.',
    lat: 51.5074, lng: -0.1278, type: 'meets', date_start: '2026-05-10T10:00:00Z', date_end: '2026-05-10T14:00:00Z',
    location: 'Hyde Park Corner, London', vehicle_focus: 'all_welcome', meet_style_tags: ['Classics', 'Show and Shine'],
    visibility: 'public', status: 'published', max_attendees: 200, is_free: true, entry_fee: 0,
  },
  {
    created_by: createdBy, title: 'Manchester JDM Night', description: 'The biggest JDM meet in the North West. Bring your Skylines, Supras, NSXs and everything in between. Modified welcome.',
    lat: 53.4808, lng: -2.2426, type: 'meets', date_start: '2026-05-17T19:00:00Z', date_end: '2026-05-17T23:00:00Z',
    location: 'Event City, Manchester', vehicle_focus: 'cars_only', vehicle_brands: ['Nissan', 'Toyota', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi'],
    meet_style_tags: ['JDM', 'Modified'], visibility: 'public', status: 'published', max_attendees: 500, is_free: true, entry_fee: 0,
  },
  {
    created_by: createdBy, title: 'Birmingham Supercar Sunday', description: 'Monthly supercar and hypercar showcase at the NEC. See the rarest machines in the Midlands. Spectators and owners welcome.',
    lat: 52.4862, lng: -1.8904, type: 'shows', date_start: '2026-05-24T09:00:00Z', date_end: '2026-05-24T16:00:00Z',
    location: 'NEC Birmingham', vehicle_focus: 'cars_only', meet_style_tags: ['Supercars'],
    visibility: 'public', status: 'published', max_attendees: 1000, is_free: false, entry_fee: 10, is_ticketed: true, ticket_price: 10,
  },
  {
    created_by: createdBy, title: 'Peak District Group Drive', description: 'Scenic drive through the best roads of the Peak District. Meet at the start point at 9am sharp. 80 mile route with pub lunch stop.',
    lat: 53.3497, lng: -1.7693, type: 'drive', date_start: '2026-06-01T09:00:00Z', date_end: '2026-06-01T15:00:00Z',
    location: 'Chatsworth House, Derbyshire', vehicle_focus: 'all_welcome', meet_style_tags: ['European'],
    visibility: 'public', status: 'published', max_attendees: 30, is_free: true, entry_fee: 0,
  },
  {
    created_by: createdBy, title: 'Brands Hatch Track Day', description: 'Open pit lane track day at Brands Hatch Indy circuit. Helmets mandatory. Noise limit 105dB. All experience levels welcome.',
    lat: 51.3569, lng: 0.2631, type: 'track_day', date_start: '2026-06-14T08:00:00Z', date_end: '2026-06-14T17:00:00Z',
    location: 'Brands Hatch, Kent', vehicle_focus: 'cars_only', meet_style_tags: ['Track Focus'],
    visibility: 'public', status: 'published', max_attendees: 40, is_free: false, entry_fee: 149, is_ticketed: true, ticket_price: 149,
  },
];

console.log('\nInserting 5 events...');
const { data: insertedEvents, error: eventsError } = await supabase.from('events').insert(events).select('id, title, lat, lng');
if (eventsError) {
  console.error('Events insert error:', eventsError.message);
} else {
  console.log('Events inserted:');
  insertedEvents.forEach(e => console.log(`  ✓ ${e.title} (${e.lat}, ${e.lng})`));
}

// Insert 3 test routes
const routes = [
  {
    created_by: createdBy, name: 'North Wales Dragon Run', description: 'The legendary A5 through Snowdonia. 100 miles of sweeping bends through stunning mountain scenery. One of the best driving roads in the UK.',
    lat: 53.0685, lng: -3.8547, type: 'Scenic', difficulty: 'moderate', distance_meters: 160934,
    duration_minutes: 180, visibility: 'public', status: 'published',
  },
  {
    created_by: createdBy, name: 'Cotswolds Sunday Cruise', description: 'Gentle cruise through honey-stone villages and rolling hills. Perfect for classic cars and Sunday drives. Stops at Broadway Tower and Bourton-on-the-Water.',
    lat: 51.9307, lng: -1.7035, type: 'Scenic', difficulty: 'easy', distance_meters: 80467,
    duration_minutes: 120, visibility: 'public', status: 'published',
  },
  {
    created_by: createdBy, name: 'Lake District Mountain Pass', description: 'Epic mountain pass route taking in Kirkstone Pass, Honister Pass, and Hardknott Pass. Not for the faint-hearted — steep gradients and tight hairpins.',
    lat: 54.4609, lng: -3.0886, type: 'Mountain', difficulty: 'challenging', distance_meters: 96561,
    duration_minutes: 150, visibility: 'public', status: 'published',
  },
];

console.log('\nInserting 3 routes...');
const { data: insertedRoutes, error: routesError } = await supabase.from('routes').insert(routes).select('id, name, lat, lng');
if (routesError) {
  console.error('Routes insert error:', routesError.message);
} else {
  console.log('Routes inserted:');
  insertedRoutes.forEach(r => console.log(`  ✓ ${r.name} (${r.lat}, ${r.lng})`));
}

// Insert 3 test services
const services = [
  {
    created_by: createdBy, name: 'Ace Cafe London', description: 'Legendary biker and car cafe on the North Circular. Open 7 days a week. Regular themed nights and meets.',
    lat: 51.5406, lng: -0.2557, service_type: 'cafe', address: '1 Old North Circular Rd, London NW10 7UD',
    phone: '020 8961 1000', website: 'https://acecafe.co.uk', visibility: 'public',
  },
  {
    created_by: createdBy, name: 'Litchfield Motors', description: 'Independent Nissan GT-R specialist in Gloucester. Tuning, servicing and performance parts for all GTR models from R32 to R36.',
    lat: 51.8642, lng: -2.2383, service_type: 'garage', address: 'Gloucester Business Park, GL3 4AH',
    phone: '01onal 727 7776', website: 'https://litchfieldmotors.com', visibility: 'public',
  },
  {
    created_by: createdBy, name: 'Silverstone Circuit Experiences', description: 'Drive a supercar on the iconic Silverstone Grand Prix circuit. Ferrari, Lamborghini, Aston Martin experiences available.',
    lat: 52.0713, lng: -1.0146, service_type: 'experience', address: 'Silverstone Circuit, Towcester NN12 8TN',
    phone: '08433 750 740', website: 'https://silverstone.co.uk', visibility: 'public',
  },
];

console.log('\nInserting 3 services...');
const { data: insertedServices, error: servicesError } = await supabase.from('services').insert(services).select('id, name, lat, lng');
if (servicesError) {
  console.error('Services insert error:', servicesError.message);
} else {
  console.log('Services inserted:');
  insertedServices.forEach(s => console.log(`  ✓ ${s.name} (${s.lat}, ${s.lng})`));
}

// Verify by selecting back
console.log('\n--- Verification ---');
const { data: allEvents } = await supabase.from('events').select('id, title, lat, lng').eq('created_by', createdBy).eq('status', 'published');
console.log(`Events in DB: ${allEvents?.length || 0}`);

const { data: allRoutes } = await supabase.from('routes').select('id, name, lat, lng').eq('created_by', createdBy).eq('status', 'published');
console.log(`Routes in DB: ${allRoutes?.length || 0}`);

const { data: allServices } = await supabase.from('services').select('id, name, lat, lng').eq('created_by', createdBy);
console.log(`Services in DB: ${allServices?.length || 0}`);

console.log('\nDone! Refresh the map to see pins.');
await supabase.auth.signOut();
