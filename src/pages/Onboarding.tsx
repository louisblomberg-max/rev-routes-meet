import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, Check, X } from 'lucide-react';

const TOTAL_STEPS = 4;

const VEHICLE_INTERESTS = ['Cars', 'Motorcycles', 'Classics', 'Electric', 'Off Road', 'Track'];
const MEET_STYLES = ['JDM', 'Supercars', 'Muscle Car', 'American', 'European', 'Classics', 'Modified', 'Show and Shine', 'Track Focus', '4x4'];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Username
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Step 2: Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Step 3: Vehicle interests
  const [vehicleInterests, setVehicleInterests] = useState<string[]>([]);

  // Step 4: Meet styles
  const [meetStyles, setMeetStyles] = useState<string[]>([]);

  useEffect(() => {
    if (user?.onboardingComplete) {
      navigate('/', { replace: true });
    }
  }, [user?.onboardingComplete, navigate]);

  // Username validation
  const validateUsername = useCallback(async (value: string) => {
    const trimmed = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (trimmed !== value) {
      setUsername(trimmed);
    }
    if (trimmed.length < 3) {
      setUsernameError('Must be at least 3 characters');
      return false;
    }
    if (trimmed.length > 20) {
      setUsernameError('Must be 20 characters or less');
      return false;
    }

    setCheckingUsername(true);
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmed)
      .neq('id', user?.id || '')
      .maybeSingle();
    setCheckingUsername(false);

    if (data) {
      setUsernameError('Username already taken');
      return false;
    }
    setUsernameError('');
    return true;
  }, [user?.id]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    setUsernameError('');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return null;
    setUploadingAvatar(true);
    const ext = avatarFile.name.split('.').pop() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
    setUploadingAvatar(false);

    if (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload photo');
      return null;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const toggleArrayItem = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const handleNext = async () => {
    if (step === 0) {
      const valid = await validateUsername(username);
      if (!valid) return;
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      await handleComplete();
    }
  };

  const handleSkip = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);

    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const url = await uploadAvatar();
        if (url) avatarUrl = url;
      }

      const updates: any = {
        username,
        onboardingComplete: true,
        isProfileComplete: true,
      };
      if (avatarUrl) updates.avatar = avatarUrl;

      await updateProfile(updates);

      navigate('/', { replace: true });
      toast.success('Welcome to RevNet!');
    } catch (err) {
      console.error('Onboarding complete error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Progress bar */}
      <div className="w-full h-1 bg-border/30">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">

          {/* Step 0: Username */}
          {step === 0 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Choose a username</h2>
                <p className="text-sm text-muted-foreground mt-1">This is how other members will find you</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="yourname"
                    className="pl-7"
                    maxLength={20}
                    autoFocus
                  />
                  {username.length >= 3 && !usernameError && !checkingUsername && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  )}
                </div>
                {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                {checkingUsername && <p className="text-xs text-muted-foreground">Checking availability…</p>}
                <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and underscores only</p>
              </div>

              <Button
                onClick={handleNext}
                disabled={username.length < 3 || !!usernameError || checkingUsername}
                className="w-full h-11 rounded-xl"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 1: Profile photo */}
          {step === 1 && (
            <div className="flex flex-col gap-6 items-center">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Add a profile photo</h2>
                <p className="text-sm text-muted-foreground mt-1">Help others recognise you</p>
              </div>

              <label className="relative cursor-pointer group">
                <div className="w-28 h-28 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </label>

              {avatarPreview && (
                <button
                  onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              )}

              <div className="w-full flex flex-col gap-3">
                <Button
                  onClick={handleNext}
                  disabled={uploadingAvatar}
                  className="w-full h-11 rounded-xl"
                >
                  {avatarFile ? 'Continue' : 'Continue'}
                </Button>
                <Button onClick={handleSkip} variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground">
                  Skip for now
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle interests */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">What are you into?</h2>
                <p className="text-sm text-muted-foreground mt-1">Select your vehicle interests</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_INTERESTS.map(interest => {
                  const selected = vehicleInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => setVehicleInterests(toggleArrayItem(vehicleInterests, interest))}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border/50 hover:border-primary/30'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleNext} className="w-full h-11 rounded-xl">
                  Continue
                </Button>
                <Button onClick={handleSkip} variant="ghost" className="w-full h-11 rounded-xl text-muted-foreground">
                  Skip
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Meet style interests */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Meet style preferences</h2>
                <p className="text-sm text-muted-foreground mt-1">What kind of meets do you enjoy?</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {MEET_STYLES.map(style => {
                  const selected = meetStyles.includes(style);
                  return (
                    <button
                      key={style}
                      onClick={() => setMeetStyles(toggleArrayItem(meetStyles, style))}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        selected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border/50 hover:border-primary/30'
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleNext} disabled={isSubmitting} className="w-full h-11 rounded-xl">
                  {isSubmitting ? 'Finishing up…' : 'Complete Setup'}
                </Button>
                <Button onClick={handleSkip} variant="ghost" disabled={isSubmitting} className="w-full h-11 rounded-xl text-muted-foreground">
                  Skip & Finish
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
