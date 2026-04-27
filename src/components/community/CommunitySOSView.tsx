import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, MapPin, Phone, Users, CheckCircle, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSOSRequest, type UrgencyLevel } from '@/hooks/useSOSRequest';
import { toast } from 'sonner';

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
  urgency_level: UrgencyLevel;
  created_at: string;
  resolved_at: string | null;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
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

function formatTimeAgo(timestamp: string): string {
  const mins = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const URGENCY_STYLES: Record<UrgencyLevel, string> = {
  emergency: 'text-red-700 bg-red-100',
  high: 'text-orange-700 bg-orange-100',
  medium: 'text-yellow-700 bg-yellow-100',
  low: 'text-blue-700 bg-blue-100',
};

export default function CommunitySOSView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { acceptSOSRequest } = useSOSRequest();

  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('active');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Geolocation for distance calc
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    let q = supabase
      .from('sos_requests')
      .select(
        'id, user_id, helper_id, title, description, location, lat, lng, status, urgency_level, created_at, resolved_at, profiles:user_id(display_name, avatar_url, phone)',
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter === 'active') {
      q = q.eq('status', 'active').neq('user_id', user.id);
    } else if (filter === 'helping') {
      q = q.eq('status', 'helping').or(`helper_id.eq.${user.id},user_id.eq.${user.id}`);
    } else {
      q = q
        .in('status', ['resolved', 'cancelled'])
        .or(`helper_id.eq.${user.id},user_id.eq.${user.id}`);
    }

    const { data, error } = await q;
    if (error) {
      console.error('SOS fetch error:', error);
      setRequests([]);
    } else {
      setRequests((data ?? []) as unknown as SOSRequest[]);
    }
    setLoading(false);
  }, [filter, user?.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Realtime: refresh on any sos_requests change
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`sos-list-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, () => {
        fetchRequests();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchRequests]);

  const distanceText = (r: SOSRequest): string | null => {
    if (!userLoc || r.lat == null || r.lng == null) return r.location ?? null;
    const d = haversineMiles(userLoc.lat, userLoc.lng, Number(r.lat), Number(r.lng));
    if (d < 0.1) return 'nearby';
    if (d < 1) return `${Math.round(d * 5280)} ft away`;
    return `${d.toFixed(1)} mi away`;
  };

  const handleAccept = async (r: SOSRequest) => {
    if (!user?.id || acceptingId) return;
    setAcceptingId(r.id);
    try {
      const conversationId = await acceptSOSRequest(r.id, r.user_id);
      toast.success('You’re now helping. Stay in contact via chat.');
      navigate(`/messages/${conversationId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept SOS');
      fetchRequests();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleOpenThread = (r: SOSRequest) => {
    navigate(`/sos-request/${r.id}`);
  };

  const handleCall = (r: SOSRequest) => {
    const phone = r.profiles?.phone;
    if (!phone) {
      toast.error('No phone number on file for this user');
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const filterTabs: { id: Filter; label: string }[] = [
    { id: 'active', label: 'Needs Help' },
    { id: 'helping', label: 'Helping' },
    { id: 'history', label: 'History' },
  ];

  const getStatusIcon = (status: SOSRequest['status']) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
      case 'helping':
        return <Users className="w-3.5 h-3.5 text-amber-500" />;
      case 'resolved':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="bg-background min-h-full pb-24">
      {/* Emergency banner */}
      <div className="bg-red-50 border-b-2 border-red-100 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <h2 className="text-base font-bold text-red-900 tracking-tight">
            Emergency Assistance
          </h2>
        </div>
        <p className="text-xs text-red-700/90 leading-relaxed">
          Help fellow drivers and riders in their time of need.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-neutral-200 bg-background">
        {filterTabs.map((t) => {
          const active = filter === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`flex-1 h-11 text-[13px] font-semibold tracking-wide transition-colors ${
                active
                  ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                  : 'text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-100 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => {
              const requesterName = r.profiles?.display_name || 'Driver';
              const initial = requesterName[0]?.toUpperCase() || '?';
              const isMine = r.user_id === user?.id;
              const isHelper = r.helper_id === user?.id;
              const dist = distanceText(r);
              const isActiveTab = filter === 'active';

              return (
                <li
                  key={r.id}
                  className="bg-white border-2 border-red-100 rounded-2xl p-4 shadow-sm"
                >
                  {/* Header row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-red-100 text-red-700 font-bold text-base overflow-hidden"
                      style={
                        r.profiles?.avatar_url
                          ? { backgroundImage: `url(${r.profiles.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : undefined
                      }
                    >
                      {!r.profiles?.avatar_url && initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-foreground text-sm truncate">
                          {requesterName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${URGENCY_STYLES[r.urgency_level]}`}
                        >
                          {r.urgency_level.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 capitalize">
                          {getStatusIcon(r.status)}
                          {r.status}
                        </span>
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(r.created_at)}
                        </span>
                        {dist && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {dist}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title + description */}
                  <div className="mb-3">
                    <h3 className="font-bold text-foreground text-[15px] leading-snug">
                      {r.title}
                    </h3>
                    {r.description && (
                      <p className="mt-1 text-[13px] text-foreground/80 leading-relaxed">
                        {r.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isActiveTab && !isMine && (
                      <button
                        onClick={() => handleAccept(r)}
                        disabled={acceptingId === r.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-[13px] font-bold transition-colors disabled:opacity-60 disabled:cursor-wait"
                      >
                        {acceptingId === r.id ? 'Accepting…' : '🚗 I can help'}
                      </button>
                    )}
                    {(isMine || isHelper) && (
                      <button
                        onClick={() => handleOpenThread(r)}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-foreground py-2.5 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4" />
                        View thread
                      </button>
                    )}
                    {!isActiveTab && !isMine && !isHelper && (
                      <button
                        onClick={() => handleOpenThread(r)}
                        className="flex-1 bg-neutral-100 text-foreground py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                      >
                        View thread
                      </button>
                    )}
                    <button
                      onClick={() => handleCall(r)}
                      title="Call"
                      aria-label="Call this user"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
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
      title: 'No active emergencies nearby',
      body: 'All clear in your area. Drivers needing help will appear here.',
    },
    helping: {
      title: 'No active assistance',
      body: 'Tap an active SOS to offer help.',
    },
    history: {
      title: 'No assistance history',
      body: 'Resolved SOS threads will appear here.',
    },
  }[filter];
  return (
    <div className="text-center py-12">
      <AlertTriangle className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
      <p className="text-neutral-700 text-base font-semibold">{config.title}</p>
      <p className="text-neutral-500 text-[13px] mt-1">{config.body}</p>
    </div>
  );
}
