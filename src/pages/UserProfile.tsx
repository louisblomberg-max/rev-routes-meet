import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, UserPlus, UserMinus, MapPin, Calendar, Route, Users, Crown, Star, AlertTriangle, RotateCcw, Car, ShieldBan, ShieldCheck, Edit } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PLAN_LABELS: Record<string, string> = { free: 'Explorer', pro: 'Pro Driver', club: 'Organiser' };

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [stats, setStats] = useState({ events: 0, routes: 0, clubs: 0 });
  const [friendStatus, setFriendStatus] = useState<'accepted' | 'pending_sent' | 'pending_received' | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = authUser?.id === id;

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true); setError(null);

    const { data: profileData, error: pErr } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url, bio, location, plan, show_garage_on_profile')
      .eq('id', id)
      .single();

    if (pErr || !profileData) { setError('User not found'); setIsLoading(false); return; }
    setProfile(profileData);

    const [vehiclesRes, eventsRes, routesRes, clubsRes, publicRoutesRes] = await Promise.all([
      supabase.from('vehicles_public' as any).select('*').eq('user_id', id),
      supabase.from('event_attendees').select('event_id', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('routes').select('id', { count: 'exact', head: true }).eq('created_by', id).eq('visibility', 'public'),
      supabase.from('club_memberships').select('club_id', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('routes').select('id, name, type, difficulty, distance_meters, rating').eq('created_by', id).eq('visibility', 'public').order('created_at', { ascending: false }).limit(5),
    ]);

    if (vehiclesRes.error) toast.error('Failed to load vehicles');
    if (eventsRes.error) toast.error('Failed to load events');
    if (routesRes.error) toast.error('Failed to load routes');
    if (clubsRes.error) toast.error('Failed to load clubs');

    setVehicles((vehiclesRes.data as any[]) || []);
    setRoutes(publicRoutesRes.data || []);
    setStats({ events: eventsRes.count || 0, routes: routesRes.count || 0, clubs: clubsRes.count || 0 });

    // Friend and block status
    if (authUser?.id && !isOwnProfile) {
      const [sentRes, receivedRes, blockRes] = await Promise.all([
        supabase.from('friends').select('status').eq('user_id', authUser.id).eq('friend_id', id).maybeSingle(),
        supabase.from('friends').select('status').eq('user_id', id).eq('friend_id', authUser.id).maybeSingle(),
        supabase.from('blocked_users').select('id').eq('user_id', authUser.id).eq('blocked_user_id', id).maybeSingle(),
      ]);

      if (sentRes.data?.status === 'accepted' || receivedRes.data?.status === 'accepted') {
        setFriendStatus('accepted');
      } else if (sentRes.data?.status === 'pending') {
        setFriendStatus('pending_sent');
      } else if (receivedRes.data?.status === 'pending') {
        setFriendStatus('pending_received');
      } else {
        setFriendStatus(null);
      }
      setIsBlocked(!!blockRes.data);
    }

    setIsLoading(false);
  }, [id, authUser?.id, isOwnProfile]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddFriend = async () => {
    if (!authUser?.id || !id) return;
    const { error: err } = await supabase.from('friends').insert({ user_id: authUser.id, friend_id: id, status: 'pending' });
    if (err) { toast.error('Failed to send request'); return; }
    setFriendStatus('pending_sent');
    toast.success('Friend request sent!');
  };

  const handleAcceptRequest = async () => {
    if (!authUser?.id || !id) return;
    await supabase.from('friends').update({ status: 'accepted' }).eq('user_id', id).eq('friend_id', authUser.id);
    setFriendStatus('accepted');
    toast.success('Friend request accepted!');
  };

  const handleRemoveFriend = async () => {
    if (!authUser?.id || !id) return;
    if (!confirm('Remove this friend?')) return;
    await Promise.all([
      supabase.from('friends').delete().eq('user_id', authUser.id).eq('friend_id', id),
      supabase.from('friends').delete().eq('user_id', id).eq('friend_id', authUser.id),
    ]);
    setFriendStatus(null);
    toast.success('Friend removed');
  };

  const handleToggleBlock = async () => {
    if (!authUser?.id || !id) return;
    if (isBlocked) {
      await supabase.from('blocked_users').delete().eq('user_id', authUser.id).eq('blocked_user_id', id);
      setIsBlocked(false);
      toast.success('User unblocked');
    } else {
      if (!confirm('Block this user? They won\'t be able to message you.')) return;
      await supabase.from('blocked_users').insert({ user_id: authUser.id, blocked_user_id: id });
      setIsBlocked(true);
      toast.success('User blocked');
    }
  };

  const handleMessage = async () => {
    if (!authUser?.id || !profile?.id) return;
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert({ name: profile.display_name || profile.username, type: 'direct' })
      .select('id')
      .single();
    if (convErr || !conv) { toast.error('Failed to create conversation'); return; }
    await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: authUser.id });
    const { data: fnData, error: fnError } = await supabase.functions.invoke('add-conversation-participant', {
      body: { conversation_id: conv.id, participant_user_id: profile.id },
    });
    if (fnError || (fnData && fnData.error)) {
      await supabase.from('conversation_participants').delete().eq('conversation_id', conv.id).eq('user_id', authUser.id);
      await supabase.from('conversations').delete().eq('id', conv.id);
      toast.error(fnData?.error?.includes('privacy') ? 'This user has restricted who can message them' : 'Failed to start conversation');
      return;
    }
    navigate(`/messages/${profile.id}`);
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
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold text-foreground mt-3">{displayName}</h1>
        <p className="text-sm text-muted-foreground">@{profile.username || 'user'}</p>
        <Badge variant="secondary" className="mt-2 gap-1">
          {profile.plan === 'pro' && <Star className="w-3 h-3" />}
          {profile.plan === 'club' && <Crown className="w-3 h-3" />}
          {planLabel}
        </Badge>
        {profile.location && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2"><MapPin className="w-3 h-3" />{profile.location}</p>}
        {profile.bio && <p className="text-sm text-foreground/80 text-center mt-3 max-w-sm">{profile.bio}</p>}
      </div>

      {/* Actions */}
      {isOwnProfile ? (
        <div className="px-6 mb-6">
          <Button variant="outline" className="w-full gap-1.5" onClick={() => navigate('/you')}>
            <Edit className="w-4 h-4" /> Edit Profile
          </Button>
        </div>
      ) : (
        <div className="px-6 mb-6 space-y-2">
          <div className="flex gap-2">
            {friendStatus === 'accepted' ? (
              <Button variant="outline" className="flex-1 gap-1.5" onClick={handleRemoveFriend}>
                <UserMinus className="w-4 h-4" /> Friends ✓
              </Button>
            ) : friendStatus === 'pending_sent' ? (
              <Button variant="outline" className="flex-1" disabled>Request Sent</Button>
            ) : friendStatus === 'pending_received' ? (
              <Button className="flex-1 gap-1.5" onClick={handleAcceptRequest}>
                <UserPlus className="w-4 h-4" /> Accept Request
              </Button>
            ) : (
              <Button className="flex-1 gap-1.5" onClick={handleAddFriend}>
                <UserPlus className="w-4 h-4" /> Add Friend
              </Button>
            )}
            <Button variant="outline" className="flex-1 gap-1.5" onClick={handleMessage}>
              <MessageCircle className="w-4 h-4" /> Message
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full gap-1.5 text-xs ${isBlocked ? 'text-destructive' : 'text-muted-foreground'}`}
            onClick={handleToggleBlock}
          >
            {isBlocked ? <><ShieldCheck className="w-3.5 h-3.5" /> Unblock User</> : <><ShieldBan className="w-3.5 h-3.5" /> Block User</>}
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
      {(isOwnProfile || profile.show_garage_on_profile) && vehicles.length > 0 && (
        <div className="px-6 mb-6">
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

      {/* Public Routes */}
      {routes.length > 0 && (
        <div className="px-6">
          <h2 className="font-semibold text-foreground mb-3">Routes</h2>
          <div className="space-y-2">
            {routes.map((r: any) => (
              <button key={r.id} onClick={() => navigate(`/route/${r.id}`)} className="w-full bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-routes/10 flex items-center justify-center shrink-0">
                  <Route className="w-5 h-5 text-routes" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {r.difficulty && <span className="capitalize">{r.difficulty}</span>}
                    {r.distance_meters && <span>{(r.distance_meters / 1609.34).toFixed(1)} mi</span>}
                    {r.rating && <span>★ {r.rating}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
