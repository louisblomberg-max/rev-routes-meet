import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Route, MapPin, Clock, ChevronRight, Search, X, Users } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { toast } from 'sonner';
import MapView from '@/components/MapView';
import revnetLogo from '@/assets/revnet-logo-clean.png';

interface SearchHit {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export default function DriveTab() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { status: navStatus, destination } = useNavigation();
  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing';

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const friendMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});

  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [recentDrives, setRecentDrives] = useState<any[]>([]);
  const [friendLocations, setFriendLocations] = useState<any[]>([]);
  const [stats, setStats] = useState({ drives: 0, miles: 0 });
  const [loading, setLoading] = useState(true);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [tappedLocation, setTappedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Address-search overlay
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const isUKPostcode = (q: string) => /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i.test(q.trim());

  const searchPlaces = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?` +
        `access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=gb&language=en&limit=8` +
        `&types=address,poi,place,locality,postcode&autocomplete=true`,
      );
      const data = await res.json();
      setSearchResults((data.features || []).map((f: any) => ({
        id: f.id, name: f.text, address: f.place_name, lat: f.center[1], lng: f.center[0],
      })));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    if (isUKPostcode(val)) searchPlaces(val);
    else searchTimer.current = setTimeout(() => searchPlaces(val), 300);
  };

  const handleSearchSelect = (r: SearchHit) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    nav('/navigation', { state: { destLat: r.lat, destLng: r.lng, destTitle: r.name } });
  };

  // Map tap → reverse geocode → popup
  const handleMapTap = async (lngLat: { lng: number; lat: number }) => {
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=1&types=address,poi,place`);
      const data = await res.json();
      const name = data.features?.[0]?.text || `${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`;
      setTappedLocation({ lat: lngLat.lat, lng: lngLat.lng, name });
    } catch {
      setTappedLocation({ lat: lngLat.lat, lng: lngLat.lng, name: `${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}` });
    }
  };

  // Load data
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      supabase.from('saved_routes').select('route_id, routes(*)').eq('user_id', user.id).order('saved_at', { ascending: false }).limit(20),
      supabase.from('navigation_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(10),
      supabase.from('navigation_sessions').select('distance_driven_meters, completed').eq('user_id', user.id),
    ]).then(([r, d, st]) => {
      setSavedRoutes((r.data || []).map((x: any) => x.routes).filter(Boolean));
      setRecentDrives(d.data || []);
      if (st.data) {
        const m = st.data.reduce((a, b) => a + (b.distance_driven_meters || 0), 0);
        setStats({ drives: st.data.filter(x => x.completed).length, miles: Math.round(m / 1609) });
      }
      setLoading(false);
    });
  }, [user?.id]);

  // Friends
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const { data, error } = await supabase.rpc('get_friend_locations', { p_user_id: user.id });
        if (error) return;
        setFriendLocations(data || []);
      } catch { /* ignore */ }
    };
    load();
    const i = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 15000);
    return () => clearInterval(i);
  }, [user?.id]);

  // Sharing status
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('live_location_sessions').select('is_active').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => setSharingEnabled(data?.is_active || false));
  }, [user?.id]);

  const toggleSharing = async () => {
    if (!user?.id) return;
    if (sharingEnabled) {
      try {
        await supabase.from('live_location_sessions').update({ is_active: false, ended_at: new Date().toISOString() }).eq('user_id', user.id);
        setSharingEnabled(false); toast.success('Location sharing stopped');
      } catch { toast.error('Failed to stop sharing'); }
    } else {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { error } = await supabase.from('live_location_sessions').upsert({
              user_id: user.id, is_active: true, started_at: new Date().toISOString(),
              last_lat: Number(pos.coords.latitude.toFixed(6)),
              last_lng: Number(pos.coords.longitude.toFixed(6)),
              accuracy: pos.coords.accuracy || null,
              session_type: 'sharing', shared_with: [],
              last_updated: new Date().toISOString(),
            });
            if (error) throw error;
            setSharingEnabled(true); toast.success('Sharing location with friends');
          } catch { toast.error('Failed to share location'); }
        },
        () => toast.error('Location access denied'),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    }
  };

  // Friend markers
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !m.loaded()) return;
    Object.keys(friendMarkersRef.current).forEach(uid => {
      if (!friendLocations.find(f => f.user_id === uid)) { friendMarkersRef.current[uid].remove(); delete friendMarkersRef.current[uid]; }
    });
    friendLocations.forEach(f => {
      if (!f.lat || !f.lng) return;
      if (friendMarkersRef.current[f.user_id]) { friendMarkersRef.current[f.user_id].setLngLat([f.lng, f.lat]); return; }
      const el = document.createElement('div');
      el.style.cssText = 'width:32px;height:32px;border-radius:50%;border:2.5px solid #22C55E;overflow:hidden;background:#052e16;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);cursor:pointer;';
      if (f.avatar_url) { const img = document.createElement('img'); img.src = f.avatar_url; img.style.cssText = 'width:100%;height:100%;object-fit:cover;'; el.appendChild(img); }
      else { const t = document.createElement('span'); t.textContent = (f.display_name || '?')[0].toUpperCase(); t.style.cssText = 'color:#22C55E;font-size:12px;font-weight:800;'; el.appendChild(t); }
      el.addEventListener('click', () => nav('/navigation', { state: { destLat: f.lat, destLng: f.lng, destTitle: f.display_name } }));
      friendMarkersRef.current[f.user_id] = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([f.lng, f.lat]).addTo(m);
    });
  }, [friendLocations, nav]);

  const formatDate = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    if (h < 48) return 'Yesterday';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const startNav = (lat: number, lng: number, title: string) => {
    nav('/navigation', { state: { destLat: lat, destLng: lng, destTitle: title } });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <MapView onMapTap={handleMapTap} onMapReady={m => { mapRef.current = m; }} />

      {/* Active nav banner */}
      {isNavigating && destination && (
        <button onClick={() => nav('/navigation')} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40, background: '#CC2B2B', padding: '12px 16px', paddingTop: 'max(env(safe-area-inset-top), 12px)', display: 'flex', alignItems: 'center', gap: 12, border: 'none', cursor: 'pointer' }}>
          <Navigation size={20} color="#fff" />
          <div style={{ flex: 1, textAlign: 'left' as const }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Navigating to {destination.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Tap to resume</div>
          </div>
          <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
        </button>
      )}

      {/* Header — logo only */}
      {!isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
          <div className="pointer-events-auto safe-top" style={{ backgroundColor: '#FFFFFF', borderBottom: '2px solid #E5E5E5' }}>
            <div className="px-4 pt-2 pb-2 text-center">
              <img src={revnetLogo} alt="RevNet" style={{ height: 28, width: 'auto', display: 'inline-block' }} />
            </div>
          </div>
        </div>
      )}

      {/* Tap-to-navigate popup */}
      {tappedLocation && !isNavigating && !searchOpen && (
        <div style={{
          position: 'absolute',
          bottom: 'max(420px, calc(env(safe-area-inset-bottom) + 408px))',
          left: 16, right: 16, zIndex: 25,
          background: '#FFF', borderRadius: 12, padding: '14px 16px',
          border: '2px solid #E5E5E5',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <MapPin size={20} color="#CC2B2B" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{tappedLocation.name}</div>
          </div>
          <button onClick={() => { startNav(tappedLocation.lat, tappedLocation.lng, tappedLocation.name); setTappedLocation(null); }} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, minHeight: 40 }}>Navigate</button>
          <button onClick={() => setTappedLocation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#999" /></button>
        </div>
      )}

      {/* Bottom panel */}
      {!isNavigating && (
        <div style={{
          position: 'absolute',
          left: 0, right: 0,
          bottom: 'max(76px, calc(env(safe-area-inset-bottom) + 64px))',
          height: 400,
          zIndex: 20,
          background: '#FFFFFF',
          borderTop: '2px solid #E5E5E5',
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E5E5' }} />
          </div>

          {/* Sharing toggle */}
          <button onClick={toggleSharing} style={{
            margin: '4px 16px 12px',
            background: '#FFFFFF', border: '2px solid #E5E5E5', borderRadius: 12,
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: sharingEnabled ? '#22C55E' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={16} color={sharingEnabled ? '#fff' : '#999'} />
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' as const }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Location sharing</div>
              <div style={{ fontSize: 12, color: '#999' }}>{sharingEnabled ? 'Friends can see you driving' : 'Off — friends can\'t see your location'}</div>
            </div>
            <div style={{
              width: 44, height: 26, borderRadius: 13,
              background: sharingEnabled ? '#22C55E' : '#E5E5E5',
              position: 'relative', flexShrink: 0, transition: 'background 0.2s',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11, background: '#fff',
                position: 'absolute', top: 2, left: sharingEnabled ? 20 : 2,
                transition: 'left 0.2s',
              }} />
            </div>
          </button>

          {/* Navigate to address */}
          <button onClick={() => setSearchOpen(true)} style={{
            margin: '0 16px 12px',
            background: '#CC2B2B', border: 'none', borderRadius: 12,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer',
          }}>
            <Search size={18} color="#fff" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Navigate to address</span>
          </button>

          {/* Scrollable lower content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px' }}>
            {/* Recent drives */}
            {recentDrives.length > 0 && (
              <section style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 0.5, padding: '0 0 8px' }}>Recent</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recentDrives.slice(0, 3).map(d => (
                    <button
                      key={d.id}
                      onClick={() => { if (d.dest_lat && d.dest_lng) startNav(d.dest_lat, d.dest_lng, d.destination_title || 'Destination'); }}
                      disabled={!d.dest_lat || !d.dest_lng}
                      style={{
                        background: '#FFFFFF', border: '2px solid #E5E5E5', borderRadius: 10,
                        padding: '10px 12px',
                        display: 'flex', alignItems: 'center', gap: 10,
                        cursor: d.dest_lat ? 'pointer' : 'default',
                        opacity: d.dest_lat ? 1 : 0.5,
                        textAlign: 'left' as const,
                      }}>
                      <Clock size={14} color="#999" style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.destination_title || 'Unknown destination'}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>{formatDate(d.started_at)}</div>
                      </div>
                      {d.dest_lat && d.dest_lng && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#CC2B2B' }}>Drive again</div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Saved routes */}
            <section style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 0 8px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Saved Routes</div>
                {stats.drives > 0 && <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>{stats.drives} drives · {stats.miles.toLocaleString()} mi</div>}
              </div>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1, 2, 3].map(i => <div key={i} style={{ height: 56, borderRadius: 10, background: '#F5F5F5' }} />)}
                </div>
              ) : savedRoutes.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '20px 12px',
                  background: '#FAFAFA', borderRadius: 10, border: '1px dashed #E5E5E5',
                  fontSize: 13, color: '#999',
                }}>
                  No saved routes yet. Save routes from Explore.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {savedRoutes.map((r: any) => (
                    <div key={r.id} style={{
                      background: '#FFFFFF', border: '2px solid #E5E5E5', borderRadius: 10,
                      padding: '10px 12px',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Route size={14} color="#4f7fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: '#999' }}>
                          {r.distance_meters ? `${(r.distance_meters / 1609).toFixed(1)} mi` : 'Distance unknown'}
                          {r.difficulty ? ` · ${r.difficulty}` : ''}
                        </div>
                      </div>
                      {r.lat && r.lng && (
                        <button
                          onClick={() => startNav(r.lat, r.lng, r.name)}
                          style={{
                            background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '8px 14px', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer', flexShrink: 0,
                            display: 'flex', alignItems: 'center', gap: 6,
                          }}>
                          <Navigation size={13} color="#fff" />
                          Start
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Friends driving */}
            {friendLocations.length > 0 && (
              <section style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 0.5, padding: '0 0 8px' }}>Friends driving</div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {friendLocations.map(f => (
                    <button key={f.user_id}
                      onClick={() => mapRef.current?.flyTo({ center: [f.lng, f.lat], zoom: 14, duration: 1000 })}
                      style={{
                        flexShrink: 0,
                        background: '#FFFFFF', border: '2px solid #E5E5E5', borderRadius: 10,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, minWidth: 140,
                      }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22C55E', flexShrink: 0, backgroundImage: f.avatar_url ? `url(${f.avatar_url})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                        {!f.avatar_url && (f.display_name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ textAlign: 'left' as const, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{f.display_name || f.username}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>{f.destination_title ? `→ ${f.destination_title}` : 'Sharing'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* Address-search overlay */}
      {searchOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
          <div className="safe-top" style={{ borderBottom: '2px solid #E5E5E5', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={20} color="#111" />
            </button>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                placeholder="Address, postcode or place"
                className="h-10 bg-[#FFFFFF] rounded-xl px-3 border-2 border-[#E5E5E5] text-sm font-medium w-full outline-none"
                style={{ paddingLeft: 36, color: '#111' }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ position: 'absolute', right: 10, top: 10, background: '#EEE', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={12} color="#999" />
                </button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {searching && searchResults.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center' as const, color: '#999', fontSize: 14 }}>Searching…</div>
            )}
            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center' as const, color: '#999', fontSize: 14 }}>No results for &ldquo;{searchQuery}&rdquo;</div>
            )}
            {searchResults.map(r => (
              <button key={r.id} onClick={() => handleSearchSelect(r)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', background: 'none', border: 'none',
                borderBottom: '1px solid #F0F0F0', cursor: 'pointer', textAlign: 'left' as const,
              }}>
                <MapPin size={18} color="#CC2B2B" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.address}</div>
                </div>
                <Navigation size={16} color="#CC2B2B" style={{ flexShrink: 0 }} />
              </button>
            ))}
            {searchQuery.length < 2 && (
              <div style={{ padding: '24px 16px', color: '#999', fontSize: 13, textAlign: 'center' as const }}>
                Type an address, postcode, or place name
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
