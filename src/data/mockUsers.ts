// ============================
// Mock User Presets for Dev/Test
// ============================

import type { AuthUser } from '@/contexts/AuthContext';
import type { PlanId } from '@/contexts/PlanContext';

export interface MockUserPreset {
  id: string;
  label: string;
  description: string;
  planId: PlanId;
  eventCredits: number;
  routeCredits: number;
  authUser: AuthUser;
}

const baseUser = (overrides: Partial<AuthUser> & { id: string }): AuthUser => ({
  email: undefined,
  phone: undefined,
  displayName: 'Test User',
  username: 'testuser',
  avatar: null,
  bio: '',
  membershipPlan: 'free',
  billingCycle: 'yearly',
  subscriptionStatus: 'active',
  isProfileComplete: true,
  isVerified: true,
  onboardingComplete: true,
  onboardingStep: 4,
  interests: { events: ['Meets'], routes: ['Scenic'], services: ['Mechanic'], clubs: true, marketplace: false },
  vehicleTypes: ['cars'],
  vehicleTags: [],
  discoveryRadiusMiles: 25,
  discoveryScope: 'local' as const,
  notificationPrefs: { newEventsNearby: true, friendsNearby: false, clubAnnouncements: false, marketplaceMessages: false, sosAlerts: true },
  vehicles: [] as any[],
  preferences: {
    mapStyle: 'standard',
    availableToHelp: false,
    helpDistanceMiles: 10,
    locationSharingEnabled: false,
    notifications: { messages: true, events: true, clubs: true, forums: true, marketplace: true },
  },
  liveFeatures: { locationSharingEnabled: false, groupDrivesCount: 0, breakdownHelpCount: 0 },
  eventCredits: 2,
  routeCredits: 2,
  createdAt: '2024-01-15T00:00:00Z',
  ...overrides,
});

export const MOCK_USER_PRESETS: MockUserPreset[] = [
  {
    id: 'free-with-credits',
    label: 'Free (2 credits)',
    description: 'Free member with 2 event credits remaining',
    planId: 'free',
    eventCredits: 2,
    routeCredits: 2,
    authUser: baseUser({
      id: 'user-free-credits',
      email: 'free-credits@revnet.test',
      displayName: 'Alex Free',
      username: 'alexfree',
      membershipPlan: 'free',
      bio: 'Just getting started with RevNet!',
      location: 'London, UK',
    }),
  },
  {
    id: 'free-no-credits',
    label: 'Free (0 credits)',
    description: 'Free member with zero credits — triggers paywalls',
    planId: 'free',
    eventCredits: 0,
    routeCredits: 0,
    authUser: baseUser({
      id: 'user-free-empty',
      email: 'free-empty@revnet.test',
      displayName: 'Jordan Broke',
      username: 'jordanbroke',
      membershipPlan: 'free',
      bio: 'Car enthusiast on a budget',
      location: 'Manchester, UK',
    }),
  },
  {
    id: 'pro-driver',
    label: 'Pro Driver',
    description: 'Pro subscription (£3.99/mo) — unlimited events & routes',
    planId: 'pro',
    eventCredits: -1, // unlimited
    routeCredits: -1,
    authUser: baseUser({
      id: 'user-pro',
      email: 'pro@revnet.test',
      displayName: 'Sam Pro',
      username: 'sampro',
      membershipPlan: 'pro',
      bio: 'Track day addict 🏎️',
      location: 'Birmingham, UK',
      vehicles: [
        { id: 'v1', type: 'car', make: 'BMW', model: 'M3 Competition', year: '2022', isPrimary: true },
      ],
    }),
  },
  {
    id: 'club-business',
    label: 'Club / Business',
    description: 'Club subscription (£6.99/mo) — clubs + services unlocked',
    planId: 'club',
    eventCredits: -1,
    routeCredits: -1,
    authUser: baseUser({
      id: 'user-club',
      email: 'club@revnet.test',
      displayName: 'Taylor Club',
      username: 'taylorclub',
      membershipPlan: 'club',
      bio: 'Running Porsche Club GB since 2019',
      location: 'Surrey, UK',
      vehicles: [
        { id: 'v2', type: 'car', make: 'Porsche', model: '911 GT3', year: '2023', isPrimary: true },
        { id: 'v3', type: 'car', make: 'Porsche', model: 'Cayenne', year: '2021', isPrimary: false },
      ],
    }),
  },
  {
    id: 'admin-test',
    label: 'Admin (All unlocked)',
    description: 'Full access — every feature enabled for testing',
    planId: 'club',
    eventCredits: 99,
    routeCredits: 99,
    authUser: baseUser({
      id: 'user-admin',
      email: 'admin@revnet.test',
      displayName: 'Dev Admin',
      username: 'devadmin',
      membershipPlan: 'club',
      bio: 'RevNet dev & test account',
      location: 'London, UK',
      vehicles: [
        { id: 'v4', type: 'car', make: 'Ferrari', model: '296 GTB', year: '2024', isPrimary: true },
        { id: 'v5', type: 'motorcycle', make: 'Ducati', model: 'Panigale V4', year: '2023', isPrimary: false },
      ],
    }),
  },
];
