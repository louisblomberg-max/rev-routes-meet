import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Pencil, Car, Plus } from 'lucide-react';
import BackButton from '@/components/BackButton';

interface Vehicle {
  id: string;
  make: string;
  model: string | null;
  year: string | null;
  colour: string | null;
  photos: string[];
  is_primary: boolean;
  vehicle_type: string;
}

const You = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Edit form
  const [editOpen, setEditOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Load vehicles
  useEffect(() => {
    if (!user?.id) return;

    const loadVehicles = async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('id, make, model, year, colour, photos, is_primary, vehicle_type')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });
      setVehicles((data as Vehicle[]) || []);
      setLoadingVehicles(false);
    };

    loadVehicles();

    // Realtime subscription for vehicle changes
    const channel = supabase
      .channel('my-vehicles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadVehicles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const openEdit = () => {
    setEditDisplayName(user?.displayName || '');
    setEditUsername(user?.username || '');
    setEditBio(user?.bio || '');
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editDisplayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        displayName: editDisplayName.trim(),
        username: editUsername.trim().toLowerCase(),
        bio: editBio.trim(),
      });
      toast.success('Profile updated');
      setEditOpen(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.displayName || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#f3f3e8' }}>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <BackButton />
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
        <div className="w-8" />
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center px-6 py-6 gap-3">
        <Avatar className="w-20 h-20 border-2 border-border">
          <AvatarImage src={user?.avatar || undefined} alt={user?.displayName || 'Avatar'} />
          <AvatarFallback className="text-lg font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{user?.displayName || 'User'}</h2>
          {user?.username && (
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          )}
          {user?.bio && (
            <p className="text-sm text-foreground/80 mt-1 max-w-xs">{user.bio}</p>
          )}
        </div>

        <Button onClick={openEdit} variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Pencil className="w-3.5 h-3.5" />
          Edit Profile
        </Button>
      </div>

      {/* Garage section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">My Garage</h3>
          <Button onClick={() => navigate('/add/vehicle')} variant="ghost" size="sm" className="gap-1 text-primary">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {loadingVehicles ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-card rounded-xl h-28 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
            <Car className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No vehicles yet</p>
            <Button onClick={() => navigate('/add/vehicle')} variant="outline" size="sm" className="mt-3 rounded-xl">
              Add your first vehicle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {vehicles.map(v => (
              <div key={v.id} className="bg-card rounded-xl p-4 border border-border/50 relative">
                {v.is_primary && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    Primary
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Car className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{v.make} {v.model || ''}</p>
                <p className="text-xs text-muted-foreground">{[v.year, v.colour].filter(Boolean).join(' · ')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Display Name</Label>
              <Input value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Username</Label>
              <Input value={editUsername} onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="username" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Bio</Label>
              <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell us about yourself" rows={3} />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-11 rounded-xl">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default You;
