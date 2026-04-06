import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { validateImageFile } from '@/lib/utils';
import { Camera, Check, X, Bell, MapPin, Plus, Trash2, ChevronDown } from 'lucide-react';
import { getMakesByType, getModelsByMake, getVariantsByModel, getYearsByModel, searchMakes, type VehicleMake } from '@/data/vehicles';
import { PLAN_PRICES, getPriceId } from '@/config/stripe';

const TOTAL_STEPS = 6;

const VEHICLE_TYPES = [
  { id: 'car', label: 'Car' },
  { id: 'motorcycle', label: 'Motorcycle' },
  { id: 'van', label: 'Van' },
  { id: 'classic', label: 'Classic' },
  { id: 'other', label: 'Other' },
] as const;

const MEET_STYLES = [
  'JDM', 'Supercars', 'Muscle Car', 'American', 'European', '4x4',
  'Classics', 'Vintage', 'Modified', 'Show & Shine', 'Track Focus',
  'Charity', 'Family Friendly',
];

interface OnboardingVehicle {
  vehicleType: string;
  makeId: string;
  makeName: string;
  model: string;
  variant: string;
  year: number | null;
  colour: string;
  numberPlate: string;
  visibility: 'public' | 'friends' | 'private';
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 0: Profile Setup
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 1: Username
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Step 2: Garage
  const [vehicles, setVehicles] = useState<OnboardingVehicle[]>([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehType, setVehType] = useState('');
  const [vehMakeId, setVehMakeId] = useState('');
  const [vehMakeName, setVehMakeName] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehVariant, setVehVariant] = useState('');
  const [vehYear, setVehYear] = useState<number | null>(null);
  const [vehColour, setVehColour] = useState('');
  const [vehPlate, setVehPlate] = useState('');
  const [vehVisibility, setVehVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [makeSearch, setMakeSearch] = useState('');

  // Step 5: Plan
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro' | 'club'>('free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (user?.onboardingComplete) {
      navigate('/', { replace: true });
    }
  }, [user?.onboardingComplete, navigate]);

  // Username validation with debounce
  const checkUsername = useCallback(async (value: string) => {
    if (value.length < 3) {
      setUsernameError('Must be at least 3 characters');
      return;
    }
    if (value.length > 20) {
      setUsernameError('Must be 20 characters or less');
      return;
    }
    setCheckingUsername(true);
    try {
      const result = await Promise.race([
        supabase.from('profiles').select('id').eq('username', value).neq('id', user?.id || '').maybeSingle(),
        new Promise<{ data: null }>((resolve) => setTimeout(() => resolve({ data: null }), 5000)),
      ]);
      setCheckingUsername(false);
      if ((result as any)?.data) {
        setUsernameError('Username already taken');
      } else {
        setUsernameError('');
      }
    } catch {
      setCheckingUsername(false);
      setUsernameError('');
    }
  }, [user?.id]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    setUsernameError('');
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    if (val.length >= 3) {
      usernameDebounceRef.current = setTimeout(() => checkUsername(val), 400);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) { toast.error(validationError); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Vehicle form helpers
  const filteredMakes = vehType
    ? (makeSearch
        ? searchMakes(makeSearch, vehType === 'car' || vehType === 'motorcycle' ? vehType : 'all')
        : getMakesByType(vehType === 'car' || vehType === 'motorcycle' ? vehType : 'all'))
    : [];
  const models = vehMakeId ? getModelsByMake(vehMakeId) : [];
  const variants = vehMakeId && vehModel ? getVariantsByModel(vehMakeId, vehModel) : [];
  const years = vehMakeId && vehModel ? getYearsByModel(vehMakeId, vehModel) : [];

  const resetVehicleForm = () => {
    setVehType(''); setVehMakeId(''); setVehMakeName(''); setVehModel('');
    setVehVariant(''); setVehYear(null); setVehColour(''); setVehPlate('');
    setVehVisibility('public'); setMakeSearch(''); setShowVehicleForm(false);
  };

  const addVehicle = () => {
    if (!vehMakeName || !vehModel) {
      toast.error('Please select a make and model');
      return;
    }
    setVehicles(prev => [...prev, {
      vehicleType: vehType, makeId: vehMakeId, makeName: vehMakeName,
      model: vehModel, variant: vehVariant, year: vehYear,
      colour: vehColour, numberPlate: vehPlate, visibility: vehVisibility,
    }]);
    resetVehicleForm();
  };

  const removeVehicle = (index: number) => {
    setVehicles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 0) {
      if (!displayName.trim()) {
        toast.error('Display name is required');
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (username.length < 3 || usernameError) {
        toast.error(usernameError || 'Username must be at least 3 characters');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  const handleSkip = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handleNotificationPermission = async () => {
    try {
      await Notification.requestPermission();
    } catch { /* ignore */ }
    setStep(4);
  };

  const handleLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => setStep(5),
      () => setStep(5),
      { enableHighAccuracy: true, timeout: 12000 },
    );
    // Always advance after 12s
    setTimeout(() => setStep(5), 12000);
  };

  const handlePlanSelect = async (plan: 'free' | 'pro' | 'club', cycle?: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    if (cycle) setBillingCycle(cycle);
    await handleComplete(plan, cycle || billingCycle);
  };

  const handleComplete = async (plan: 'free' | 'pro' | 'club' = selectedPlan, cycle: 'monthly' | 'yearly' = billingCycle) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Safety timeout — if everything hangs, force navigate home after 15s
    const completeTimeout = setTimeout(() => {
      toast.error('Taking too long. Saving what we can...');
      updateProfile({ onboardingComplete: true, isProfileComplete: true, username, displayName: displayName.trim(), bio, location });
      navigate('/', { replace: true });
    }, 15000);

    try {
      // 1. Get session — try getSession first (faster), fall back to refreshSession
      let userId = user?.id;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        userId = session.user.id;
      } else {
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData?.session?.user?.id) {
          userId = refreshData.session.user.id;
        }
      }
      if (!userId) {
        clearTimeout(completeTimeout);
        toast.error('Session expired. Please sign in again.');
        navigate('/auth', { replace: true });
        return;
      }

      // 2. Upload avatar
      let avatarUrl: string | null = null;
      if (avatarFile) {
        const path = `${userId}/avatar.jpg`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
          avatarUrl = urlData.publicUrl;
        }
      }

      // 3. Update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          username: username.toLowerCase() || null,
          bio: bio || null,
          location: location || null,
          avatar_url: avatarUrl || undefined,
          onboarding_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      if (profileError) throw profileError;

      // 4. Insert vehicles
      if (vehicles.length > 0) {
        const vehicleRows = vehicles.filter(v => v.makeName).map(v => ({
          user_id: userId,
          vehicle_type: v.vehicleType || 'car',
          make: v.makeName,
          make_id: v.makeId || null,
          model: v.model || null,
          variant: v.variant || null,
          year: v.year ? String(v.year) : null,
          colour: v.colour || null,
          number_plate: v.numberPlate || null,
          visibility: v.visibility || 'public',
          is_primary: false,
        }));
        if (vehicleRows.length > 0) {
          const { error: vehError } = await supabase.from('vehicles').insert(vehicleRows);
          if (vehError) {
            toast.error(`Vehicle save failed: ${vehError.message}`);
          }
        }
      }

      // 5. Upsert user_preferences
      const { error: prefError } = await supabase.from('user_preferences').upsert({
        user_id: userId,
        vehicle_interests: vehicles.map(v => v.vehicleType).filter((v, i, a) => a.indexOf(v) === i),
        meet_style_preferences: [],
      }, { onConflict: 'user_id' });
      if (prefError) { /* non-blocking */ }

      // 6. Handle plan selection
      clearTimeout(completeTimeout);
      if (plan === 'free' || !plan) {
        updateProfile({ onboardingComplete: true, isProfileComplete: true, username, avatar: avatarUrl || user.avatar, displayName: displayName.trim(), bio, location });
        navigate('/', { replace: true });
        toast.success('Welcome to RevNet!');
      } else {
        // Paid plan — create Stripe checkout
        const priceId = getPriceId(plan, cycle);
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            price_id: priceId,
            user_id: userId,
            success_url: `${window.location.origin}/payment-success`,
            cancel_url: `${window.location.origin}/onboarding`,
          },
        });
        if (error || !data?.url) {
          toast.error('Payment setup failed. You can upgrade later from settings.');
          updateProfile({ onboardingComplete: true, isProfileComplete: true, username, avatar: avatarUrl || user.avatar, displayName: displayName.trim(), bio, location });
          navigate('/', { replace: true });
          return;
        }
        window.location.href = data.url;
      }
    } catch (err: any) {
      clearTimeout(completeTimeout);
      toast.error(err?.message || 'Something went wrong. Please try again.');
    } finally {
      clearTimeout(completeTimeout);
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress bar */}
      <div className="w-full h-1 bg-border/30">
        <div className="h-full transition-all duration-300" style={{ width: `${progressPercent}%`, backgroundColor: '#d30d37' }} />
      </div>

      <div className="flex-1 flex flex-col items-center px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-sm">

          {/* ═══ Step 0: Profile Setup ═══ */}
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Set up your profile</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell the community about yourself</p>
              </div>

              <label className="relative cursor-pointer group mx-auto">
                <div className="w-24 h-24 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>
              {avatarPreview && (
                <button onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                  className="text-xs text-muted-foreground mx-auto flex items-center gap-1">
                  <X className="w-3 h-3" /> Remove
                </button>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Display Name *</Label>
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" maxLength={40} autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Bio <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input value={bio} onChange={e => setBio(e.target.value.slice(0, 150))} placeholder="Something about you" maxLength={150} />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Location <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City or region" />
              </div>

              <Button onClick={handleNext} disabled={!displayName.trim()} className="w-full h-11 rounded-xl">
                Continue
              </Button>
            </div>
          )}

          {/* ═══ Step 1: Choose Username ═══ */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Choose a username</h2>
                <p className="text-sm text-muted-foreground mt-1">This is how others will find you</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input value={username} onChange={handleUsernameChange} placeholder="yourname" className="pl-7" maxLength={20} autoFocus />
                  {username.length >= 3 && !usernameError && !checkingUsername && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                  )}
                  {usernameError && username.length >= 3 && (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                  )}
                </div>
                {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                {checkingUsername && <p className="text-xs text-muted-foreground">Checking availability…</p>}
                {username.length >= 3 && !usernameError && !checkingUsername && (
                  <p className="text-xs text-green-600">Available</p>
                )}
                <p className="text-xs text-muted-foreground">3–20 characters: letters, numbers, underscores only</p>
              </div>

              <Button onClick={handleNext} disabled={username.length < 3 || usernameError === 'Username already taken'} className="w-full h-11 rounded-xl">
                {checkingUsername ? 'Checking...' : 'Continue'}
              </Button>
            </div>
          )}

          {/* ═══ Step 2: My Garage ═══ */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">My Garage</h2>
                <p className="text-sm text-muted-foreground mt-1">Add your vehicles — you can always do this later</p>
              </div>

              {/* Added vehicles */}
              {vehicles.map((v, i) => (
                <div key={i} className="bg-card rounded-xl p-3 border border-border/50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{v.makeName} {v.model}</p>
                    <p className="text-xs text-muted-foreground">{v.variant} {v.year ? `· ${v.year}` : ''} {v.colour ? `· ${v.colour}` : ''}</p>
                  </div>
                  <button onClick={() => removeVehicle(i)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Vehicle form */}
              {showVehicleForm ? (
                <div className="bg-card rounded-xl p-4 border border-border/50 space-y-3">
                  {/* Vehicle Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Vehicle Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {VEHICLE_TYPES.map(t => (
                        <button key={t.id} onClick={() => { setVehType(t.id); setVehMakeId(''); setVehMakeName(''); setVehModel(''); setVehVariant(''); setVehYear(null); setMakeSearch(''); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${vehType === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border/50'}`}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Make */}
                  {vehType && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Make</Label>
                      <Input value={makeSearch} onChange={e => { setMakeSearch(e.target.value); setVehMakeId(''); setVehMakeName(''); setVehModel(''); setVehVariant(''); setVehYear(null); }}
                        placeholder="Search makes..." className="text-sm" />
                      {makeSearch && !vehMakeId && (
                        <div className="max-h-32 overflow-y-auto bg-background rounded-lg border border-border/50">
                          {filteredMakes.slice(0, 15).map(m => (
                            <button key={m.id} onClick={() => { setVehMakeId(m.id); setVehMakeName(m.name); setMakeSearch(m.name); setVehModel(''); setVehVariant(''); setVehYear(null); }}
                              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors">
                              {m.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Model */}
                  {vehMakeId && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Model</Label>
                      <select value={vehModel} onChange={e => { setVehModel(e.target.value); setVehVariant(''); setVehYear(null); }}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Select model</option>
                        {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Variant */}
                  {vehModel && variants.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Variant</Label>
                      <select value={vehVariant} onChange={e => setVehVariant(e.target.value)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Select variant</option>
                        {variants.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Year */}
                  {vehModel && years.length > 0 && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Year</Label>
                      <select value={vehYear ?? ''} onChange={e => setVehYear(e.target.value ? Number(e.target.value) : null)}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="">Select year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Colour */}
                  {vehModel && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Colour</Label>
                      <Input value={vehColour} onChange={e => setVehColour(e.target.value)} placeholder="e.g. Midnight Blue" className="text-sm" />
                    </div>
                  )}

                  {/* Number plate */}
                  {vehModel && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Number Plate <span className="text-muted-foreground font-normal">(optional)</span></Label>
                      <Input value={vehPlate} onChange={e => setVehPlate(e.target.value.toUpperCase())} placeholder="AB12 CDE" className="text-sm" />
                    </div>
                  )}

                  {/* Visibility */}
                  {vehModel && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Visibility</Label>
                      <div className="flex gap-2">
                        {(['public', 'friends', 'private'] as const).map(vis => (
                          <button key={vis} onClick={() => setVehVisibility(vis)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${vehVisibility === vis ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border/50'}`}>
                            {vis === 'friends' ? 'Friends Only' : vis === 'private' ? 'Private' : 'Public'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button onClick={addVehicle} disabled={!vehMakeName || !vehModel} className="flex-1 h-9 text-sm rounded-xl">Add Vehicle</Button>
                    <Button onClick={resetVehicleForm} variant="ghost" className="h-9 text-sm rounded-xl">Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowVehicleForm(true)} variant="outline" className="w-full h-11 rounded-xl gap-2">
                  <Plus className="w-4 h-4" /> Add Vehicle
                </Button>
              )}

              <div className="flex flex-col gap-3 mt-2">
                <Button onClick={handleNext} className="w-full h-11 rounded-xl">
                  {vehicles.length > 0 ? 'Continue' : 'Continue'}
                </Button>
                {vehicles.length === 0 && (
                  <Button onClick={handleSkip} variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground">
                    Skip for now
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ═══ Step 3: Notifications ═══ */}
          {step === 3 && (
            <div className="flex flex-col gap-6 items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fce8ed' }}>
                <Bell className="w-10 h-10" style={{ color: '#d30d37' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Stay in the loop</h2>
                <p className="text-sm text-muted-foreground mt-2">Get notified about events near you, friend requests, messages, and club activity.</p>
              </div>
              <div className="w-full flex flex-col gap-3">
                <Button onClick={handleNotificationPermission} className="w-full h-11 rounded-xl">
                  Enable Notifications
                </Button>
                <Button onClick={handleSkip} variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground">
                  Skip
                </Button>
              </div>
            </div>
          )}

          {/* ═══ Step 4: Location ═══ */}
          {step === 4 && (
            <div className="flex flex-col gap-6 items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fce8ed' }}>
                <MapPin className="w-10 h-10" style={{ color: '#d30d37' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Find events near you</h2>
                <p className="text-sm text-muted-foreground mt-2">Allow location access to discover meets, routes, and services nearby.</p>
              </div>
              <div className="w-full flex flex-col gap-3">
                <Button onClick={handleLocationPermission} className="w-full h-11 rounded-xl">
                  Enable Location
                </Button>
                <Button onClick={handleSkip} variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground">
                  Skip
                </Button>
              </div>
            </div>
          )}

          {/* ═══ Step 5: Choose Plan ═══ */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Choose your plan</h2>
                <p className="text-sm text-muted-foreground mt-1">You can change this anytime</p>
              </div>

              {/* Explorer (Free) */}
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <h3 className="text-base font-semibold">Explorer</h3>
                <p className="text-2xl font-bold mt-1">Free</p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Browse all events, routes & services</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> 1 free event post</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Join clubs and forums</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Basic messaging</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Save content</li>
                </ul>
                <Button onClick={() => handlePlanSelect('free')} variant="outline" disabled={isSubmitting}
                  className="w-full h-10 rounded-xl mt-4 text-sm font-semibold">
                  {isSubmitting && selectedPlan === 'free' ? 'Setting up…' : 'Continue Free'}
                </Button>
              </div>

              {/* Pro Driver */}
              <div className="bg-card rounded-2xl p-4 border-2" style={{ borderColor: '#d30d37' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Pro Driver</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#d30d37' }}>MOST POPULAR</span>
                </div>
                <p className="text-2xl font-bold mt-1">£{PLAN_PRICES.pro.monthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Everything in Explorer</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Unlimited event posts</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Create & share routes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Live location sharing</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> SOS breakdown help</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Garage showcase</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Priority visibility</li>
                </ul>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handlePlanSelect('pro', 'monthly')} disabled={isSubmitting}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold" style={{ backgroundColor: '#d30d37' }}>
                    {isSubmitting && selectedPlan === 'pro' && billingCycle === 'monthly' ? 'Setting up…' : 'Monthly'}
                  </Button>
                  <Button onClick={() => handlePlanSelect('pro', 'yearly')} disabled={isSubmitting}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold" style={{ backgroundColor: '#d30d37' }}>
                    {isSubmitting && selectedPlan === 'pro' && billingCycle === 'yearly' ? 'Setting up…' : `Yearly · Save 8%`}
                  </Button>
                </div>
              </div>

              {/* Club Business */}
              <div className="bg-card rounded-2xl p-4 border border-border/50">
                <h3 className="text-base font-semibold">Club & Business</h3>
                <p className="text-2xl font-bold mt-1">£{PLAN_PRICES.club.monthly}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Everything in Pro</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Create & manage clubs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Event ticketing</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Service listings</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Analytics</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0" /> Verified badge</li>
                </ul>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => handlePlanSelect('club', 'monthly')} disabled={isSubmitting}
                    variant="outline" className="flex-1 h-10 rounded-xl text-sm font-semibold">
                    {isSubmitting && selectedPlan === 'club' && billingCycle === 'monthly' ? 'Setting up…' : 'Monthly'}
                  </Button>
                  <Button onClick={() => handlePlanSelect('club', 'yearly')} disabled={isSubmitting}
                    variant="outline" className="flex-1 h-10 rounded-xl text-sm font-semibold">
                    {isSubmitting && selectedPlan === 'club' && billingCycle === 'yearly' ? 'Setting up…' : `Yearly · Save 11%`}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
