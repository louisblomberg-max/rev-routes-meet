import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Route, Plus, MapPin, Clock, ChevronRight, Search, Compass } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';

export default function DriveTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status: navStatus, destination } = useNavigation();

  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [recentDrives, setRecentDrives] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDrives: 0, totalMiles: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing';

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      setLoading(true);

      // Saved routes
      const { data: saved } = await supabase
        .from('saved_routes')
        .select('route_id, routes(*)')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })
        .limit(10);
      setSavedRoutes((saved || []).map((s: any) => s.routes).filter(Boolean));

      // Recent drives
      const { data: sessions } = await supabase
        .from('navigation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);
      setRecentDrives(sessions || []);

      // Stats
      const { data: allSessions } = await supabase
        .from('navigation_sessions')
        .select('distance_driven_meters, completed')
        .eq('user_id', user.id);
      if (allSessions) {
        const totalMeters = allSessions.reduce((sum, s) => sum + (s.distance_driven_meters || 0), 0);
        setStats({
          totalDrives: allSessions.filter(s => s.completed).length,
          totalMiles: Math.round(totalMeters / 1609),
        });
      }

      setLoading(false);
    };
    load();
  }, [user?.id]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    if (diffH < 48) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatMiles = (meters: number) => {
    const mi = meters / 1609;
    return mi < 1 ? '<1 mi' : `${Math.round(mi)} mi`;
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', paddingBottom: 96 }}>
      {/* Active navigation banner */}
      {isNavigating && destination && (
        <button
          onClick={() => navigate('/navigation')}
          style={{
            width: '100%', background: '#CC2B2B', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
            border: 'none', cursor: 'pointer', textAlign: 'left' as const,
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Navigation size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Navigating to {destination.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Tap to resume</div>
          </div>
          <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
        </button>
      )}

      {/* Quick actions */}
      <div style={{ padding: '20px 16px 12px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              // Navigate with a search prompt
              const dest = prompt('Where do you want to go?');
              if (dest) navigate('/navigation', { state: { destTitle: dest, destLat: null, destLng: null } });
            }}
            style={{
              flex: 1, background: '#CC2B2B', border: 'none', borderRadius: 14,
              padding: '16px', cursor: 'pointer', textAlign: 'left' as const,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <Compass size={22} color="#fff" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Navigate</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Get directions</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/add/route')}
            style={{
              flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 14,
              padding: '16px', cursor: 'pointer', textAlign: 'left' as const,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <Plus size={22} color="#111" />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Create Route</div>
              <div style={{ fontSize: 12, color: '#999' }}>Draw or GPX</div>
            </div>
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && (stats.totalDrives > 0 || stats.totalMiles > 0) && (
        <div style={{ padding: '0 16px 16px', display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, background: '#F9F9F9', borderRadius: 12, padding: '14px 16px',
            textAlign: 'center' as const,
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>{stats.totalDrives}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Drives</div>
          </div>
          <div style={{
            flex: 1, background: '#F9F9F9', borderRadius: 12, padding: '14px 16px',
            textAlign: 'center' as const,
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>{stats.totalMiles.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Miles driven</div>
          </div>
        </div>
      )}

      {/* Saved Routes */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>Saved Routes</h3>
          {savedRoutes.length > 0 && (
            <button onClick={() => navigate('/my-routes')} style={{ background: 'none', border: 'none', color: '#CC2B2B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              View all
            </button>
          )}
        </div>

        {loading ? (
          [1, 2].map(i => <div key={i} style={{ height: 64, borderRadius: 12, background: '#F9F9F9', marginBottom: 8 }} />)
        ) : savedRoutes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#999' }}>
            <Route size={32} color="#DDD" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No saved routes yet</p>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>Save routes from the map to find them here</p>
          </div>
        ) : (
          savedRoutes.map(route => (
            <button
              key={route.id}
              onClick={() => navigate('/route-map', { state: { routeId: route.id, geometry: route.geometry, routeName: route.name, distance: route.distance_meters ? `${(route.distance_meters / 1000).toFixed(1)} km` : null, duration: route.duration_minutes, difficulty: route.difficulty } })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0', background: 'none', border: 'none',
                borderBottom: '1px solid #F5F5F5', cursor: 'pointer', textAlign: 'left' as const,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Route size={20} color="#CC2B2B" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{route.name || 'Untitled Route'}</div>
                <div style={{ fontSize: 13, color: '#999', marginTop: 2, display: 'flex', gap: 8 }}>
                  {route.distance_meters && <span>{(route.distance_meters / 1609).toFixed(1)} mi</span>}
                  {route.duration_minutes && <span>· ~{route.duration_minutes} min</span>}
                  {route.difficulty && <span>· {route.difficulty}</span>}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (route.lat && route.lng) {
                    navigate('/navigation', { state: { destLat: route.lat, destLng: route.lng, destTitle: route.name, geometry: route.geometry } });
                  }
                }}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#CC2B2B',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <Navigation size={16} color="#fff" />
              </button>
            </button>
          ))
        )}
      </div>

      {/* Recent Drives */}
      <div style={{ padding: '20px 16px 0' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#111' }}>Recent Drives</h3>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} style={{ height: 60, borderRadius: 12, background: '#F9F9F9', marginBottom: 8 }} />)
        ) : recentDrives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#999' }}>
            <Clock size={32} color="#DDD" style={{ display: 'block', margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>No drives yet</p>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>Your navigation history will appear here</p>
          </div>
        ) : (
          recentDrives.map(drive => (
            <button
              key={drive.id}
              onClick={() => {
                if (drive.dest_lat && drive.dest_lng) {
                  navigate('/navigation', { state: { destLat: drive.dest_lat, destLng: drive.dest_lng, destTitle: drive.destination_title } });
                }
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 0', background: 'none', border: 'none',
                borderBottom: '1px solid #F5F5F5', cursor: 'pointer', textAlign: 'left' as const,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MapPin size={18} color={drive.completed ? '#22C55E' : '#999'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                  {drive.destination_title || 'Unknown destination'}
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2, display: 'flex', gap: 8 }}>
                  <span>{formatDate(drive.started_at)}</span>
                  {drive.distance_driven_meters > 0 && <span>· {formatMiles(drive.distance_driven_meters)}</span>}
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
