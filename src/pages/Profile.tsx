import { MessageCircle, Route, Calendar, Users, Share2, MoreHorizontal, MapPin, Crown, Sparkles, Star, Pencil, Camera, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { useState } from 'react';
import GarageSection from '@/components/profile/GarageSection';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useGarage } from '@/contexts/GarageContext';
import { useUserStatsData } from '@/hooks/useProfileData';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, updateProfile } = useAuth();
  const { state } = useData();
  const { vehicles } = useGarage();
  const stats = useUserStatsData();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const displayName = authUser?.displayName || 'New User';
  const username = authUser?.username || 'user';
  const avatar = authUser?.avatar || null;
  const location = authUser?.location || '';
  const bio = authUser?.bio || '';
  const plan = authUser?.membershipPlan || 'free';

  const [editForm, setEditForm] = useState({
    displayName,
    username,
    bio,
    location,
  });

  const publicVehicles = vehicles.filter(v => v.visibility === 'public');
  const friends = state.friends.filter(f => f.status === 'accepted');
  const clubMemberships = state.clubMemberships;

  const planBadge = {
    free: { label: 'Free', icon: Sparkles, className: 'bg-muted text-muted-foreground' },
    pro: { label: 'Pro', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground' },
    club: { label: 'Club', icon: Building2, className: 'bg-gradient-to-r from-clubs to-primary text-primary-foreground' },
  };

  const currentBadge = planBadge[plan] || planBadge.free;
  const BadgeIcon = currentBadge.icon;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied!');
  };

  const handleSaveProfile = () => {
    updateProfile({
      displayName: editForm.displayName,
      username: editForm.username,
      bio: editForm.bio,
      location: editForm.location,
    });
    toast.success('Profile updated!');
    setIsEditOpen(false);
  };

  const handleAvatarChange = () => toast.info('Photo upload coming soon!');

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-full bg-muted/80" iconClassName="w-5 h-5" />
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95">
              <Share2 className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-8">
        {/* Profile Hero */}
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
          <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end gap-4">
              <Avatar className="w-20 h-20 ring-4 ring-card border-2 border-primary/20">
                <AvatarImage src={avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-2xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-1 flex items-center justify-between">
                <Badge className={`${currentBadge.className} gap-1 px-2 py-0.5 text-xs`}>
                  <BadgeIcon className="w-3 h-3" />{currentBadge.label}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="h-8 px-3 text-xs">
                  <Pencil className="w-3 h-3 mr-1.5" />Edit
                </Button>
              </div>
            </div>
            <div className="mt-3">
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground">@{username}</p>
              {location && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />{location}
                </div>
              )}
            </div>
            {bio && <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{bio}</p>}

            {/* Stats Row */}
            <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-2">
              <button onClick={() => navigate('/my-events')} className="bg-muted/30 rounded-xl p-3 text-center hover:bg-muted/50 transition-colors active:scale-[0.98]">
                <div className="flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{stats.eventsCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Events</p>
              </button>
              <button onClick={() => navigate('/my-routes')} className="bg-muted/30 rounded-xl p-3 text-center hover:bg-muted/50 transition-colors active:scale-[0.98]">
                <div className="flex items-center justify-center gap-1.5">
                  <Route className="w-4 h-4 text-routes" />
                  <span className="text-lg font-bold text-foreground">{stats.routesCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Routes</p>
              </button>
              <button onClick={() => navigate('/my-clubs')} className="bg-muted/30 rounded-xl p-3 text-center hover:bg-muted/50 transition-colors active:scale-[0.98]">
                <div className="flex items-center justify-center gap-1.5">
                  <Users className="w-4 h-4 text-clubs" />
                  <span className="text-lg font-bold text-foreground">{stats.clubsCount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Clubs</p>
              </button>
            </div>
          </div>
        </div>

        {/* Garage */}
        {publicVehicles.length > 0 && (
          <GarageSection vehicles={publicVehicles as any} isOwnProfile={true} />
        )}

        {/* Clubs */}
        {clubMemberships.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clubs ({clubMemberships.length})</h2>
              <button onClick={() => navigate('/my-clubs')} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {clubMemberships.map(m => (
                <button key={m.id} onClick={() => navigate(`/club/${m.clubId}`)}
                  className="flex-shrink-0 bg-card rounded-xl border border-border/30 shadow-sm p-3 hover:shadow-md hover:border-border/50 transition-all active:scale-[0.98] min-w-[140px]">
                  <div className="w-10 h-10 rounded-lg bg-clubs/10 flex items-center justify-center mb-2"><Users className="w-5 h-5 text-clubs" /></div>
                  <p className="text-sm font-medium text-foreground truncate">{m.clubName}</p>
                  <Badge variant={m.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] mt-1.5 px-1.5 py-0">{m.role === 'admin' ? 'Admin' : 'Member'}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Friends Preview */}
        {friends.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Friends ({friends.length})</h2>
              <button onClick={() => navigate('/my-friends')} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</button>
            </div>
            <div className="bg-card rounded-2xl border border-border/30 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {friends.slice(0, 5).map(f => (
                    <Avatar key={f.id} className="w-10 h-10 border-2 border-card ring-1 ring-border/20">
                      <AvatarFallback className="bg-muted text-muted-foreground text-sm">{f.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {friends.length > 5 && (
                    <button onClick={() => navigate('/my-friends')} className="w-10 h-10 rounded-full border-2 border-card ring-1 ring-border/20 bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium text-muted-foreground">+{friends.length - 5}</span>
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {friends.slice(0, 2).map(f => f.displayName.split(' ')[0]).join(', ')}
                    {friends.length > 2 && ` +${friends.length - 2} more`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="text-left pb-4">
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>Update your profile information</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 overflow-y-auto pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-24 h-24 ring-4 ring-muted">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-3xl font-bold">{editForm.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <button onClick={handleAvatarChange} className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors active:scale-95">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="h-11" />
              </div>
              <Button className="w-full" onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Profile;
