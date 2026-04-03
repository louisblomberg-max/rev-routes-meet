import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGarage } from '@/contexts/GarageContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Pencil, Car, Plus, Calendar, Route, Users, Crown, Star, Sparkles } from 'lucide-react';
import BackButton from '@/components/BackButton';

const PLAN_CONFIG: Record<string, { label: string; icon: typeof Crown; className: string }> = {
  free: { label: 'Explorer', icon: Sparkles, className: 'bg-muted text-muted-foreground' },
  pro: { label: 'Pro Driver', icon: Star, className: 'bg-gradient-to-r from-routes to-clubs text-primary-foreground' },
  club: { label: 'Organiser', icon: Crown, className: 'bg-gradient-to-r from-clubs to-primary text-primary-foreground' },
};

const You = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { vehicles, isLoading: garageLoading } = useGarage();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ events: 0, routes: 0, clubs: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authUser?.id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const [profileRes, eventsRes, routesRes, clubsRes] = await Promise.all([
          supabase.from('profiles').select('id, display_name, username, avatar_url, bio, plan, location').eq('id', authUser.id).single(),
          supabase.from('event_attendees').select('event_id', { count: 'exact', head: true }).eq('user_id', authUser.id),
          supabase.from('routes').select('id', { count: 'exact', head: true }).eq('created_by', authUser.id),
          supabase.from('club_memberships').select('club_id', { count: 'exact', head: true }).eq('user_id', authUser.id),
        ]);
        if (profileRes.error) throw profileRes.error;
        setProfile(profileRes.data);
        setStats({
          events: eventsRes.count || 0,
          routes: routesRes.count || 0,
          clubs: clubsRes.count || 0,
        });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [authUser?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <BackButton />
          <h1 className="text-lg font-bold text-foreground">Profile</h1>
          <div className="w-8" />
        </div>
        <div className="flex flex-col items-center px-6 py-6 gap-3">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-3 gap-3 w-full mt-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || authUser?.displayName || 'User';
  const username = profile?.username || authUser?.username;
  const avatar = profile?.avatar_url || authUser?.avatar;
  const bio = profile?.bio;
  const plan = profile?.plan || 'free';
  const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const PlanIcon = planConfig.icon;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <BackButton />
        <h1 className="text-lg font-bold text-foreground">Profile</h1>
        <div className="w-8" />
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center px-6 py-6 gap-3">
        <Avatar className="w-20 h-20 border-2 border-border">
          <AvatarImage src={avatar || undefined} alt={displayName} />
          <AvatarFallback className="text-lg font-bold bg-muted text-muted-foreground">{initials}</AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
          {username && <p className="text-sm text-muted-foreground">@{username}</p>}
          <Badge className={`${planConfig.className} gap-1 mt-1.5`}>
            <PlanIcon className="w-3 h-3" /> {planConfig.label}
          </Badge>
          {bio && <p className="text-sm text-foreground/80 mt-2 max-w-xs">{bio}</p>}
        </div>

        <Button onClick={() => navigate('/profile')} variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Pencil className="w-3.5 h-3.5" />
          Edit Profile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-6">
        <button onClick={() => navigate('/my-events')} className="bg-card rounded-xl p-3 border border-border/50 text-center">
          <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.events}</p>
          <p className="text-[10px] text-muted-foreground">Events</p>
        </button>
        <button onClick={() => navigate('/my-routes')} className="bg-card rounded-xl p-3 border border-border/50 text-center">
          <Route className="w-4 h-4 text-routes mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.routes}</p>
          <p className="text-[10px] text-muted-foreground">Routes</p>
        </button>
        <button onClick={() => navigate('/my-clubs')} className="bg-card rounded-xl p-3 border border-border/50 text-center">
          <Users className="w-4 h-4 text-clubs mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{stats.clubs}</p>
          <p className="text-[10px] text-muted-foreground">Clubs</p>
        </button>
      </div>

      {/* Garage section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            My Garage
            {vehicles.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">{vehicles.length}</Badge>
            )}
          </h3>
          <Button onClick={() => navigate('/add/vehicle')} variant="ghost" size="sm" className="gap-1 text-primary">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>

        {garageLoading ? (
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
              <button key={v.id} onClick={() => navigate('/my-garage')} className="bg-card rounded-xl p-4 border border-border/50 relative text-left">
                {v.isPrimary && (
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
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default You;
