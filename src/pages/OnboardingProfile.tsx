import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';
import LocationPicker from '@/components/LocationPicker';

const OnboardingProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, setOnboardingStep } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    username: '',
    location: '',
    locationCoords: undefined as { lat: number; lng: number } | undefined,
    bio: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string | { lat: number; lng: number } | undefined) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const autoHandle = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim()) errs.displayName = 'Name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username)) errs.username = '3-20 chars, lowercase letters, numbers, underscores';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    updateProfile({
      displayName: form.displayName,
      username: form.username,
      location: form.location,
      locationCoords: form.locationCoords,
      bio: form.bio,
    } as any);
    setOnboardingStep(1);
    navigate('/onboarding/vehicle');
  };

  // Step 1 of 6 now (added referral step)
  return (
    <div className="mobile-container min-h-screen flex flex-col" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Header */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-2">
          <BackButton fallbackPath="/auth" />
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        <h1 className="text-2xl font-bold text-center mb-1 text-black">Add a profile picture and bio</h1>
        <p className="text-sm text-center mb-8 text-black/60">to show yourself off!</p>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar className="w-28 h-28 ring-4 ring-black/10">
              <AvatarFallback className="bg-white text-black text-3xl">
                <Camera className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
              onClick={() => toast.info('Photo upload coming soon')}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio */}
        <Textarea
          placeholder="Add a bio..."
          rows={2}
          className="rounded-2xl bg-white text-black border-0 text-sm mb-4 resize-none placeholder:text-black/40"
          value={form.bio}
          onChange={e => update('bio', e.target.value)}
        />

        {/* Name & Username */}
        <div className="space-y-3">
          <div>
            <Input
              placeholder="Display Name *"
              className="rounded-2xl h-12 bg-white text-black border-0 text-sm placeholder:text-black/40"
              value={form.displayName}
              onChange={e => {
                update('displayName', e.target.value);
                if (!form.username || form.username === autoHandle(form.displayName)) {
                  update('username', autoHandle(e.target.value));
                }
              }}
            />
            {errors.displayName && <p className="text-xs text-destructive pl-1 mt-1">{errors.displayName}</p>}
          </div>

          <div>
            <div className="relative">
              <Input
                placeholder="Username *"
                className="rounded-2xl h-12 bg-white text-black border-0 text-sm placeholder:text-black/40"
                value={form.username}
                onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={16}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-black/40">
                {form.username.length}/16
              </span>
            </div>
            {errors.username && <p className="text-xs text-destructive pl-1 mt-1">{errors.username}</p>}
          </div>

          {/* Location */}
          <LocationPicker
            value={form.location}
            onChange={(loc, coords) => { update('location', loc); update('locationCoords', coords); }}
            error={errors.location}
          />
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 safe-bottom z-20" style={{ backgroundColor: '#f3f3e8' }}>
        <Button onClick={handleContinue} className="w-full h-14 text-base font-semibold rounded-full gap-2 bg-black text-white hover:bg-black/90">
          Next <ChevronRight className="w-5 h-5" />
        </Button>
        <button
          onClick={() => {
            setOnboardingStep(1);
            navigate('/onboarding/vehicle');
          }}
          className="w-full text-sm text-black/50 mt-2 py-1"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default OnboardingProfile;
