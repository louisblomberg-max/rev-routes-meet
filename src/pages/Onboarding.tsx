import { useNavigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import FeatureSlide from '@/components/onboarding/FeatureSlide';
import AccountStep from '@/components/onboarding/AccountStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import UsernameStep from '@/components/onboarding/UsernameStep';
import GarageStep from '@/components/onboarding/GarageStep';
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

/**
 * New onboarding order:
 * 0: Welcome
 * 1-5: Feature slides
 * 6: Account creation (email/password) — creates Supabase account FIRST
 * 7: Profile (avatar, bio, location)
 * 8: Username
 * 9: Garage (vehicles)
 * 10: Enable Notifications
 * 11: Enable Location
 * 12: Choose Plan — final step, batch saves then navigates to map
 */

const OnboardingContent = () => {
  const navigate = useNavigate();
  const { step, next, back, data, clearOnboarding } = useOnboarding();
  const { updateProfile, completeOnboarding, user } = useAuth();
  const { addVehicle, updatePreferences } = useGarage();
  const { setPlan, setBillingCycle, setSubscriptionStatus } = usePlan();

  // Called after AccountStep creates the Supabase account
  const handleAccountCreated = async () => {
    // Account is now created via Supabase auth — the trigger auto-creates
    // profiles, subscriptions, and user_preferences rows.
    // Just advance to the next step (profile personalization).
    next();
  };

  // Called after the final Plan step
  const handleComplete = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        toast.error('Session expired. Please sign in again.');
        navigate('/auth');
        return;
      }

      // Batch update profile data to Supabase
      const profileUpdates: Record<string, unknown> = {};
      if (data.username) profileUpdates.username = data.username;
      if (data.bio) profileUpdates.bio = data.bio;
      if (data.avatarUrl) profileUpdates.avatar_url = data.avatarUrl;
      if (data.location) profileUpdates.location = data.location;
      profileUpdates.onboarding_complete = true;
      profileUpdates.onboarding_step = 13;
      profileUpdates.plan = data.plan;

      await supabase.from('profiles').update(profileUpdates).eq('id', userId);

      // Update subscription if not free
      if (data.plan !== 'free') {
        await supabase.from('subscriptions').update({
          plan: data.plan,
          billing_cycle: data.billingCycle,
          status: 'active',
        }).eq('user_id', userId);
      }

      // Save vehicles
      for (const v of data.vehicles.filter(v => v.make.trim())) {
        const { error } = await supabase.from('vehicles').insert({
          user_id: userId,
          vehicle_type: v.vehicleType,
          make: v.make,
          model: v.model,
          year: v.year || null,
          engine: v.engine || null,
          transmission: v.transmission || null,
          drivetrain: v.drivetrain || null,
          colour: v.colour || null,
          number_plate: v.numberPlate || null,
          tags: v.tags || [],
          mods_text: v.modsText || null,
          photos: v.photos || [],
          visibility: v.visibility || 'public',
          is_primary: v.isPrimary || data.vehicles.indexOf(v) === 0,
        });
        if (error) console.error('Vehicle save error:', error);
      }

      // Sync to local contexts
      updateProfile({
        username: data.username,
        displayName: data.username || user?.displayName || 'User',
        bio: data.bio,
        avatar: data.avatarUrl,
        location: data.location,
        membershipPlan: data.plan,
        onboardingComplete: true,
        isProfileComplete: true,
      });

      setPlan(data.plan);
      setBillingCycle(data.billingCycle);
      setSubscriptionStatus(data.plan === 'free' ? 'active' : 'selected');

      // Sync vehicles to GarageContext
      for (const v of data.vehicles.filter(v => v.make.trim())) {
        addVehicle({
          userId,
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

      completeOnboarding();
      clearOnboarding();
      navigate('/');
    } catch (err) {
      console.error('Onboarding completion error:', err);
      toast.error('Failed to save your profile. Please try again.');
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
    // Step 6: Account creation FIRST
    if (step === 6) return <AccountStep onComplete={handleAccountCreated} />;
    // Steps 7-12: Personalization (account already exists)
    if (step === 7) return <ProfileStep />;
    if (step === 8) return <UsernameStep />;
    if (step === 9) return <GarageStep />;
    if (step === 10) return <EnableNotificationsStep />;
    if (step === 11) return <EnableLocationStep />;
    if (step === 12) return <PlanStep onComplete={handleComplete} />;
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
