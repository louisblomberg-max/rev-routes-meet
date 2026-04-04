import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    username: '',
    bio: '',
    location: '',
    vehicleMake: '',
    vehicleModel: '',
    availableToHelp: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim()) {
      toast.error('Please choose a username');
      return;
    }
    updateProfile({ isProfileComplete: true });
    toast.success('Profile complete! Welcome to RevNet.');
    navigate('/');
  };

  const update = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="px-6 py-8 safe-top">
        <h1 className="text-2xl font-bold text-foreground mb-1">Complete your profile</h1>
        <p className="text-sm text-muted-foreground mb-8">Tell the community about you and your ride</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-muted">
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                  {user?.displayName?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <button type="button" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg" onClick={() => toast.info('Photo upload available during onboarding. Go to Settings > Account to change your photo.')}>
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" placeholder="@yourhandle" value={form.username} onChange={e => update('username', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" placeholder="E46 M3 owner. Weekend warrior..." rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="location" placeholder="London, UK" className="pl-10" value={form.location} onChange={e => update('location', e.target.value)} />
            </div>
          </div>

          {/* Vehicle */}
          <div className="space-y-3">
            <Label>Your Vehicle (optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Make" className="pl-10" value={form.vehicleMake} onChange={e => update('vehicleMake', e.target.value)} />
              </div>
              <Input placeholder="Model" value={form.vehicleModel} onChange={e => update('vehicleModel', e.target.value)} />
            </div>
          </div>

          {/* Available to help */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <p className="text-sm font-medium text-foreground">Available to help</p>
              <p className="text-xs text-muted-foreground">Get notified when others need roadside help</p>
            </div>
            <Switch checked={form.availableToHelp} onCheckedChange={v => update('availableToHelp', v)} />
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold">
            Let's Go!
          </Button>

          <button type="button" onClick={() => { updateProfile({ isProfileComplete: true }); navigate('/'); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
