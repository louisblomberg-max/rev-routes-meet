import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, User, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import LocationPicker from '@/components/LocationPicker';

const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card rounded-2xl border border-border/50 shadow-sm p-5 ${className}`}>{children}</div>
);

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

  const autoHandle = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.displayName.trim()) errs.displayName = 'Name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username)) errs.username = '3-20 chars, lowercase letters, numbers, underscores';
    if (!form.location.trim()) errs.location = 'Location is required';
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

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Progress */}
      <div className="px-6 pt-8 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-caption mt-1.5">Step 1 of 5 — Profile</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-4 space-y-5 overflow-y-auto pb-28">
        <div>
          <h1 className="heading-lg text-foreground mb-1">Set up your profile</h1>
          <p className="text-sm text-muted-foreground">Let the community know who you are</p>
        </div>

        {/* Avatar */}
        <SectionCard>
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-muted">
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {form.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <button type="button" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg" onClick={() => toast.info('Photo upload coming soon')}>
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">Add a profile photo (optional)</p>
        </SectionCard>

        {/* Info */}
        <SectionCard>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Your name"
                  className="pl-10 rounded-xl h-11"
                  value={form.displayName}
                  onChange={e => {
                    update('displayName', e.target.value);
                    if (!form.username || form.username === autoHandle(form.displayName)) {
                      update('username', autoHandle(e.target.value));
                    }
                  }}
                />
              </div>
              {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Username / Handle *</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="yourhandle"
                  className="pl-10 rounded-xl h-11"
                  value={form.username}
                  onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                />
              </div>
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bio (optional)</Label>
              <Textarea placeholder="E46 M3 owner. Weekend warrior..." rows={2} className="rounded-xl" value={form.bio} onChange={e => update('bio', e.target.value)} />
            </div>
          </div>
        </SectionCard>

        {/* Location */}
        <SectionCard>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-base font-bold text-foreground">Location *</h2>
          </div>
          <LocationPicker
            value={form.location}
            onChange={(loc, coords) => { update('location', loc); update('locationCoords', coords); }}
            error={errors.location}
          />
        </SectionCard>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl border-t border-border/30 px-6 py-4 safe-bottom">
        <Button onClick={handleContinue} className="w-full h-12 text-base font-semibold">
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingProfile;
