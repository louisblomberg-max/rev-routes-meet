import { useNavigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding, TOTAL_ONBOARDING_STEPS } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import { usePlan } from '@/contexts/PlanContext';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import FeatureSlide from '@/components/onboarding/FeatureSlide';
import ProfileStep from '@/components/onboarding/ProfileStep';
import UsernameStep from '@/components/onboarding/UsernameStep';
import GarageStep from '@/components/onboarding/GarageStep';
import EnableNotificationsStep from '@/components/onboarding/EnableNotificationsStep';
import EnableLocationStep from '@/components/onboarding/EnableLocationStep';
import InterestsStep from '@/components/onboarding/InterestsStep';
import AccountStep from '@/components/onboarding/AccountStep';
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

const OnboardingContent = () => {
  const navigate = useNavigate();
  const { step, next, back, data, clearOnboarding } = useOnboarding();
  const { register, updateProfile, completeOnboarding } = useAuth();
  const { addVehicle, updatePreferences } = useGarage();
  const { setPlan, setBillingCycle, setSubscriptionStatus } = usePlan();

  const handleComplete = async () => {
    try {
      // 1. Create the auth account
      await register(data.email, data.password, data.username || 'User');

      // 2. Sync ALL profile data to AuthContext (master user object)
      updateProfile({
        username: data.username,
        displayName: data.username || 'User',
        bio: data.bio,
        avatar: data.avatarUrl,
        location: data.location,
        membershipPlan: data.plan,
        interests: {
          events: data.interests.filter(i => ['Events', 'Drive-outs', 'Track days', 'Car shows'].includes(i)),
          routes: data.interests.filter(i => ['Scenic routes', 'Twisty roads', 'Off-road routes'].includes(i)),
          services: data.interests.filter(i => ['Mechanics', 'Detailing', 'Tuning', 'Parts suppliers'].includes(i)),
          clubs: data.interests.includes('Car clubs'),
          marketplace: data.interests.includes('Motorcycle groups'),
        },
        notificationPrefs: {
          newEventsNearby: data.notifications.newEventsNearby,
          friendsNearby: data.notifications.nearbyDrivers,
          clubAnnouncements: data.notifications.clubActivity,
          marketplaceMessages: data.notifications.marketplaceMessages,
          sosAlerts: data.notifications.sosAlerts,
        },
        vehicleTypes: data.vehicles.some(v => v.vehicleType === 'motorcycle')
          ? ['car', 'motorcycle']
          : data.vehicles.length > 0 ? ['car'] : [],
      });

      // 3. Sync interests + notifications into GarageContext preferences
      updatePreferences({
        interests: data.interests,
        vehicleTypes: data.vehicles.some(v => v.vehicleType === 'motorcycle') ? ['car', 'motorcycle'] : ['car'],
        notifications: {
          newEventsNearby: data.notifications.newEventsNearby,
          friendsNearby: data.notifications.nearbyDrivers,
          clubAnnouncements: data.notifications.clubActivity,
          marketplaceMessages: data.notifications.marketplaceMessages,
          sosAlerts: data.notifications.sosAlerts,
        },
      });

      // 4. Save onboarding vehicles into GarageContext
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

      // 5. Sync plan + billing cycle + status to PlanContext
      setPlan(data.plan);
      setBillingCycle(data.billingCycle);
      setSubscriptionStatus(data.plan === 'free' ? 'active' : 'selected');

      // 6. Mark onboarding complete & clean up
      completeOnboarding();
      clearOnboarding();
      navigate('/');
    } catch {
      // Error handled in AccountStep
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
    if (step === 6) return <ProfileStep />;
    if (step === 7) return <UsernameStep />;
    if (step === 8) return <GarageStep />;
    if (step === 9) return <EnableNotificationsStep />;
    if (step === 10) return <EnableLocationStep />;
    if (step === 11) return <InterestsStep />;
    if (step === 12) return <PlanStep />;
    if (step === 13) return <AccountStep onComplete={handleComplete} />;
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
