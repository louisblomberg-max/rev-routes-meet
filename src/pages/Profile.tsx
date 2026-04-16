import { MessageCircle, Route, Calendar, Users, Share2, MapPin, Crown, Sparkles, Star, Pencil, Camera, Building2, AlertCircle, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { useState, useEffect, useRef } from 'react';
import GarageSection from '@/components/profile/GarageSection';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { validateImageFile } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, updateProfile } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [clubMemberships, setClubMemberships] = useState<any[]>([]);
  const [stats, setStats] = useState({ eventsCount: 0, routesCount: 0, clubsCount: 0 });

  const fetchData = async () => {
    if (!authUser?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [profileRes, vehiclesRes, clubsRes, eventsRes, routesRes, clubCountRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).single(),
        supabase.from('vehicles').select('*').eq('user_id', authUser.id),
        supabase.from('club_memberships').select('*, clubs(*)').eq('user_id', authUser.id),
        supabase.from('event_attendees').select('event_id', { count: 'exact', head: true }).eq('user_id', authUser.id),
        supabase.from('routes').select('id', { count: 'exact', head: true }).eq('created_by', authUser.id),
        supabase.from('club_memberships').select('club_id', { count: 'exact', head: true }).eq('user_id', authUser.id),
      ]);

      if (profileRes.error) throw profileRes.error;
      setProfile(profileRes.data);
      setVehicles(vehiclesRes.data || []);
      setClubMemberships(clubsRes.data || []);
      setStats({
        eventsCount: eventsRes.count || 0,
        routesCount: routesRes.count || 0,
        clubsCount: clubCountRes.count || 0,
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [authUser?.id]);

  // Realtime vehicle subscription - auto-updates when vehicles change
  useEffect(() => {
    if (!authUser?.id) return;
    const channel = supabase
      .channel(`profile-vehicles-${authUser.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'vehicles',
        filter: `user_id=eq.${authUser.id}`
      }, async () => {
        const { data, error } = await supabase.from('vehicles').select('*').eq('user_id', authUser.id);
        if (error) { toast.error('Failed to refresh vehicles'); return; }
        setVehicles(data || []);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authUser?.id]);

  const displayName = profile?.display_name || authUser?.displayName || 'New User';
  const username = profile?.username || authUser?.username || 'user';
  const avatar = profile?.avatar_url || authUser?.avatar || null;
  const location = profile?.location || '';
  const bio = profile?.bio || '';
  const plan = profile?.plan || 'free';

  const [editForm, setEditForm] = useState({ displayName: '', username: '', bio: '', location: '' });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const usernameCheckTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (profile) {
      setEditForm({
        displayName: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        location: profile.location || '',
      });
      setUsernameAvailable(null);
      setUsernameError(null);
    }
  }, [profile]);

  // Debounced username validation + availability check
  useEffect(() => {
    const val = editForm.username;
    clearTimeout(usernameCheckTimer.current);

    // Same as current profile — no check needed
    if (val === (profile?.username || '')) {
      setUsernameAvailable(null);
      setUsernameError(null);
      setUsernameChecking(false);
      return;
    }

    if (!val || val.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(val.length > 0 ? 'Minimum 3 characters' : null);
      setUsernameChecking(false);
      return;
    }
    if (val.length > 20) {
      setUsernameError('Maximum 20 characters');
      setUsernameAvailable(null);
      setUsernameChecking(false);
      return;
    }
    if (!/^[a-z0-9_]+$/.test(val)) {
      setUsernameError('Only lowercase letters, numbers and underscores');
      setUsernameAvailable(null);
      setUsernameChecking(false);
      return;
    }
    if (val.startsWith('_') || val.endsWith('_')) {
      setUsernameError('Cannot start or end with underscore');
      setUsernameAvailable(null);
      setUsernameChecking(false);
      return;
    }

    setUsernameError(null);
    setUsernameChecking(true);
    usernameCheckTimer.current = setTimeout(async () => {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', val)
        .neq('id', authUser?.id || '')
        .maybeSingle();
      setUsernameAvailable(!existing);
      setUsernameChecking(false);
    }, 500);

    return () => clearTimeout(usernameCheckTimer.current);
  }, [editForm.username, profile?.username, authUser?.id]);

  const planBadge = {
    free: { label: 'Explorer', icon: Sparkles, className: 'bg-muted text-muted-foreground' },
    enthusiast: { label: 'Enthusiast', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground' },
    business: { label: 'Business', icon: Building2, className: 'bg-gradient-to-r from-services to-primary text-primary-foreground' },
  };
  const currentBadge = planBadge[plan as keyof typeof planBadge] || planBadge.free;
  const BadgeIcon = currentBadge.icon;

  const handleShare = async () => {
    const url = `${window.location.origin}/user/${username}`;
    if (navigator.share) {
      try { await navigator.share({ title: displayName, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Profile link copied!');
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser?.id) return;
    const uname = editForm.username.trim();
    if (!uname || uname.length < 3) { toast.error('Username must be at least 3 characters'); return; }
    if (!/^[a-z0-9_]+$/.test(uname)) { toast.error('Username can only contain lowercase letters, numbers and underscores'); return; }
    if (uname.startsWith('_') || uname.endsWith('_')) { toast.error('Username cannot start or end with underscore'); return; }

    // Server-side uniqueness check as safety net
    if (uname !== profile?.username) {
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', uname)
        .neq('id', authUser.id)
        .maybeSingle();

      if (checkError) { toast.error('Failed to check username availability'); return; }
      if (existing) { toast.error('This username is already taken'); return; }
    }

    const { error } = await supabase.from('profiles').update({
      display_name: editForm.displayName,
      username: editForm.username.toLowerCase(),
      bio: editForm.bio,
      location: editForm.location,
    }).eq('id', authUser.id);
    if (error) { toast.error('Failed to save'); return; }
    updateProfile({ displayName: editForm.displayName, username: editForm.username.toLowerCase(), bio: editForm.bio, location: editForm.location });
    setProfile((p: any) => ({ ...p, display_name: editForm.displayName, username: editForm.username.toLowerCase(), bio: editForm.bio, location: editForm.location }));
    toast.success('Profile updated!');
    setIsEditOpen(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !authUser?.id) return;
    const validationError = validateImageFile(file); if (validationError) { toast.error(validationError); return; }
    const path = `${authUser.id}/avatar.jpg`;
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadErr) { toast.error('Upload failed'); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = urlData.publicUrl + '?t=' + Date.now();
    const { error: updateErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', authUser.id);
    if (updateErr) { toast.error('Failed to update avatar'); return; }
    updateProfile({ avatar: publicUrl });
    setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
    toast.success('Avatar updated!');
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen md:max-w-2xl md:mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
          <div className="px-4 py-3 flex items-center gap-3"><BackButton className="w-9 h-9 rounded-full bg-muted/80" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} /><h1 className="text-lg font-semibold text-foreground">Profile</h1></div>
        </div>
        <div className="px-4 py-5 space-y-5">
          <div className="bg-card rounded-2xl border border-border/30 p-5">
            <Skeleton className="h-20 w-20 rounded-full mb-3" />
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
            <div className="mt-4 grid grid-cols-3 gap-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-container bg-background min-h-screen md:max-w-2xl md:mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
          <div className="px-4 py-3 flex items-center gap-3"><BackButton className="w-9 h-9 rounded-full bg-muted/80" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} /><h1 className="text-lg font-semibold text-foreground">Profile</h1></div>
        </div>
        <div className="px-4 pt-8">
          <div className="bg-card rounded-xl border border-border/30 p-6 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background min-h-screen">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3"><BackButton className="w-9 h-9 rounded-full bg-muted/80" iconClassName="w-5 h-5" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} /><h1 className="text-lg font-semibold text-foreground">Profile</h1></div>
          <button onClick={handleShare} className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"><Share2 className="w-4 h-4 text-foreground" /></button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-8">
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 ring-4 ring-card border-2 border-primary/20">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-2xl font-bold">{displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 pb-1 flex items-center justify-between">
                <Badge className={`${currentBadge.className} gap-1 px-2 py-0.5 text-xs`}><BadgeIcon className="w-3 h-3" />{currentBadge.label}</Badge>
                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="h-8 px-3 text-xs"><Pencil className="w-3 h-3 mr-1.5" />Edit</Button>
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">@{username}</p>
              {location && <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{location}</div>}
            </div>
            {bio && <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{bio}</p>}

            <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-2">
              <button onClick={() => navigate('/my-events')} className="bg-muted/30 rounded-xl p-3 text-center hover:bg-muted/50 transition-colors active:scale-[0.98]">
                <div className="flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /><span className="text-lg font-bold text-foreground">{stats.eventsCount}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">Events</p>
              </button>
              <button onClick={() => navigate('/my-routes')} className="bg-muted/30 rounded-xl p-3 text-center hover:bg-muted/50 transition-colors active:scale-[0.98]">
                <div className="flex items-center justify-center gap-1.5"><Route className="w-4 h-4 text-routes" /><span className="text-lg font-bold text-foreground">{stats.routesCount}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">Routes</p>
              </button>
              <button onClick={() => navigate('/my-clubs')} className="bg-muted/30 rounded-xl p-3 text-center hover:bg-muted/50 transition-colors active:scale-[0.98]">
                <div className="flex items-center justify-center gap-1.5"><Users className="w-4 h-4 text-clubs" /><span className="text-lg font-bold text-foreground">{stats.clubsCount}</span></div>
                <p className="text-xs text-muted-foreground mt-0.5">Clubs</p>
              </button>
            </div>
          </div>
        </div>

        {vehicles.length > 0 && <GarageSection vehicles={vehicles as any} isOwnProfile={true} />}

        {clubMemberships.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clubs ({clubMemberships.length})</h2>
              <button onClick={() => navigate('/my-clubs')} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {clubMemberships.map((m: any) => (
                <button key={m.club_id} onClick={() => navigate(`/club/${m.club_id}`)}
                  className="flex-shrink-0 bg-card rounded-xl border border-border/30 shadow-sm p-3 hover:shadow-md hover:border-border/50 transition-all active:scale-[0.98] min-w-[140px]">
                  <div className="w-10 h-10 rounded-lg bg-clubs/10 flex items-center justify-center mb-2"><Users className="w-5 h-5 text-clubs" /></div>
                  <p className="text-sm font-medium text-foreground truncate">{m.clubs?.name || 'Club'}</p>
                  <Badge variant={m.role === 'owner' || m.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] mt-1.5 px-1.5 py-0">{m.role === 'owner' || m.role === 'admin' ? 'Admin' : 'Member'}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="text-left pb-4"><SheetTitle>Edit Profile</SheetTitle><SheetDescription>Update your profile information</SheetDescription></SheetHeader>
          <div className="space-y-5 overflow-y-auto pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-muted">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-3xl font-bold">{editForm.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors active:scale-95"><Camera className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="displayName">Display Name</Label><Input id="displayName" value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} className="h-11" /></div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    maxLength={20}
                    className="h-11 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameChecking && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                    {!usernameChecking && usernameAvailable === true && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {!usernameChecking && usernameAvailable === false && <XCircle className="w-4 h-4 text-destructive" />}
                  </div>
                </div>
                {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                {!usernameChecking && !usernameError && usernameAvailable === false && <p className="text-xs text-destructive">Username already taken</p>}
                {!usernameChecking && !usernameError && usernameAvailable === true && <p className="text-xs text-green-600">Username available</p>}
              </div>
              <div className="space-y-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={3} /></div>
              <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="h-11" /></div>
              <Button className="w-full" onClick={handleSaveProfile} disabled={usernameChecking || usernameAvailable === false || !!usernameError}>Save Changes</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Profile;
