import { useNavigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPriceId } from '@/config/stripe';
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

const OnboardingContent = () => {
  const navigate = useNavigate();
  const { step, next, back, data, clearOnboarding } = useOnboarding();
  const { updateProfile, completeOnboarding, user } = useAuth();
  const { addVehicle } = useGarage();
  const { setPlan, setBillingCycle, setSubscriptionStatus } = usePlan();

  const handleAccountCreated = async () => {
    next();
  };

  const handleComplete = async () => {
    try {
      // Refresh session to prevent "session expired" errors
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession();
      if (sessionError || !sessionData.session) {
        console.error('[Onboarding] Session refresh failed:', sessionError);
        toast.error('Session expired. Please sign in again.');
        navigate('/auth/login');
        return;
      }
      const userId = sessionData.session.user.id;
      console.log('[Onboarding] Batch save starting for user:', userId);

      // Read the latest data from context — PlanStep updates it before calling onComplete
      const selectedPlan = data.plan;
      const selectedBilling = data.billingCycle;
      console.log('[Onboarding] Plan:', selectedPlan, 'Billing:', selectedBilling);

      const profileUpdates: Record<string, unknown> = {};
      if (data.username) profileUpdates.username = data.username;
      if (data.bio) profileUpdates.bio = data.bio;
      if (data.avatarUrl) profileUpdates.avatar_url = data.avatarUrl;
      if (data.location) profileUpdates.location = data.location;
      profileUpdates.onboarding_complete = true;
      profileUpdates.onboarding_step = 13;

      const { error: profileError } = await supabase.from('profiles').update(profileUpdates).eq('id', userId);
      if (profileError) {
        console.error('[Onboarding] Profile update error:', profileError);
        toast.error('Failed to save profile: ' + profileError.message);
        return;
      }
      console.log('[Onboarding] Profile saved successfully');

      for (const v of data.vehicles.filter(v => v.make.trim())) {
        const { error: vehicleError } = await supabase.from('vehicles').insert({
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
        if (vehicleError) {
          console.error('[Onboarding] Vehicle insert error:', vehicleError);
        }
      }

      updateProfile({
        username: data.username,
        displayName: data.username || user?.displayName || 'User',
        bio: data.bio,
        avatar: data.avatarUrl,
        location: data.location,
        onboardingComplete: true,
        isProfileComplete: true,
      });

      setPlan('free'); // Stay free until payment confirmed
      setBillingCycle(selectedBilling);
      setSubscriptionStatus('active');

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

      // If paid plan selected, redirect to Stripe AFTER onboarding is saved
      if (selectedPlan && selectedPlan !== 'free') {
        try {
          const priceId = getPriceId(selectedPlan as 'pro' | 'club', selectedBilling);
          console.log('[Onboarding] Creating checkout session. Price ID:', priceId, 'Plan:', selectedPlan);

          const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout-session', {
            body: { price_id: priceId, plan: selectedPlan },
          });

          console.log('[Onboarding] Checkout response:', checkoutData, 'Error:', checkoutError);

          if (checkoutError) {
            console.error('[Onboarding] Checkout error:', checkoutError);
            toast.error('Payment setup failed: ' + (checkoutError.message || 'Unknown error'));
            navigate('/');
            return;
          }

          if (!checkoutData?.url) {
            console.error('[Onboarding] No checkout URL returned');
            toast.error('Payment setup error — please try again from Settings');
            navigate('/');
            return;
          }

          console.log('[Onboarding] Redirecting to Stripe:', checkoutData.url);
          window.location.href = checkoutData.url;
          return;
        } catch (e) {
          console.error('[Onboarding] Stripe checkout redirect failed:', e);
          toast.error('Payment redirect failed — you can upgrade from Settings');
          navigate('/');
          return;
        }
      }

      navigate('/');
    } catch (err) {
      console.error('[Onboarding] Completion error:', err);
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
    if (step === 6) return <AccountStep onComplete={handleAccountCreated} />;
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
