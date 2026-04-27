import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Filter = 'active' | 'helping' | 'history';

interface SOSRequest {
  id: string;
  user_id: string;
  helper_id: string | null;
  title: string;
  description: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  status: 'active' | 'helping' | 'resolved' | 'cancelled';
  created_at: string;
  resolved_at: string | null;
  // joined
  requester?: { display_name: string | null; username: string | null; avatar_url: string | null };
  _distMi?: number | null;
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function timeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const STATUS_META: Record<SOSRequest['status'], { dot: string; label: string; tone: string }> = {
  active: { dot: 'bg-[#EF4444]', label: 'Active', tone: 'text-[#EF4444]' },
  helping: { dot: 'bg-amber-500', label: 'Helping', tone: 'text-amber-600' },
  resolved: { dot: 'bg-emerald-500', label: 'Resolved', tone: 'text-emerald-600' },
  cancelled: { dot: 'bg-neutral-400', label: 'Cancelled', tone: 'text-neutral-500' },
};

export default function CommunitySOSView() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filter, setFilter] = useState<Filter>('active');
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  // User location for distance calc
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const enrichDistance = useCallback(
    (rows: SOSRequest[]): SOSRequest[] => {
      if (!userLoc) return rows;
      return rows.map((r) => {
        if (r.lat == null || r.lng == null) return { ...r, _distMi: null };
        return { ...r, _distMi: haversineMiles(userLoc.lat, userLoc.lng, Number(r.lat), Number(r.lng)) };
      });
    },
    [userLoc],
  );

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    let q = supabase
      .from('sos_requests')
      .select('id, user_id, helper_id, title, description, location, lat, lng, status, created_at, resolved_at, requester:profiles!sos_requests_user_id_fkey(display_name, username, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'active') {
      // Show all active requests (so helpers can see them) + own requests in any active state
      q = q.in('status', ['active', 'helping']).neq('user_id', user.id);
    } else if (filter === 'helping') {
      q = q.eq('helper_id', user.id);
    } else {
      // history: own requests + ones I helped on, resolved/cancelled
      q = q.in('status', ['resolved', 'cancelled']).or(`user_id.eq.${user.id},helper_id.eq.${user.id}`);
    }

    const { data, error } = await q;
    if (!error && data) {
      setRequests(enrichDistance(data as unknown as SOSRequest[]));
    } else {
      setRequests([]);
    }
    setLoading(false);
  }, [filter, user?.id, enrichDistance]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refresh on any sos_requests change
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`sos-list-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, () => {
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, load]);

  const filters: { id: Filter; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'helping', label: 'Helping' },
    { id: 'history', label: 'History' },
  ];

  const fmtDistance = (d?: number | null): string | null => {
    if (d == null) return null;
    if (d < 0.1) return 'nearby';
    if (d < 1) return `${(d * 5280).toFixed(0)} ft away`;
    return `${d.toFixed(1)} mi away`;
  };

  return (
    <div className="bg-background min-h-full pb-24">
      {/* Filter pills */}
      <div className="px-4 pt-3 pb-3 flex gap-2 border-b-2 border-[#E5E5E5]">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 h-9 rounded-xl text-[13px] font-semibold tracking-wide transition-colors ${
                active
                  ? 'bg-[#EF4444] text-white border-2 border-[#EF4444]'
                  : 'bg-white text-foreground border-2 border-[#E5E5E5] hover:bg-neutral-50'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="px-4">
        {loading ? (
          <div className="space-y-2 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <ul className="divide-y divide-[#F0F0F0]">
            {requests.map((r) => {
              const meta = STATUS_META[r.status];
              const dist = fmtDistance(r._distMi);
              const requesterName =
                r.requester?.display_name || r.requester?.username || 'Driver';
              const initial = requesterName[0]?.toUpperCase() || '?';
              const isUrgent = r.status === 'active';

              return (
                <li key={r.id}>
                  <button
                    onClick={() => navigate(`/sos-request/${r.id}`)}
                    className="w-full flex items-start gap-3 py-3 text-left hover:bg-neutral-50 -mx-4 px-4 transition-colors"
                  >
                    {/* Avatar with status overlay */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base"
                        style={{
                          background: r.requester?.avatar_url
                            ? `url(${r.requester.avatar_url}) center/cover`
                            : '#EF4444',
                        }}
                      >
                        {!r.requester?.avatar_url && initial}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${meta.dot}`}
                      />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[15px] font-bold text-foreground truncate">
                          {r.title}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide flex-shrink-0 ${meta.tone}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="text-[12px] text-muted-foreground truncate mt-0.5">
                        {requesterName}
                        {r.location ? ` · ${r.location}` : ''}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        <span className={`flex items-center gap-1 font-semibold ${isUrgent ? 'text-[#EF4444]' : 'text-muted-foreground'}`}>
                          <Clock className="w-3 h-3" />
                          {timeAgo(r.created_at)}
                        </span>
                        {dist && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {dist}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const config = {
    active: {
      icon: AlertTriangle,
      title: 'No active SOS requests',
      body: 'Drivers in trouble nearby will appear here. Be ready to help.',
      tone: 'text-[#EF4444]',
    },
    helping: {
      icon: ShieldCheck,
      title: 'You aren’t helping anyone yet',
      body: 'Tap an active SOS to offer help. They’ll see your status update live.',
      tone: 'text-amber-600',
    },
    history: {
      icon: Clock,
      title: 'No past SOS yet',
      body: 'Resolved and cancelled SOS threads appear here.',
      tone: 'text-muted-foreground',
    },
  }[filter];
  const Icon = config.icon;
  return (
    <div className="text-center py-16 px-6">
      <Icon className={`w-12 h-12 mx-auto mb-3 ${config.tone}`} />
      <p className="text-[15px] font-bold text-foreground">{config.title}</p>
      <p className="text-[13px] text-muted-foreground mt-1.5">{config.body}</p>
    </div>
  );
}
