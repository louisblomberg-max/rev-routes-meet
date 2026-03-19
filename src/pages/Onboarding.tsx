import { useNavigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding, TOTAL_ONBOARDING_STEPS } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import { usePlan } from '@/contexts/PlanContext';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import FeatureSlide from '@/components/onboarding/FeatureSlide';
import AccountStep from '@/components/onboarding/AccountStep';
import UsernameStep from '@/components/onboarding/UsernameStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import GarageStep from '@/components/onboarding/GarageStep';
import DrivingStyleStep from '@/components/onboarding/DrivingStyleStep';
import VehicleInterestsStep from '@/components/onboarding/VehicleInterestsStep';
import InterestsStep from '@/components/onboarding/InterestsStep';
import GoalsStep from '@/components/onboarding/GoalsStep';
import ClubDiscoveryStep from '@/components/onboarding/ClubDiscoveryStep';
import EnableNotificationsStep from '@/components/onboarding/EnableNotificationsStep';
import EnableLocationStep from '@/components/onboarding/EnableLocationStep';
import PlanStep from '@/components/onboarding/PlanStep';

const FEATURE_SLIDES = [
  {
    title: 'Discover Meets & Events',
    description: 'Find car meets, shows, drive-outs and track days happening around you.',
    highlights: ['Explore events on the map', 'Join community organised meets', 'Create your own events'],
    gradient: 'from-primary/20 via-transparent to-transparent',
  },
  {
    title: 'Explore Driving Routes',
    description: 'Discover incredible driving roads shared by the community.',
    highlights: ['Scenic roads', 'Twisty routes', 'GPX route uploads', 'Navigation ready routes'],
    gradient: 'from-primary/15 via-transparent to-transparent',
  },
  {
    title: 'Find Trusted Automotive Services',
    description: 'Locate mechanics, detailers, tuners and specialists near you.',
    highlights: ['Search nearby garages', 'Discover trusted services', 'Navigate directly to locations'],
    gradient: 'from-primary/10 via-transparent to-transparent',
  },
  {
    title: 'Join Clubs & Communities',
    description: 'Connect with people who share your passion.',
    highlights: ['Join local clubs', 'Organise group drives', 'Share posts and updates'],
    gradient: 'from-primary/15 via-transparent to-transparent',
  },
  {
    title: 'Get Help When You Need It',
    description: 'RevNet connects drivers so help is always nearby.',
    highlights: ['Request help from nearby drivers', 'Offer assistance to others', 'Find nearby recovery services', 'Share your location for fast support'],
    gradient: 'from-primary/20 via-transparent to-transparent',
  },
];

/*
  STEP MAP (18 steps total):
  0: Welcome
  1-5: Feature slides
  6: Create Account
  7: Username
  8: Profile Setup
  9: Add Vehicles
  10: Driving Style
  11: Vehicle Interests
  12: Personalise Feed
  13: Goals / Intent
  14: Club Discovery
  15: Enable Notifications
  16: Enable Location
  17: Choose Plan (final — triggers completion)
*/

const OnboardingContent = () => {
  const navigate = useNavigate();
  const { step, next, back, data, clearOnboarding } = useOnboarding();
  const { register, updateProfile, completeOnboarding } = useAuth();
  const { addVehicle, updatePreferences } = useGarage();
  const { setPlan, setBillingCycle, setSubscriptionStatus } = usePlan();

  const handleComplete = async () => {
    try {
      // 1. Create auth account
      await register(data.email, data.password, data.username || 'User');

      // 2. Sync profile to AuthContext
      updateProfile({
        username: data.username,
        displayName: data.username || 'User',
        bio: data.bio,
        avatar: data.avatarUrl,
        location: data.location,
        membershipPlan: data.plan,
        interests: {
          events: data.eventTypes,
          routes: data.routeTypes,
          services: data.serviceTypes,
          clubs: data.communityTypes.length > 0,
          marketplace: data.goals.includes('buy_sell'),
        },
        notificationPrefs: {
          newEventsNearby: data.notifications.newEventsNearby,
          friendsNearby: data.notifications.nearbyDrivers,
          clubAnnouncements: data.notifications.clubActivity,
          marketplaceMessages: data.notifications.marketplaceMessages,
          sosAlerts: data.notifications.sosAlerts,
        },
        permissions: {
          notificationsEnabled: data.permissions.notificationsEnabled,
          locationEnabled: data.permissions.locationEnabled,
        },
        locationPermissionStatus: data.locationPermissionStatus,
        vehicleTypes: data.vehicles.some(v => v.vehicleType === 'motorcycle')
          ? ['car', 'motorcycle']
          : data.vehicles.length > 0 ? ['car'] : [],
        vehicleTags: data.vehicleInterests,
      });

      // 3. Sync to GarageContext
      updatePreferences({
        interests: [...data.eventTypes, ...data.routeTypes, ...data.serviceTypes, ...data.communityTypes],
        vehicleTypes: data.vehicles.some(v => v.vehicleType === 'motorcycle') ? ['car', 'motorcycle'] : ['car'],
        notifications: {
          newEventsNearby: data.notifications.newEventsNearby,
          friendsNearby: data.notifications.nearbyDrivers,
          clubAnnouncements: data.notifications.clubActivity,
          marketplaceMessages: data.notifications.marketplaceMessages,
          sosAlerts: data.notifications.sosAlerts,
        },
      });

      // 4. Save vehicles
      for (const v of data.vehicles.filter(v => v.make.trim())) {
        addVehicle({
          userId: '',
          vehicleType: v.vehicleType,
          make: v.make,
          model: v.model,
          year: v.year ? parseInt(v.year) : undefined,
          trim: v.trim || undefined,
          engine: v.engine || undefined,
          transmission: (v.transmission as any) || undefined,
          drivetrain: (v.drivetrain as any) || undefined,
          colour: v.colour || undefined,
          numberPlate: v.numberPlate || undefined,
          mileage: v.mileage ? parseInt(v.mileage) : undefined,
          tags: v.tags || [],
          modsText: v.modsText || undefined,
          photos: v.photos || [],
          visibility: v.visibility || 'public',
          isPrimary: v.isPrimary || data.vehicles.indexOf(v) === 0,
        });
      }

      // 5. Sync plan
      setPlan(data.plan);
      setBillingCycle(data.billingCycle);
      setSubscriptionStatus(data.plan === 'free' ? 'active' : 'selected');

      // 6. Complete
      completeOnboarding();
      clearOnboarding();
      navigate('/');
    } catch {
      // Error handled in step UI
    }
  };

  const renderStep = () => {
    if (step === 0) return <WelcomeStep />;
    if (step >= 1 && step <= 5) {
      const slideIdx = step - 1;
      const slide = FEATURE_SLIDES[slideIdx];
      return (
        <FeatureSlide
          title={slide.title}
          description={slide.description}
          highlights={slide.highlights}
          gradient={slide.gradient}
          slideIndex={slideIdx}
          totalSlides={FEATURE_SLIDES.length}
        />
      );
    }
    if (step === 6) return <AccountStep isFirstStep />;
    if (step === 7) return <UsernameStep />;
    if (step === 8) return <ProfileStep />;
    if (step === 9) return <GarageStep />;
    if (step === 10) return <DrivingStyleStep />;
    if (step === 11) return <VehicleInterestsStep />;
    if (step === 12) return <InterestsStep />;
    if (step === 13) return <GoalsStep />;
    if (step === 14) return <ClubDiscoveryStep />;
    if (step === 15) return <EnableNotificationsStep />;
    if (step === 16) return <EnableLocationStep />;
    if (step === 17) return <PlanStep onComplete={handleComplete} />;
    return null;
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#f3f3e8' }}>
      {renderStep()}
    </div>
  );
};

const Onboarding = () => (
  <OnboardingProvider>
    <OnboardingContent />
  </OnboardingProvider>
);

export default Onboarding;
