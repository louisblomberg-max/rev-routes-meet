import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  AlertTriangle, Zap, Fuel, Car, Wrench, Lock, ArrowLeft, Navigation,
  MessageCircle, RefreshCw, Clock,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { formatDistanceToNow } from 'date-fns';

interface HelpRequest {
  id: string;
  user_id: string;
  issue_type: 'electrical' | 'flat_tyre' | 'out_of_fuel' | 'locked_out' | 'mechanical' | 'accident';
  details: string | null;
  lat: number;
  lng: number;
  help_source: string;
  status: 'active' | 'responding' | 'resolved' | 'cancelled';
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  distanceMiles?: number;
  isResponding?: boolean;
}

const ISSUE_CONFIG: Record<string, { icon: typeof Zap; label: string; color: string }> = {
  electrical: { icon: Zap, label: 'Electrical Issue', color: '#F59E0B' },
  flat_tyre: { icon: Car, label: 'Flat Tyre', color: '#F97316' },
  out_of_fuel: { icon: Fuel, label: 'Out of Fuel', color: '#3B82F6' },
  locked_out: { icon: Lock, label: 'Locked Out', color: '#8B5CF6' },
  mechanical: { icon: Wrench, label: 'Mechanical Problem', color: '#EF4444' },
  accident: { icon: AlertTriangle, label: 'Accident', color: '#DC2626' },
};

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const SosFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [myActiveRequest, setMyActiveRequest] = useState<HelpRequest | null>(null);
  const [isAvailableToHelp, setIsAvailableToHelp] = useState(false);
  const [helpDistance, setHelpDistance] = useState(10);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const isAvailableRef = useRef(isAvailableToHelp);
  const helpDistanceRef = useRef(helpDistance);
  useEffect(() => { isAvailableRef.current = isAvailableToHelp; }, [isAvailableToHelp]);
  useEffect(() => { helpDistanceRef.current = helpDistance; }, [helpDistance]);

  const fetchRequests = useCallback(async (
    silent = false,
    availableToHelp: boolean = isAvailableRef.current,
    radiusMiles: number = helpDistanceRef.current,
  ) => {
    if (!silent) setLoading(true);
    try {
      // When toggle is OFF, browse cap is 50 miles. When ON, use the user's chosen radius.
      const effectiveRadius = availableToHelp ? radiusMiles : 50;
      // Approx degrees per mile: ~0.0145 lat, ~0.0181 lng (UK latitude)
      const latDelta = effectiveRadius * 0.0145;
      const lngDelta = effectiveRadius * 0.0181;

      let query = supabase
        .from('help_requests')
        .select('*, profiles(username, display_name, avatar_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const loc = userLocationRef.current;
      if (loc) {
        query = query
          .gte('lat', loc.lat - latDelta)
          .lte('lat', loc.lat + latDelta)
          .gte('lng', loc.lng - lngDelta)
          .lte('lng', loc.lng + lngDelta);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped: HelpRequest[] = (data || []).map((r: any) => ({
        ...r,
        distanceMiles: userLocationRef.current
          ? haversineKm(userLocationRef.current.lat, userLocationRef.current.lng, r.lat, r.lng) * 0.621371
          : undefined,
        isResponding: false,
      }));

      // Client-side fine filter to the effective radius
      const filtered = userLocationRef.current
        ? mapped.filter(r => (r.distanceMiles ?? 0) <= effectiveRadius)
        : mapped;

      filtered.sort((a, b) => {
        if (a.distanceMiles != null && b.distanceMiles != null) return a.distanceMiles - b.distanceMiles;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setRequests(filtered);

      if (user?.id) {
        const own = filtered.find(r => r.user_id === user.id);
        setMyActiveRequest(own || null);
      }
    } catch {
      if (!silent) toast.error('Failed to load breakdown requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggleAvailableToHelp = async (value: boolean) => {
    setIsAvailableToHelp(value);
    if (!user?.id) return;
    await supabase.from('profiles').update({ available_to_help: value }).eq('id', user.id);
    if (value) {
      toast.success(`You are now available to help within ${helpDistance} miles`);
    } else {
      toast('You are no longer marked as available to help');
    }
  };

  const updateHelpDistance = async (miles: number) => {
    setHelpDistance(miles);
    if (!user?.id) return;
    await supabase.from('profiles').update({ help_radius_miles: miles }).eq('id', user.id);
  };

  // Mount: get location + prefs, fetch, subscribe to realtime
  useEffect(() => {
    let cancelled = false;

    const loadPrefs = async () => {
      if (!user?.id) {
        setPrefsLoaded(true);
        return;
      }
      try {
        const { data: prefs } = await supabase
          .from('profiles')
          .select('available_to_help, help_radius_miles')
          .eq('id', user.id)
          .single();
        if (cancelled) return;
        if (prefs) {
          const av = prefs.available_to_help || false;
          const rm = prefs.help_radius_miles || 10;
          setIsAvailableToHelp(av);
          setHelpDistance(rm);
          isAvailableRef.current = av;
          helpDistanceRef.current = rm;
        }
      } catch { /* defaults */ }
      setPrefsLoaded(true);
    };

    const init = async () => {
      await loadPrefs();
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          userLocationRef.current = loc;
          setUserLocation(loc);
          fetchRequests();
        },
        () => {
          if (cancelled) return;
          fetchRequests();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    init();

    const channel = supabase
      .channel('sos-feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'help_requests' }, (payload: any) => {
        const newRow = payload.new;
        if (!newRow || newRow.status !== 'active') return;

        // Only add to list + show toast if user is Available to Help AND within their radius
        const available = isAvailableRef.current;
        const radius = helpDistanceRef.current;

        const distanceMiles = userLocationRef.current
          ? haversineKm(userLocationRef.current.lat, userLocationRef.current.lng, newRow.lat, newRow.lng) * 0.621371
          : undefined;

        if (!available) return; // Browse-only mode: no live additions, no notifications
        if (distanceMiles != null && distanceMiles > radius) return;

        setRequests(prev => {
          if (prev.some(r => r.id === newRow.id)) return prev;
          return [{ ...newRow, distanceMiles, profiles: null, isResponding: false }, ...prev];
        });

        const issueLabel = ISSUE_CONFIG[newRow.issue_type as string]?.label || newRow.issue_type;
        toast(`🚨 New breakdown request nearby — ${issueLabel}`);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'help_requests' }, (payload: any) => {
        const updated = payload.new;
        if (!updated) return;
        setRequests(prev => {
          if (updated.status === 'resolved' || updated.status === 'cancelled') {
            return prev.filter(r => r.id !== updated.id);
          }
          return prev.map(r => (r.id === updated.id ? { ...r, ...updated } : r));
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'help_requests' }, (payload: any) => {
        const old = payload.old;
        if (!old) return;
        setRequests(prev => prev.filter(r => r.id !== old.id));
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch whenever toggle or radius changes so the feed reflects the new filter
  useEffect(() => {
    if (prefsLoaded) {
      fetchRequests(true, isAvailableToHelp, helpDistance);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailableToHelp, helpDistance, prefsLoaded]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleRespond = async (request: HelpRequest) => {
    if (!user?.id) return;
    if (request.user_id === user.id) { toast.error('This is your own request'); return; }
    if (respondingIds.has(request.id)) return;

    setRespondingIds(prev => new Set(prev).add(request.id));

    try {
      // 1. Update request status to responding
      await supabase
        .from('help_requests')
        .update({ status: 'responding' })
        .eq('id', request.id);

      // 2. Check if a conversation already exists between the two users
      const { data: existingParticipant } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      let conversationId: string | null = null;

      if (existingParticipant?.length) {
        const convIds = existingParticipant.map((p: any) => p.conversation_id);
        const { data: sharedConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', request.user_id)
          .in('conversation_id', convIds);

        if (sharedConvs?.length) {
          conversationId = sharedConvs[0].conversation_id;
        }
      }

      // 3. Create new conversation if none exists
      if (!conversationId) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({ type: 'direct' })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;

        await supabase.from('conversation_participants').insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: request.user_id },
        ]);
      }

      // 4. Send automatic first message
      const issueLabel = ISSUE_CONFIG[request.issue_type]?.label || request.issue_type;
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: `Hi! I saw your breakdown request on RevNet — I can help with your ${issueLabel}. I'm on my way.`,
      });

      toast.success('Great — a message has been sent to them');

      // 5. Navigate to the conversation (Conversation page expects other user's id in :id param)
      navigate(`/messages/${request.user_id}`);
    } catch {
      toast.error('Failed to respond — please try again');
      setRespondingIds(prev => { const s = new Set(prev); s.delete(request.id); return s; });
    }
  };

  const handleDirections = (request: HelpRequest) => {
    const name = request.profiles?.display_name || request.profiles?.username || 'Breakdown';
    const issueLabel = ISSUE_CONFIG[request.issue_type]?.label || 'Breakdown';
    navigate('/navigation', {
      state: {
        destLat: request.lat,
        destLng: request.lng,
        destTitle: `${name} — ${issueLabel}`,
      },
    });
  };

  const handleCancelOwnRequest = async () => {
    if (!myActiveRequest || !user?.id) return;
    await supabase
      .from('help_requests')
      .update({ status: 'cancelled' })
      .eq('id', myActiveRequest.id)
      .eq('user_id', user.id);
    setMyActiveRequest(null);
    toast.success('Your breakdown request has been cancelled');
    fetchRequests(true);
  };

  const visibleRequests = requests.filter(r => r.user_id !== user?.id);
  const activeCount = visibleRequests.length;

  return (
    <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              Breakdown Help
              {activeCount > 0 && (
                <span className="min-w-[24px] h-6 px-2 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                  {activeCount}
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              {userLocation
                ? (isAvailableToHelp ? `Within ${helpDistance} miles` : 'Within 50 miles')
                : 'All active requests'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted flex items-center justify-center"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Available to Help card */}
      {!prefsLoaded ? (
        <div className="mx-4 mt-3 mb-1">
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : (
        <div className="mx-4 mt-3 mb-1">
          <div className={`bg-card rounded-xl shadow-sm overflow-hidden border ${isAvailableToHelp ? 'border-l-4 border-l-green-500 border-y border-r border-border/50' : 'border-border/50'}`}>
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">Available to Help</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive notifications and filter requests by your radius</p>
              </div>
              <Switch
                checked={isAvailableToHelp}
                onCheckedChange={toggleAvailableToHelp}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
            {isAvailableToHelp && (
              <div className="px-4 pb-4 pt-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Help radius</span>
                  <span className="text-xs font-medium text-foreground">{helpDistance} miles</span>
                </div>
                <Slider
                  value={[helpDistance]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(v) => setHelpDistance(v[0])}
                  onValueCommit={(v) => updateHelpDistance(v[0])}
                  className="w-full"
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">1 mi</span>
                  <span className="text-[10px] text-muted-foreground">25 mi</span>
                  <span className="text-[10px] text-muted-foreground">50 mi</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Own active request banner */}
      {myActiveRequest && (
        <div className="mx-4 mt-3 mb-1 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">You have an active breakdown request</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">{ISSUE_CONFIG[myActiveRequest.issue_type]?.label || myActiveRequest.issue_type}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-400 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            onClick={handleCancelOwnRequest}
          >
            Cancel Request
          </Button>
        </div>
      )}

      <div className="px-4 py-4 space-y-3 pb-24">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-xl border border-border/50 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            ))}
          </>
        ) : visibleRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground mb-1">No active breakdowns nearby</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[280px]">All clear in your area. Check back later or expand your search radius.</p>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        ) : (
          <>
            {visibleRequests.map(request => {
              const cfg = ISSUE_CONFIG[request.issue_type] || ISSUE_CONFIG.mechanical;
              const Icon = cfg.icon;
              const isResponding = respondingIds.has(request.id);
              const isHelping = request.status === 'responding';
              const name = request.profiles?.display_name || request.profiles?.username || 'RevNet member';
              const username = request.profiles?.username;

              return (
                <div key={request.id} className="bg-card rounded-xl border border-border/50 shadow-sm p-4">
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={request.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-foreground font-semibold text-sm">
                        {name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{name}</p>
                      {username && <p className="text-xs text-muted-foreground truncate">@{username}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {request.distanceMiles != null && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {request.distanceMiles < 1
                            ? `${Math.round(request.distanceMiles * 5280)} ft`
                            : `${request.distanceMiles.toFixed(1)} mi`}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Issue */}
                  <div className="flex items-start gap-2 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${cfg.color}26` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-medium text-sm" style={{ color: cfg.color }}>{cfg.label}</p>
                      {request.details && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{request.details}</p>
                      )}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    {isHelping ? (
                      <div className="flex-1 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-xs font-medium text-muted-foreground">
                        Someone is helping
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRespond(request)}
                        disabled={isResponding}
                        className="flex-1 h-10 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {isResponding ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4" /> I Can Help
                          </>
                        )}
                      </button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleDirections(request)}
                      className="flex-1 h-10 gap-1.5"
                    >
                      <Navigation className="w-4 h-4" /> Directions
                    </Button>
                  </div>
                </div>
              );
            })}
            <p className="text-[11px] text-center text-muted-foreground mt-4 px-4">
              {isAvailableToHelp
                ? `Showing requests within ${helpDistance} miles • Updates in real time`
                : 'Showing all nearby requests • Turn on Available to Help for notifications'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SosFeed;
