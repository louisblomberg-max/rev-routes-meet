import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, UserPlus, MapPin, Calendar, Route, Users, Crown, Star, AlertTriangle, RotateCcw, Car } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PLAN_LABELS: Record<string, string> = { free: 'Explorer', pro: 'Pro Driver', club: 'Club' };

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [stats, setStats] = useState({ events: 0, routes: 0, clubs: 0 });
  const [friendStatus, setFriendStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!username) return;
    setIsLoading(true); setError(null);

    const { data: profileData, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (pErr || !profileData) { setError('User not found'); setIsLoading(false); return; }
    setProfile(profileData);

    const userId = profileData.id;
    const [vehiclesRes, eventsRes, routesRes, clubsRes] = await Promise.all([
      supabase.from('vehicles_public' as any).select('*').eq('user_id', userId),
      supabase.from('event_attendees').select('event_id', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('routes').select('id', { count: 'exact', head: true }).eq('created_by', userId).eq('visibility', 'public'),
      supabase.from('club_memberships').select('club_id', { count: 'exact', head: true }).eq('user_id', userId),
    ]);

    setVehicles((vehiclesRes.data as any[]) || []);
    setStats({ events: eventsRes.count || 0, routes: routesRes.count || 0, clubs: clubsRes.count || 0 });

    // Check friend status
    if (authUser?.id && authUser.id !== userId) {
      const { data: friendRow } = await supabase
        .from('friends')
        .select('status')
        .or(`and(user_id.eq.${authUser.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${authUser.id})`)
        .maybeSingle();
      setFriendStatus(friendRow?.status || null);
    }

    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, [username, authUser?.id]);

  const handleAddFriend = async () => {
    if (!authUser?.id || !profile?.id) return;
    const { error: err } = await supabase.from('friends').insert({ user_id: authUser.id, friend_id: profile.id, status: 'pending' });
    if (err) { toast.error('Failed to send friend request'); return; }
    setFriendStatus('pending');
    toast.success('Friend request sent!');
  };

  const handleMessage = async () => {
    if (!authUser?.id || !profile?.id) return;
    // Check if a conversation already exists
    const { data: existing } = await supabase.rpc('get_pins_in_bounds', { north: 0, south: 0, east: 0, west: 0 }); // placeholder

    // Create new conversation
    const { data: conv, error: convErr } = await supabase.from('conversations').insert({ name: profile.display_name || profile.username, type: 'direct' }).select('id').single();
    if (convErr || !conv) { toast.error('Failed to create conversation'); return; }
    await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: authUser.id },
      { conversation_id: conv.id, user_id: profile.id },
    ]);
    navigate(`/messages/${conv.id}`);
  };

  if (isLoading) {
    return (
      <div className="mobile-container bg-background min-h-screen">
        <div className="px-4 pt-12 pb-4 safe-top"><BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" /></div>
        <div className="flex flex-col items-center px-6 py-8 space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-4">
        <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
        <p className="font-semibold text-foreground mb-1">{error || 'User not found'}</p>
        <Button variant="outline" onClick={fetchData} className="mt-3 gap-2"><RotateCcw className="w-4 h-4" /> Retry</Button>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username || 'User';
  const planLabel = PLAN_LABELS[profile.plan] || 'Explorer';

  return (
    <div className="mobile-container bg-background min-h-screen pb-8">
      <div className="px-4 pt-12 pb-2 safe-top">
        <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" />
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center px-6 py-6">
        <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold text-foreground mt-3">{displayName}</h1>
        <p className="text-sm text-muted-foreground">@{profile.username || 'user'}</p>
        <Badge variant="secondary" className="mt-2 gap-1">
          {profile.plan === 'pro' && <Star className="w-3 h-3" />}
          {profile.plan === 'club' && <Crown className="w-3 h-3" />}
          {planLabel}
        </Badge>
        {profile.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2"><MapPin className="w-3 h-3" />{profile.location}</p>
        )}
        {profile.bio && <p className="text-sm text-foreground/80 text-center mt-3 max-w-sm">{profile.bio}</p>}
      </div>

      {/* Actions */}
      {authUser?.id !== profile.id && (
        <div className="flex gap-2 px-6 mb-6">
          {friendStatus === 'accepted' ? (
            <Button variant="outline" className="flex-1" disabled>Friends</Button>
          ) : friendStatus === 'pending' ? (
            <Button variant="outline" className="flex-1" disabled>Request Sent</Button>
          ) : (
            <Button className="flex-1 gap-1.5" onClick={handleAddFriend}>
              <UserPlus className="w-4 h-4" /> Add Friend
            </Button>
          )}
          <Button variant="outline" className="flex-1 gap-1.5" onClick={handleMessage}>
            <MessageCircle className="w-4 h-4" /> Message
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-6 mb-6">
        <div className="bg-card rounded-xl p-3 border border-border/50 text-center">
          <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.events}</p>
          <p className="text-[10px] text-muted-foreground">Events</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50 text-center">
          <Route className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.routes}</p>
          <p className="text-[10px] text-muted-foreground">Routes</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50 text-center">
          <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.clubs}</p>
          <p className="text-[10px] text-muted-foreground">Clubs</p>
        </div>
      </div>

      {/* Vehicles */}
      {vehicles.length > 0 && (
        <div className="px-6">
          <h2 className="font-semibold text-foreground mb-3">Garage</h2>
          <div className="space-y-2">
            {vehicles.map((v: any) => (
              <div key={v.id} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3">
                {v.photos?.length > 0 ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <img src={v.photos[0]} alt={`${v.make} ${v.model}`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Car className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{v.year ? `${v.year} ` : ''}{v.make} {v.model}</p>
                  {v.colour && <p className="text-xs text-muted-foreground">{v.colour}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
