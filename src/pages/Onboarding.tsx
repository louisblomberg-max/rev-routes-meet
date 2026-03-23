import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import { usePlan } from '@/contexts/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getPriceId } from '@/config/stripe';
import ProfileStep from '@/components/onboarding/ProfileStep';
import UsernameStep from '@/components/onboarding/UsernameStep';
import GarageStep from '@/components/onboarding/GarageStep';
import EnableNotificationsStep from '@/components/onboarding/EnableNotificationsStep';
import EnableLocationStep from '@/components/onboarding/EnableLocationStep';
import PlanStep, { type PlanSelection } from '@/components/onboarding/PlanStep';

const withTimeout = async <T,>(promise: Promise<T>, ms: number, msg: string): Promise<T> => {
  let tid: ReturnType<typeof setTimeout> | undefined;
  const tp = new Promise<never>((_, reject) => { tid = setTimeout(() => reject(new Error(msg)), ms); });
  try { return await Promise.race([promise, tp]); } finally { if (tid) clearTimeout(tid); }
};

const OnboardingContent = () => {
  const navigate = useNavigate();
  const { step, data, clearOnboarding } = useOnboarding();
  const { updateProfile, completeOnboarding, user } = useAuth();
  const { addVehicle } = useGarage();
  const { setPlan, setBillingCycle, setSubscriptionStatus } = usePlan();

  useEffect(() => {
    if (user && user.onboardingComplete) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleComplete = async (selection: PlanSelection) => {
    console.log('=== ONBOARDING COMPLETE CALLED ===');
    console.log('Full onboardingData:', JSON.stringify(data, null, 2));
    console.log('Vehicles in context:', data.vehicles);
    console.log('Vehicles length:', data.vehicles?.length);

    try {
      const { data: { session: currentSession } } = await withTimeout(
        supabase.auth.getSession(), 10000, 'Session check timed out.'
      );

      let activeSession = currentSession;
      if (!activeSession) {
        const { data: refreshData, error: refreshError } = await withTimeout(
          supabase.auth.refreshSession(), 10000, 'Session refresh timed out.'
        );
        if (refreshError || !refreshData.session) {
          toast.error('Session expired. Please sign in again.');
          navigate('/auth/login');
          return;
        }
        activeSession = refreshData.session;
      }

      if (!activeSession?.user?.id) {
        toast.error('Session expired. Please sign in again.');
        navigate('/auth/login');
        return;
      }

      const userId = activeSession.user.id;

      // 1. Save profile
      const profileUpdates: Record<string, unknown> = {
        onboarding_complete: true,
        onboarding_step: 6,
      };
      if (data.username) profileUpdates.username = data.username.toLowerCase();
      if (data.bio) profileUpdates.bio = data.bio;
      if (data.avatarUrl) profileUpdates.avatar_url = data.avatarUrl;
      if (data.location) profileUpdates.location = data.location;
      if (!profileUpdates.display_name && data.username) {
        profileUpdates.display_name = data.username;
      }

      const { error: profileError } = await supabase.from('profiles').update(profileUpdates).eq('id', userId);
      if (profileError) {
        console.error('[Onboarding] Profile error:', profileError);
        toast.error('Failed to save profile: ' + profileError.message);
        return;
      }

      // 2. Save vehicles
      const vehiclesToSave = (data.vehicles || []).filter((v: any) => v.make && String(v.make).trim());
      console.log('[Onboarding] Vehicles to save:', vehiclesToSave.length, JSON.stringify(vehiclesToSave.map((v: any) => ({ make: v.make, model: v.model }))));

      if (vehiclesToSave.length > 0) {
        const vehicleRows = vehiclesToSave.map((v: any, index: number) => ({
          user_id: userId,
          vehicle_type: v.vehicleType || v.vehicle_type || 'car',
          make: String(v.make).trim(),
          model: v.model ? String(v.model).trim() : null,
          year: v.year ? String(v.year) : null,
          engine: v.engine ? String(v.engine).trim() : null,
          transmission: v.transmission || null,
          drivetrain: v.drivetrain || null,
          colour: v.colour ? String(v.colour).trim() : null,
          number_plate: v.numberPlate || v.number_plate || null,
          tags: v.tags || [],
          mods_text: v.modsText || v.mods_text || null,
          photos: [],
          visibility: v.visibility || 'public',
          is_primary: v.isPrimary || v.is_primary || index === 0,
        }));

        console.log('[Onboarding] Vehicle rows to insert:', JSON.stringify(vehicleRows));

        const { data: insertedVehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .insert(vehicleRows)
          .select();

        if (vehicleError) {
          console.error('[Onboarding] Vehicle insert error:', vehicleError);
          toast.error('Could not save vehicles — you can add them later in My Garage');
        } else {
          console.log('[Onboarding] Vehicles saved successfully:', insertedVehicles);
        }
      } else {
        console.log('[Onboarding] No vehicles to save — user skipped garage step');
      }

      // 3. Save notification preference
      await supabase.from('user_preferences').update({
        push_notifications: data.notificationsEnabled,
      }).eq('user_id', userId);

      // 4. Save plan via edge function
      await supabase.functions.invoke('complete-onboarding', {
        body: { plan: selection.plan, billingCycle: selection.billingCycle },
      });

      // 5. Update local state
      updateProfile({
        username: data.username,
        displayName: data.username || user?.displayName || 'User',
        bio: data.bio,
        avatar: data.avatarUrl,
        location: data.location,
        onboardingComplete: true,
        isProfileComplete: true,
      });

      setPlan('free');
      setBillingCycle(selection.billingCycle);
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

      // Stripe redirect for paid plans
      if (selection.plan !== 'free') {
        try {
          const priceId = getPriceId(selection.plan as 'pro' | 'club', selection.billingCycle);
          const { data: checkoutData, error: checkoutError } = await withTimeout(
            supabase.functions.invoke('create-checkout-session', {
              body: {
                price_id: priceId,
                plan: selection.plan,
                user_id: userId,
                success_url: `${window.location.origin}/payment-success`,
                cancel_url: `${window.location.origin}/`,
              },
            }),
            15000,
            'Payment setup timed out.'
          );
          if (!checkoutError && checkoutData?.url) {
            window.location.href = checkoutData.url;
            return;
          }
          toast.error('Payment setup failed — you can upgrade from Settings');
        } catch {
          toast.error('Payment redirect failed — you can upgrade from Settings');
        }
      }

      navigate('/', { replace: true });
      toast.success('Welcome to RevNet!');
    } catch (err) {
      console.error('[Onboarding] Error:', err);
      toast.error('Failed to save your profile. Please try again.');
    }
  };

  // 6 steps: 0=Profile, 1=Username, 2=Garage, 3=Notifications, 4=Location, 5=Plan
  const renderStep = () => {
    switch (step) {
      case 0: return <ProfileStep />;
      case 1: return <UsernameStep />;
      case 2: return <GarageStep />;
      case 3: return <EnableNotificationsStep />;
      case 4: return <EnableLocationStep />;
      case 5: return <PlanStep onComplete={handleComplete} />;
      default: return <ProfileStep />;
    }
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
