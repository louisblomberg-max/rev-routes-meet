import { useState, useEffect } from 'react';
import { Car, Users, Route, Calendar, UsersRound, Settings, ChevronRight, Crown, MessageSquare, Lock, MapPin, Share2, Pencil, Sparkles, Star, Building2, LifeBuoy, Wrench, Bookmark, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useUserStats } from '@/hooks/useUserStats';
import { useCurrentUser } from '@/hooks/useProfileData';
import { usePlan } from '@/contexts/PlanContext';
import { useGarage } from '@/contexts/GarageContext';
import { supabase } from '@/integrations/supabase/client';
import GlobalHeader from '@/components/GlobalHeader';

const YouTab = () => {
  const navigate = useNavigate();
  const { currentPlan, hasAccess, getPlanLabel, getRequiredPlan, effectivePlan } = usePlan();
  const { user } = useCurrentUser();
  const { vehicles } = useGarage();
  const { garageCount, friendsCount, clubsCount, eventsCount, routesCount, discussionsCount, savedServicesCount } = useUserStats();
  const [isAvailableToHelp, setIsAvailableToHelp] = useState(false);
  const [helpDistance, setHelpDistance] = useState(10);
  const [freeEventCredits, setFreeEventCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('available_to_help, help_radius_miles, free_event_credits').eq('id', user.id).single();
      if (data) {
        setIsAvailableToHelp(data.available_to_help || false);
        setHelpDistance(data.help_radius_miles || 10);
        setFreeEventCredits(data.free_event_credits ?? 0);
      }
    })();
  }, [user?.id]);

  const handleAvailableToggle = (v: boolean) => {
    setIsAvailableToHelp(v);
    if (user?.id) supabase.from('profiles').update({ available_to_help: v }).eq('id', user.id);
  };
  const handleHelpDistanceCommit = (v: number[]) => {
    setHelpDistance(v[0]);
    if (user?.id) supabase.from('profiles').update({ help_radius_miles: v[0] }).eq('id', user.id);
  };

  const planLabels: Record<string, string> = { free: 'Explorer', pro: 'Pro Driver', club: 'Organiser' };
  const planLabel = planLabels[currentPlan] || 'Explorer';
  const initials = (user?.displayName || 'U').slice(0, 2).toUpperCase();

  const quickAccess = [
    { label: 'My Events', icon: Calendar, count: eventsCount, route: '/my-events', featureId: 'save_events' },
    { label: 'My Routes', icon: Route, count: routesCount, route: '/my-routes', featureId: 'save_routes' },
    { label: 'My Clubs', icon: Users, count: clubsCount, route: '/my-clubs', featureId: 'join_clubs' },
    { label: 'Saved', icon: Bookmark, count: savedServicesCount, route: '/my-services', featureId: 'save_events' },
    { label: 'Friends', icon: UsersRound, count: friendsCount, route: '/my-friends', featureId: 'my_friends' },
    { label: 'Notifications', icon: Bell, count: 0, route: '/notifications', featureId: 'save_events' },
  ];

  const handleTileClick = (tile: typeof quickAccess[0]) => {
    if (!hasAccess(tile.featureId)) {
      const required = getRequiredPlan(tile.featureId);
      toast.info(`Requires ${getPlanLabel(required)}`, {
        action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
      });
      return;
    }
    navigate(tile.route);
  };

  return (
    <div className="h-full overflow-y-auto pb-24" style={{ background: '#f3f3e8' }}>
      {/* Profile Header Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '0 0 20px 20px',
          padding: '20px 16px 24px',
        }}
      >
        {/* Avatar + Name */}
        <div className="flex flex-col items-center">
          <button onClick={() => navigate('/profile')} className="btn-press">
            <Avatar className="w-[72px] h-[72px]" style={{ border: '3px solid #d30d37' }}>
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback style={{ background: '#fce8ed', color: '#d30d37', fontSize: 20, fontWeight: 500 }}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#111111', marginTop: 12 }}>
            {user?.displayName || 'New User'}
          </h1>
          <p style={{ fontSize: 14, color: '#999999', marginTop: 2 }}>
            @{user?.username || 'user'}
          </p>
          <div
            style={{
              background: '#fce8ed',
              color: '#d30d37',
              fontSize: 11,
              fontWeight: 500,
              borderRadius: 999,
              padding: '3px 12px',
              marginTop: 8,
            }}
          >
            {planLabel}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around" style={{ marginTop: 20 }}>
          {[
            { value: eventsCount, label: 'Events', route: '/my-events' },
            { value: routesCount, label: 'Routes', route: '/my-routes' },
            { value: clubsCount, label: 'Clubs', route: '/my-clubs' },
          ].map(stat => (
            <button key={stat.label} onClick={() => navigate(stat.route)} className="text-center btn-press">
              <div style={{ fontSize: 22, fontWeight: 500, color: '#d30d37' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#999999', marginTop: 2 }}>{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full btn-press"
          style={{
            marginTop: 16,
            height: 40,
            borderRadius: 10,
            border: '1px solid #d30d37',
            color: '#d30d37',
            background: 'transparent',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Pencil className="w-4 h-4" /> Edit Profile
        </button>
      </div>

      {/* My Garage */}
      <div style={{ padding: '24px 16px 0' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span className="text-label">My Garage</span>
          <div style={{ background: '#fce8ed', color: '#d30d37', fontSize: 11, fontWeight: 500, borderRadius: 999, padding: '2px 8px' }}>
            {vehicles.length}
          </div>
        </div>

        {vehicles.length === 0 ? (
          <div
            className="text-center btn-press"
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: 24,
              border: '0.5px solid #e8e8e0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🚗</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#111111' }}>Your garage is empty</p>
            <p style={{ fontSize: 13, color: '#666666', marginTop: 4 }}>Add your first vehicle</p>
            <button
              onClick={() => navigate('/add/vehicle')}
              className="btn-press"
              style={{
                marginTop: 12,
                height: 40,
                padding: '0 20px',
                background: '#d30d37',
                color: '#ffffff',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                border: 'none',
              }}
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
            {vehicles.map(v => (
              <button
                key={v.id}
                onClick={() => navigate('/my-garage')}
                className="flex-shrink-0 btn-press"
                style={{
                  width: 150,
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: 12,
                  border: '0.5px solid #e8e8e0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  textAlign: 'left',
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f3f3e8' }}>
                  <Car className="w-5 h-5" style={{ color: '#999999' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#111111', marginTop: 8 }} className="truncate">
                  {v.make} {v.model || ''}
                </p>
                <p style={{ fontSize: 13, color: '#999999' }}>
                  {[v.year, v.colour].filter(Boolean).join(' · ')}
                </p>
              </button>
            ))}
            <button
              onClick={() => navigate('/add/vehicle')}
              className="flex-shrink-0 btn-press flex flex-col items-center justify-center"
              style={{
                width: 150,
                background: '#ffffff',
                borderRadius: 12,
                padding: 12,
                border: '1px dashed #e8e8e0',
              }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fce8ed' }}>
                <span style={{ color: '#d30d37', fontSize: 20 }}>+</span>
              </div>
              <span style={{ fontSize: 13, color: '#999999', marginTop: 6 }}>Add Vehicle</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Access Grid */}
      <div style={{ padding: '24px 16px 0' }}>
        <div className="grid grid-cols-2 gap-2.5">
          {quickAccess.map(tile => {
            const Icon = tile.icon;
            const locked = !hasAccess(tile.featureId);
            return (
              <button
                key={tile.label}
                onClick={() => handleTileClick(tile)}
                className="btn-press relative"
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: 16,
                  border: '0.5px solid #e8e8e0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  height: 80,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: locked ? 0.5 : 1,
                }}
              >
                <Icon className="w-6 h-6" style={{ color: '#d30d37' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#111111' }}>{tile.label}</span>
                {tile.count > 0 && (
                  <div
                    className="absolute"
                    style={{
                      top: 10,
                      right: 10,
                      background: '#fce8ed',
                      color: '#d30d37',
                      fontSize: 11,
                      fontWeight: 500,
                      borderRadius: 999,
                      padding: '1px 7px',
                    }}
                  >
                    {tile.count}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Free credit display */}
      {effectivePlan === 'free' && freeEventCredits !== null && (
        <div style={{ padding: '16px 16px 0' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '14px 16px',
              borderLeft: '3px solid #d30d37',
              border: '0.5px solid #e8e8e0',
              borderLeftWidth: 3,
              borderLeftColor: '#d30d37',
            }}
          >
            <p style={{ fontSize: 14, color: '#111111', fontWeight: 500 }}>
              {freeEventCredits > 0 ? `${freeEventCredits} free event credit remaining` : 'No free credits remaining'}
            </p>
            <button onClick={() => navigate('/upgrade')} style={{ fontSize: 13, color: '#d30d37', marginTop: 4, fontWeight: 500 }}>
              Upgrade to Pro →
            </button>
          </div>
        </div>
      )}

      {/* Settings */}
      <div style={{ padding: '24px 16px 16px' }}>
        <button
          onClick={() => navigate('/settings')}
          className="w-full btn-press flex items-center gap-3"
          style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: '14px 16px',
            border: '0.5px solid #e8e8e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <Settings className="w-5 h-5" style={{ color: '#999999' }} />
          <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 500, color: '#111111' }}>Settings</span>
          <ChevronRight className="w-4 h-4" style={{ color: '#c0c0b8' }} />
        </button>
      </div>
    </div>
  );
};

export default YouTab;
