import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Car, Bike, Calendar, Route, Check,
  Settings, ChevronRight, Bell, UsersRound, Wrench, Users as UsersIcon,
  Pencil,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const initials = (name: string | null | undefined) =>
  (name ?? 'U').split(' ').map((n) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();

const formatMemberSince = (iso: string | null) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

export default function ProfileView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, vehicles, recentReviews, loading } = useUserProfile();
  const { garageCount, friendsCount, eventsCount, routesCount, savedServicesCount } = useUserStats();

  const [myTickets, setMyTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const result = await Promise.race([
          Promise.all([
            supabase.from('event_tickets').select('id, event_id, amount_paid, qr_code_token, status, events(title, date_start)').eq('user_id', user.id).eq('status', 'confirmed'),
            supabase.from('event_attendees').select('id, event_id, qr_code_token, events(title, date_start)').eq('user_id', user.id).not('qr_code_token', 'is', null),
          ]),
          new Promise<null>((r) => setTimeout(() => r(null), 3000)),
        ]);
        if (result && Array.isArray(result)) {
          const [ticketsRes, passesRes] = result;
          const tickets = (ticketsRes.data || []).map((t: any) => ({
            ...t, event_title: t.events?.title, event_date: t.events?.date_start, isFree: false,
          }));
          const passes = (passesRes.data || [])
            .filter((p: any) => !tickets.some((t: any) => t.event_id === p.event_id))
            .map((p: any) => ({ ...p, event_title: p.events?.title, event_date: p.events?.date_start, isFree: true, amount_paid: 0 }));
          setMyTickets([...tickets, ...passes]);
        }
      } catch { /* empty */ }
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-background min-h-full pb-24 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Couldn't load your profile.</p>
      </div>
    );
  }

  const memberSince = formatMemberSince(profile.created_at);

  const rows = [
    { id: 'notifications', label: 'Notifications', icon: Bell, route: '/notifications', count: undefined as number | undefined },
    { id: 'garage',        label: 'My Garage',     icon: Car,         route: '/my-garage',    count: garageCount },
    { id: 'friends',       label: 'My Friends',    icon: UsersRound,  route: '/my-friends',   count: friendsCount },
    { id: 'events',        label: 'My Events',     icon: Calendar,    route: '/my-events',    count: eventsCount },
    { id: 'routes',        label: 'My Routes',     icon: Route,       route: '/my-routes',    count: routesCount },
    { id: 'services',      label: 'Saved Services',icon: Wrench,      route: '/my-services',  count: savedServicesCount },
  ];

  return (
    <div className="bg-background min-h-full pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border/50 px-4 py-4">
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ─── Profile Header Card ─── */}
        <div className="bg-white border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/profile')} className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-lg">
                    {initials(profile.display_name)}
                  </span>
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-foreground truncate">
                {profile.display_name || 'RevNet User'}
              </h2>
              {profile.username && (
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
              )}
              {profile.location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </p>
              )}
              {memberSince && (
                <p className="text-xs text-muted-foreground mt-0.5">Member since {memberSince}</p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')} className="flex-shrink-0">
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </div>

          {profile.bio && (
            <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{profile.bio}</p>
          )}

          {/* Helper Rating */}
          {profile.helper_count > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-green-800">Helper Rating</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(profile.helper_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-green-800">{profile.helper_rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-green-700">
                Helped {profile.helper_count} {profile.helper_count === 1 ? 'driver' : 'drivers'}
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => navigate('/my-events')} className="text-center p-2 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">{profile.events_attended}</span>
              </div>
              <p className="text-xs text-muted-foreground">Events attended</p>
            </button>
            <button onClick={() => navigate('/my-routes')} className="text-center p-2 rounded-lg hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Route className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-semibold text-foreground">{profile.routes_shared}</span>
              </div>
              <p className="text-xs text-muted-foreground">Routes shared</p>
            </button>
          </div>
        </div>

        {/* ─── Vehicles ─── */}
        <div className="bg-white border border-border/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-foreground">Vehicles</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/add/vehicle')}>
              Add Vehicle
            </Button>
          </div>

          {vehicles.length > 0 ? (
            <div className="space-y-2">
              {vehicles.map((v) => {
                const VIcon = v.vehicle_type === 'motorcycle' ? Bike : Car;
                const yearLabel = v.year ? `${v.year} ` : '';
                const meta = [v.colour, v.transmission].filter(Boolean).join(' • ');
                return (
                  <button
                    key={v.id}
                    onClick={() => navigate('/my-garage')}
                    className="w-full border border-border/30 rounded-lg p-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <VIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-semibold text-sm truncate">
                          {yearLabel}{v.make ?? ''} {v.model ?? ''}
                        </span>
                      </div>
                      {v.is_primary && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded flex-shrink-0">
                          Primary
                        </span>
                      )}
                    </div>
                    {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No vehicles added yet
            </p>
          )}
        </div>

        {/* ─── Specialties ─── */}
        {profile.specialties.length > 0 && (
          <div className="bg-white border border-border/50 rounded-xl p-4">
            <h3 className="text-base font-semibold text-foreground mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full border border-border/40"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Recent Reviews ─── */}
        {recentReviews.length > 0 && (
          <div className="bg-white border border-border/50 rounded-xl p-4">
            <h3 className="text-base font-semibold text-foreground mb-3">Recent reviews</h3>
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div key={review.id} className="border-b border-border/30 last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.rater?.avatar_url ? (
                        <img src={review.rater.avatar_url} alt="" className="w-6 h-6 object-cover" />
                      ) : (
                        <span className="text-blue-600 text-[10px] font-semibold">
                          {initials(review.rater?.display_name)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {review.rater?.display_name ?? 'Anonymous'}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {review.feedback && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      &ldquo;{review.feedback}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Verification ─── */}
        <div className="bg-white border border-border/50 rounded-xl p-4">
          <h3 className="text-base font-semibold text-foreground mb-3">Verification</h3>
          <div className="space-y-2">
            {[
              { label: 'Phone number verified', verified: profile.phone_verified },
              { label: 'Email verified',        verified: profile.email_verified },
              { label: 'Identity verified',     verified: profile.identity_verified },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <Check className={`w-4 h-4 ${row.verified ? 'text-green-600' : 'text-gray-300'}`} />
                <span className={`text-sm ${row.verified ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {row.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── My Tickets (preserved from old YouTab) ─── */}
        {myTickets.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Tickets</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {myTickets.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => navigate(t.isFree
                    ? `/ticket-success?ticket_id=free&event_id=${t.event_id}&type=free#token=${t.qr_code_token}`
                    : `/ticket-success?ticket_id=${t.id}`)}
                  className="flex-shrink-0 w-[160px] bg-card rounded-xl border border-border/50 shadow-sm p-3 text-left"
                >
                  <p className="text-sm font-semibold truncate">{t.event_title || 'Event'}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t.event_date || ''}</p>
                  <p className="text-[10px] mt-1 text-red-600">
                    {t.isFree ? 'Free Pass' : `Ticket · £${Number(t.amount_paid || 0).toFixed(2)}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Tap to show QR</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Quick links (preserved row-item nav) ─── */}
        <div className="bg-white border border-border/50 rounded-xl overflow-hidden">
          {rows.map((row, i) => {
            const Icon = row.icon;
            const isLast = i === rows.length - 1;
            return (
              <button
                key={row.id}
                onClick={() => {
                  sessionStorage.setItem('revnet_active_tab', 'profile');
                  navigate(row.route);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors ${isLast ? '' : 'border-b border-border/30'}`}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="flex-1 text-sm font-semibold text-foreground">{row.label}</span>
                {row.count !== undefined && (
                  <span className="text-xs text-muted-foreground">{row.count}</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>

        {/* ─── Settings ─── */}
        <button
          onClick={() => navigate('/settings')}
          className="w-full bg-white border border-border/50 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="flex-1 text-sm font-semibold text-foreground">Settings</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </button>
      </div>
    </div>
  );
}
