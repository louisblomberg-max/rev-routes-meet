import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Route, Plus, MapPin, Clock, ChevronRight, Search, Calendar, Wrench, Radio, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

type SavedTab = 'routes' | 'events' | 'services';

export default function DriveTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status: navStatus, destination } = useNavigation();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Location sharing
  const [sharingEnabled, setSharingEnabled] = useState(false);

  // Friends driving
  const [friendLocations, setFriendLocations] = useState<any[]>([]);

  // Saved items
  const [savedTab, setSavedTab] = useState<SavedTab>('routes');
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [savedServices, setSavedServices] = useState<any[]>([]);

  // Drives
  const [recentDrives, setRecentDrives] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDrives: 0, totalMiles: 0, avgMiles: 0 });
  const [loading, setLoading] = useState(true);

  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing';

  // ── Mapbox geocoding ──

  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=gb&language=en&limit=5&types=address,poi,place,locality`
      );
      const data = await res.json();
      setSearchResults(
        (data.features || []).map((f: any) => ({
          id: f.id,
          name: f.text,
          address: f.place_name,
          lat: f.center[1],
          lng: f.center[0],
        }))
      );
    } catch {
      setSearchResults([]);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => searchPlaces(value), 300);
  };

  const selectResult = (result: SearchResult) => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);
    navigate('/navigation', {
      state: { destLat: result.lat, destLng: result.lng, destTitle: result.name },
    });
  };

  // ── Location sharing ──

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('live_location_sessions')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setSharingEnabled(data?.is_active || false));
  }, [user?.id]);

  const toggleSharing = async () => {
    if (!user?.id) return;
    if (sharingEnabled) {
      await supabase
        .from('live_location_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('user_id', user.id);
      setSharingEnabled(false);
      toast.success('Location sharing stopped');
    } else {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await supabase.from('live_location_sessions').upsert({
            user_id: user.id,
            is_active: true,
            started_at: new Date().toISOString(),
            last_lat: pos.coords.latitude,
            last_lng: pos.coords.longitude,
            session_type: 'sharing',
            shared_with: [],
          });
          setSharingEnabled(true);
          toast.success('Sharing your location with friends');
        },
        () => toast.error('Location access required')
      );
    }
  };

  // ── Friends driving ──

  useEffect(() => {
    if (!user?.id) return;
    const loadFriends = async () => {
      const { data } = await supabase.rpc('get_friend_locations', { p_user_id: user.id });
      setFriendLocations(data || []);
    };
    loadFriends();
    const interval = setInterval(loadFriends, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // ── Data loading ──

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);

      const [routesRes, eventsRes, servicesRes, sessionsRes, allSessionsRes] = await Promise.all([
        supabase
          .from('saved_routes')
          .select('route_id, routes(*)')
          .eq('user_id', user.id)
          .order('saved_at', { ascending: false })
          .limit(10),
        supabase
          .from('saved_events')
          .select('event_id, events(id, title, lat, lng, date_start, location)')
          .eq('user_id', user.id)
          .limit(10),
        supabase
          .from('saved_services')
          .select('service_id, services(id, name, lat, lng, address, service_type)')
          .eq('user_id', user.id)
          .limit(10),
        supabase
          .from('navigation_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(10),
        supabase
          .from('navigation_sessions')
          .select('distance_driven_meters, completed')
          .eq('user_id', user.id),
      ]);

      setSavedRoutes((routesRes.data || []).map((s: any) => s.routes).filter(Boolean));
      setSavedEvents((eventsRes.data || []).map((s: any) => s.events).filter(Boolean));
      setSavedServices((servicesRes.data || []).map((s: any) => s.services).filter(Boolean));
      setRecentDrives(sessionsRes.data || []);

      if (allSessionsRes.data) {
        const completed = allSessionsRes.data.filter((s) => s.completed);
        const totalMeters = allSessionsRes.data.reduce(
          (sum, s) => sum + (s.distance_driven_meters || 0),
          0
        );
        const totalMiles = Math.round(totalMeters / 1609);
        const avgMiles = completed.length > 0 ? Math.round(totalMiles / completed.length) : 0;
        setStats({
          totalDrives: completed.length,
          totalMiles,
          avgMiles,
        });
      }

      setLoading(false);
    };
    load();
  }, [user?.id]);

  // ── Helpers ──

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    if (diffH < 48) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMiles = (meters: number) => {
    const mi = meters / 1609;
    return mi < 1 ? '<1 mi' : `${Math.round(mi)} mi`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const clearHistory = async () => {
    if (!user?.id) return;
    await supabase.from('navigation_sessions').delete().eq('user_id', user.id);
    setRecentDrives([]);
    setStats({ totalDrives: 0, totalMiles: 0, avgMiles: 0 });
    toast.success('Drive history cleared');
  };

  // ── Render ──

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 96 }}>
      {/* 1. Active Navigation Banner */}
      {isNavigating && destination && (
        <button
          onClick={() => navigate('/navigation')}
          style={{
            width: '100%',
            background: '#CC2B2B',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left' as const,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Navigation size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Navigating to {destination.title}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
              Tap to resume
            </div>
          </div>
          <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
        </button>
      )}

      {/* 2. Search Bar */}
      <div style={{ padding: '16px 16px 0', position: 'relative' as const }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#F5F5F5',
            borderRadius: 12,
            padding: '12px 16px',
          }}
        >
          <Search size={20} color="#999" />
          <input
            type="text"
            placeholder="Where to?"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 16,
              fontWeight: 500,
              color: '#111',
              outline: 'none',
            }}
          />
        </div>

        {/* 3. Search Results Dropdown */}
        {searchFocused && searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute' as const,
              top: 64,
              left: 16,
              right: 16,
              background: '#FFFFFF',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            {searchResults.map((result) => (
              <button
                key={result.id}
                onMouseDown={() => selectResult(result)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #F5F5F5',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={16} color="#CC2B2B" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#111',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {result.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: '#999',
                      marginTop: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {result.address}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Location Sharing Toggle */}
      <div style={{ padding: '12px 16px' }}>
        <button
          onClick={toggleSharing}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            background: '#F9F9F9',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left' as const,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: sharingEnabled ? '#22C55E' : '#CCC',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>
              {sharingEnabled ? 'Sharing with friends' : 'Location hidden'}
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 26,
              borderRadius: 13,
              background: sharingEnabled ? '#22C55E' : '#DDD',
              position: 'relative' as const,
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute' as const,
                top: 2,
                left: sharingEnabled ? 20 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        </button>
      </div>

      {/* 5. Friends Driving */}
      {friendLocations.length > 0 && (
        <div style={{ padding: '0 0 16px' }}>
          <div style={{ padding: '0 16px 12px' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>
              <Users size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Friends Driving
            </h3>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              overflowX: 'auto' as const,
              paddingLeft: 16,
              paddingRight: 16,
              scrollbarWidth: 'none' as const,
            }}
          >
            {friendLocations.map((friend) => (
              <div
                key={friend.user_id}
                style={{
                  minWidth: 160,
                  background: '#fff',
                  border: '1px solid #F0F0F0',
                  borderRadius: 12,
                  padding: 12,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {friend.avatar_url ? (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundImage: `url(${friend.avatar_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: '#F5F5F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#999',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(friend.display_name || 'U')}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#111',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {friend.display_name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#999',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {friend.is_navigating && friend.destination_title
                        ? friend.destination_title
                        : 'Sharing location'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate('/navigation', {
                      state: {
                        destLat: friend.lat,
                        destLng: friend.lng,
                        destTitle: friend.display_name,
                      },
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 0',
                    background: '#CC2B2B',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Go
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Saved Locations (tabbed) */}
      <div style={{ padding: '0 16px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>
            Saved Locations
          </h3>
          <button
            onClick={() => navigate('/add/route')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#CC2B2B',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Add route
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          {(['routes', 'events', 'services'] as SavedTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setSavedTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 0',
                fontSize: 14,
                fontWeight: 600,
                color: savedTab === tab ? '#CC2B2B' : '#999',
                borderBottom: savedTab === tab ? '2px solid #CC2B2B' : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize' as const,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          [1, 2].map((i) => (
            <div
              key={i}
              style={{ height: 64, borderRadius: 12, background: '#F9F9F9', marginBottom: 8 }}
            />
          ))
        ) : savedTab === 'routes' ? (
          savedRoutes.length === 0 ? (
            <EmptyState icon={<Route size={32} color="#DDD" />} text="No saved routes yet" sub="Save routes from the map to find them here" />
          ) : (
            savedRoutes.map((route) => (
              <button
                key={route.id}
                onClick={() =>
                  navigate('/route-map', {
                    state: {
                      routeId: route.id,
                      geometry: route.geometry,
                      routeName: route.name,
                      distance: route.distance_meters
                        ? `${(route.distance_meters / 1000).toFixed(1)} km`
                        : null,
                      duration: route.duration_minutes,
                      difficulty: route.difficulty,
                    },
                  })
                }
                style={rowStyle}
              >
                <div style={iconBoxStyle}>
                  <Route size={20} color="#CC2B2B" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={rowTitleStyle}>{route.name || 'Untitled Route'}</div>
                  <div style={rowMetaStyle}>
                    {route.distance_meters && (
                      <span>{(route.distance_meters / 1609).toFixed(1)} mi</span>
                    )}
                    {route.duration_minutes && <span>· ~{route.duration_minutes} min</span>}
                    {route.difficulty && <span>· {route.difficulty}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (route.lat && route.lng) {
                      navigate('/navigation', {
                        state: {
                          destLat: route.lat,
                          destLng: route.lng,
                          destTitle: route.name,
                          geometry: route.geometry,
                        },
                      });
                    }
                  }}
                  style={navBtnStyle}
                >
                  <Navigation size={16} color="#fff" />
                </button>
              </button>
            ))
          )
        ) : savedTab === 'events' ? (
          savedEvents.length === 0 ? (
            <EmptyState icon={<Calendar size={32} color="#DDD" />} text="No saved events" sub="Save events to navigate to them" />
          ) : (
            savedEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => navigate(`/event/${evt.id}`)}
                style={rowStyle}
              >
                <div style={iconBoxStyle}>
                  <Calendar size={20} color="#CC2B2B" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={rowTitleStyle}>{evt.title || 'Untitled Event'}</div>
                  <div style={rowMetaStyle}>
                    {evt.date_start && <span>{formatEventDate(evt.date_start)}</span>}
                    {evt.location && <span>· {evt.location}</span>}
                  </div>
                </div>
                {evt.lat && evt.lng && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/navigation', {
                        state: { destLat: evt.lat, destLng: evt.lng, destTitle: evt.title },
                      });
                    }}
                    style={navBtnStyle}
                  >
                    <Navigation size={16} color="#fff" />
                  </button>
                )}
              </button>
            ))
          )
        ) : savedServices.length === 0 ? (
          <EmptyState icon={<Wrench size={32} color="#DDD" />} text="No saved services" sub="Save services to navigate to them" />
        ) : (
          savedServices.map((svc) => (
            <button
              key={svc.id}
              onClick={() => navigate(`/service/${svc.id}`)}
              style={rowStyle}
            >
              <div style={iconBoxStyle}>
                <Wrench size={20} color="#CC2B2B" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={rowTitleStyle}>{svc.name || 'Untitled Service'}</div>
                <div style={rowMetaStyle}>
                  {svc.service_type && <span>{svc.service_type}</span>}
                  {svc.address && <span>· {svc.address}</span>}
                </div>
              </div>
              {svc.lat && svc.lng && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/navigation', {
                      state: { destLat: svc.lat, destLng: svc.lng, destTitle: svc.name },
                    });
                  }}
                  style={navBtnStyle}
                >
                  <Navigation size={16} color="#fff" />
                </button>
              )}
            </button>
          ))
        )}
      </div>

      {/* 7. Drive Stats */}
      {!loading && (stats.totalDrives > 0 || stats.totalMiles > 0) && (
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
          <StatCard value={stats.totalDrives} label="Drives" />
          <StatCard value={stats.totalMiles.toLocaleString()} label="Miles driven" />
          <StatCard value={stats.avgMiles > 0 ? `${stats.avgMiles}` : '-'} label="Avg drive" />
        </div>
      )}

      {/* 8. Recent Drives */}
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>
            Recent Drives
          </h3>
          {recentDrives.length > 0 && (
            <button
              onClick={clearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Clear history
            </button>
          )}
        </div>

        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              style={{ height: 60, borderRadius: 12, background: '#F9F9F9', marginBottom: 8 }}
            />
          ))
        ) : recentDrives.length === 0 ? (
          <EmptyState icon={<Clock size={32} color="#DDD" />} text="No drives yet" sub="Your navigation history will appear here" />
        ) : (
          recentDrives.map((drive) => (
            <button
              key={drive.id}
              onClick={() => {
                if (drive.dest_lat && drive.dest_lng) {
                  navigate('/navigation', {
                    state: {
                      destLat: drive.dest_lat,
                      destLng: drive.dest_lng,
                      destTitle: drive.destination_title,
                    },
                  });
                }
              }}
              style={rowStyle}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MapPin size={18} color={drive.completed ? '#22C55E' : '#999'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={rowTitleStyle}>
                  {drive.destination_title || 'Unknown destination'}
                </div>
                <div style={rowMetaStyle}>
                  <span>{formatDate(drive.started_at)}</span>
                  {drive.distance_driven_meters > 0 && (
                    <span>· {formatMiles(drive.distance_driven_meters)}</span>
                  )}
                  {drive.completed && <span style={{ color: '#22C55E' }}>· Completed</span>}
                </div>
              </div>
              <ChevronRight size={16} color="#DDD" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ── Shared styles ──

const rowStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '14px 0',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid #F5F5F5',
  cursor: 'pointer',
  textAlign: 'left',
};

const iconBoxStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: '#F5F5F5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const rowTitleStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#111',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const rowMetaStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#999',
  marginTop: 2,
  display: 'flex',
  gap: 8,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const navBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  background: '#CC2B2B',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

// ── Sub-components ──

function EmptyState({
  icon,
  text,
  sub,
}: {
  icon: React.ReactNode;
  text: string;
  sub: string;
}) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#999' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{text}</p>
      <p style={{ margin: '4px 0 0', fontSize: 13 }}>{sub}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: '#F9F9F9',
        borderRadius: 12,
        padding: '14px 16px',
        textAlign: 'center' as const,
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{label}</div>
    </div>
  );
}
