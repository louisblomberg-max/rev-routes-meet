import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const BASE = 'http://localhost:8080';
const OUT = '/tmp/screenshots';
const SUPABASE_URL = 'https://zwfbncnephciqywnmdns.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZmJuY25lcGhjaXF5d25tZG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxODI1MzYsImV4cCI6MjA4OTc1ODUzNn0.GiMvSdmbKh0vvUGsKhvEmFW_MCzYhS9U9lJxyFKkK2s';

// Get a real session token from Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'louisblomberg@gmail.com',
  password: 'Splashlouis2805&',
});

if (authError) {
  console.error('Auth failed:', authError.message);
  process.exit(1);
}

const session = authData.session;
console.log('✓ Got Supabase session for user:', authData.user.id);

const routes = [
  { path: '/', name: 'home-map' },
  { path: '/?tab=you', name: 'you-tab' },
  { path: '/?tab=community', name: 'community-tab' },
  { path: '/?tab=marketplace', name: 'marketplace-tab' },
  { path: '/add/event', name: 'add-event' },
  { path: '/add/route', name: 'add-route' },
  { path: '/add/club', name: 'add-club' },
  { path: '/clubs', name: 'clubs' },
  { path: '/forums', name: 'forums' },
  { path: '/messages', name: 'messages' },
  { path: '/friends', name: 'friends' },
  { path: '/notifications', name: 'notifications' },
  { path: '/settings', name: 'settings' },
  { path: '/settings/billing', name: 'settings-plan' },
  { path: '/subscription', name: 'subscription' },
  { path: '/profile', name: 'profile' },
  { path: '/my-garage', name: 'my-garage' },
  { path: '/my-events', name: 'my-events' },
  { path: '/my-routes', name: 'my-routes' },
  { path: '/my-clubs', name: 'my-clubs' },
  { path: '/community', name: 'community' },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

const page = await context.newPage();

// Screenshot auth page first (unauthenticated)
await page.goto(`${BASE}/auth`, { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/auth.png`, fullPage: true });
console.log('✓ auth');

// Inject Supabase session into localStorage before navigating
const storageKey = `sb-zwfbncnephciqywnmdns-auth-token`;
const sessionData = JSON.stringify({
  access_token: session.access_token,
  refresh_token: session.refresh_token,
  expires_in: session.expires_in,
  expires_at: session.expires_at,
  token_type: session.token_type,
  user: session.user,
});

await page.evaluate(({ key, value }) => {
  localStorage.setItem(key, value);
}, { key: storageKey, value: sessionData });

console.log('✓ Injected session into localStorage');

// Navigate to home — should now be authenticated
await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(4000);

const url = page.url();
if (url.includes('/auth') || url.includes('/onboarding')) {
  console.log('⚠ Redirected to:', url, '— taking screenshot anyway');
}

// Screenshot onboarding
await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/onboarding.png`, fullPage: true });
console.log('✓ onboarding');

// Screenshot all routes
for (const route of routes) {
  try {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${OUT}/${route.name}.png`, fullPage: true });
    console.log(`✓ ${route.name}`);
  } catch (e) {
    try {
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${OUT}/${route.name}.png`, fullPage: true });
      console.log(`✓ ${route.name} (fallback)`);
    } catch (e2) {
      console.log(`✗ ${route.name}: ${e2.message}`);
    }
  }
}

await browser.close();
await supabase.auth.signOut();
console.log('\nDone! Screenshots saved to /tmp/screenshots/');
