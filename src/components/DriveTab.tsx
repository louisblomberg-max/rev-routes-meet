import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Route, MapPin, Clock, ChevronRight, Search, Calendar, Wrench, ChevronUp, ChevronDown, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { toast } from 'sonner';
import MapView from '@/components/MapView';
import revnetLogo from '@/assets/revnet-logo-clean.png';

type SavedTab = 'routes' | 'events' | 'services';

export default function DriveTab() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { status: navStatus, destination } = useNavigation();
  const isNavigating = navStatus === 'navigating' || navStatus === 'previewing';

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const friendMarkersRef = useRef<Record<string, mapboxgl.Marker>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [savedServices, setSavedServices] = useState<any[]>([]);
  const [recentDrives, setRecentDrives] = useState<any[]>([]);
  const [friendLocations, setFriendLocations] = useState<any[]>([]);
  const [stats, setStats] = useState({ drives: 0, miles: 0 });
  const [loading, setLoading] = useState(true);
  const [savedTab, setSavedTab] = useState<SavedTab>('routes');
  const [panelOpen, setPanelOpen] = useState(false);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [tappedLocation, setTappedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Search — UK-optimised with postcode support
  const isUKPostcode = (q: string) => /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i.test(q.trim());

  const searchPlaces = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?` +
        `access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=gb&language=en&limit=5` +
        `&types=address,poi,place,locality,postcode&autocomplete=true`
      );
      const data = await res.json();
      setSearchResults((data.features || []).map((f: any) => ({ id: f.id, name: f.text, address: f.place_name, lat: f.center[1], lng: f.center[0] })));
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  }, []);

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    // Immediate search for postcodes, debounced for everything else
    if (isUKPostcode(val)) {
      searchPlaces(val);
    } else {
      searchTimer.current = setTimeout(() => searchPlaces(val), 300);
    }
  };

  const handleSelectResult = (r: any) => {
    setSearchQuery(''); setSearchResults([]); setSearchFocused(false);
    mapRef.current?.flyTo({ center: [r.lng, r.lat], zoom: 14, duration: 1200 });
    setTappedLocation({ lat: r.lat, lng: r.lng, name: r.name });
  };

  // Map tap → reverse geocode
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

  // Data
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      supabase.from('saved_routes').select('route_id, routes(*)').eq('user_id', user.id).order('saved_at', { ascending: false }).limit(20),
      supabase.from('saved_events').select('event_id, events(id, title, lat, lng, date_start, location)').eq('user_id', user.id).limit(20),
      supabase.from('saved_services').select('service_id, services(id, name, lat, lng, address, service_type)').eq('user_id', user.id).limit(20),
      supabase.from('navigation_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(10),
      supabase.from('navigation_sessions').select('distance_driven_meters, completed').eq('user_id', user.id),
    ]).then(([r, e, s, d, st]) => {
      setSavedRoutes((r.data || []).map((x: any) => x.routes).filter(Boolean));
      setSavedEvents((e.data || []).map((x: any) => x.events).filter(Boolean));
      setSavedServices((s.data || []).map((x: any) => x.services).filter(Boolean));
      setRecentDrives(d.data || []);
      if (st.data) {
        const m = st.data.reduce((a, b) => a + (b.distance_driven_meters || 0), 0);
        setStats({ drives: st.data.filter(x => x.completed).length, miles: Math.round(m / 1609) });
      }
      setLoading(false);
    });
  }, [user?.id]);

  // Friends (poll 15s, only when tab visible)
  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        const { data, error } = await supabase.rpc('get_friend_locations', { p_user_id: user.id });
        if (error) { console.error('Friend locations error:', error); return; }
        setFriendLocations(data || []);
      } catch (err) { console.error('Failed to fetch friend locations:', err); }
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

  // Friend markers (only pins on the Drive map)
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

  const formatDate = (d: string) => { const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000); if (h < 1) return 'Now'; if (h < 24) return `${h}h`; if (h < 48) return 'Yesterday'; return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };

  const items = savedTab === 'routes' ? savedRoutes : savedTab === 'events' ? savedEvents : savedServices;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <MapView onMapTap={handleMapTap} onMapReady={m => { mapRef.current = m; }} />

      {/* Active nav banner */}
      {isNavigating && destination && (
        <button onClick={() => nav('/navigation')} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 40, background: '#CC2B2B', padding: '12px 16px', paddingTop: 'max(env(safe-area-inset-top), 12px)', display: 'flex', alignItems: 'center', gap: 12, border: 'none', cursor: 'pointer' }}>
          <Navigation size={20} color="#fff" />
          <div style={{ flex: 1, textAlign: 'left' as const }}><div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Navigating to {destination.title}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Tap to resume</div></div>
          <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
        </button>
      )}

      {/* Header — matches Explore page */}
      {!isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
          <div className="pointer-events-auto safe-top" style={{ backgroundColor: '#FFFFFF', borderBottom: '2px solid #E5E5E5' }}>
            <div className="px-4 pt-2 pb-2 text-center">
              <img src={revnetLogo} alt="RevNet" style={{ height: 28, width: 'auto', display: 'inline-block' }} />
            </div>
            <div className="px-4 pb-3">
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#999" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
                <input
                  value={searchQuery}
                  onChange={e => handleSearchInput(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Where to?"
                  className="h-10 bg-[#FFFFFF] rounded-xl px-3 border-2 border-[#E5E5E5] text-sm font-medium w-full outline-none"
                  style={{ paddingLeft: 36, color: '#111' }}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchFocused(false); }} style={{ position: 'absolute', right: 10, top: 10, background: '#EEE', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={12} color="#999" />
                  </button>
                )}
              </div>
            </div>
            {/* Search results dropdown */}
            {searchResults.length > 0 && searchFocused && (
              <div style={{ margin: '0 16px 12px', background: '#FFF', borderRadius: 12, border: '2px solid #E5E5E5', overflow: 'hidden' }}>
                {searchResults.map(r => (
                  <button key={r.id} onClick={() => handleSelectResult(r)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'none', border: 'none', borderBottom: '1px solid #F5F5F5', cursor: 'pointer', textAlign: 'left' as const }}>
                    <MapPin size={16} color="#CC2B2B" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{r.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tap popup */}
      {tappedLocation && !searchFocused && (
        <div style={{ position: 'absolute', bottom: panelOpen ? 'calc(50% + 80px)' : 'max(210px, calc(env(safe-area-inset-bottom) + 200px))', left: 16, right: 16, zIndex: 25, background: '#FFF', borderRadius: 16, padding: '14px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <MapPin size={20} color="#CC2B2B" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{tappedLocation.name}</div></div>
          <button onClick={() => { nav('/navigation', { state: { destLat: tappedLocation.lat, destLng: tappedLocation.lng, destTitle: tappedLocation.name } }); setTappedLocation(null); }} style={{ background: '#CC2B2B', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', flexShrink: 0, minHeight: 44 }}>Navigate</button>
          <button onClick={() => setTappedLocation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} color="#999" /></button>
        </div>
      )}

      {/* Bottom panel */}
      <div style={{ position: 'absolute', bottom: 'max(76px, calc(env(safe-area-inset-bottom) + 64px))', left: 0, right: 0, zIndex: 20, background: '#FFF', borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', maxHeight: panelOpen ? '50vh' : 120, transition: 'max-height 0.3s ease', overflow: 'hidden' }}>
        <button onClick={() => setPanelOpen(!panelOpen)} style={{ width: '100%', background: 'none', border: 'none', padding: '10px 0 6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#DDD' }} />
        </button>

        {/* Header row */}
        <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={toggleSharing} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: sharingEnabled ? '#22C55E' : '#DDD' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: sharingEnabled ? '#22C55E' : '#999' }}>{sharingEnabled ? 'Sharing location' : 'Location hidden'}</span>
          </button>
          {stats.drives > 0 && <div style={{ fontSize: 12, color: '#999', fontWeight: 600 }}>{stats.drives} drives · {stats.miles.toLocaleString()} mi</div>}
        </div>

        {/* Friends */}
        {friendLocations.length > 0 && (
          <div style={{ paddingBottom: 10 }}>
            <div style={{ padding: '0 16px 6px', fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>Friends driving</div>
            <div style={{ display: 'flex', gap: 8, padding: '0 16px', overflowX: 'auto' }}>
              {friendLocations.map(f => (
                <button key={f.user_id} onClick={() => mapRef.current?.flyTo({ center: [f.lng, f.lat], zoom: 14, duration: 1000 })} style={{ flexShrink: 0, background: '#F9F9F9', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22C55E', flexShrink: 0, backgroundImage: f.avatar_url ? `url(${f.avatar_url})` : undefined, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                    {!f.avatar_url && (f.display_name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'left' as const, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{f.display_name || f.username}</div><div style={{ fontSize: 10, color: '#999' }}>{f.destination_title ? `→ ${f.destination_title}` : 'Sharing'}</div></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved tabs */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', marginBottom: 6 }}>
            {(['routes', 'events', 'services'] as SavedTab[]).map(t => (
              <button key={t} onClick={() => setSavedTab(t)} style={{ flex: 1, background: 'none', border: 'none', padding: '8px 0 10px', fontSize: 13, fontWeight: savedTab === t ? 700 : 500, color: savedTab === t ? '#CC2B2B' : '#AAA', borderBottom: savedTab === t ? '2px solid #CC2B2B' : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' as const, marginBottom: -1 }}>{t}</button>
            ))}
          </div>

          <div style={{ maxHeight: panelOpen ? 'calc(50vh - 180px)' : 0, overflowY: 'auto', transition: 'max-height 0.3s ease' }}>
            {loading ? [1, 2].map(i => <div key={i} style={{ height: 48, borderRadius: 8, background: '#F9F9F9', marginBottom: 6 }} />) : items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#AAA', fontSize: 13 }}>No saved {savedTab}</div>
            ) : items.map((item: any) => (
              <button key={item.id} onClick={() => { if (item.lat && item.lng) { mapRef.current?.flyTo({ center: [item.lng, item.lat], zoom: 14, duration: 1000 }); setTappedLocation({ lat: item.lat, lng: item.lng, name: item.name || item.title || 'Location' }); } }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', background: 'none', border: 'none', borderBottom: '1px solid #F7F7F7', cursor: 'pointer', textAlign: 'left' as const }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {savedTab === 'routes' && <Route size={14} color="#4f7fff" />}
                  {savedTab === 'events' && <Calendar size={14} color="#CC2B2B" />}
                  {savedTab === 'services' && <Wrench size={14} color="#22C55E" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.name || item.title}</div><div style={{ fontSize: 11, color: '#999' }}>{savedTab === 'routes' && item.distance_meters ? `${(item.distance_meters / 1609).toFixed(1)} mi` : savedTab === 'events' ? item.location : item.service_type || item.address}</div></div>
                {item.lat && item.lng && <button onClick={e => { e.stopPropagation(); nav('/navigation', { state: { destLat: item.lat, destLng: item.lng, destTitle: item.name || item.title } }); }} style={{ width: 36, height: 36, borderRadius: '50%', background: '#CC2B2B', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Navigation size={13} color="#fff" /></button>}
              </button>
            ))}
            {panelOpen && recentDrives.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 0.5, padding: '14px 0 6px' }}>Recent</div>
                {recentDrives.slice(0, 5).map(d => (
                  <button key={d.id} onClick={() => { if (d.dest_lat && d.dest_lng) nav('/navigation', { state: { destLat: d.dest_lat, destLng: d.dest_lng, destTitle: d.destination_title } }); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', background: 'none', border: 'none', borderBottom: '1px solid #F7F7F7', cursor: 'pointer', textAlign: 'left' as const }}>
                    <Clock size={14} color="#999" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{d.destination_title || 'Unknown'}</div></div>
                    <span style={{ fontSize: 11, color: '#999' }}>{formatDate(d.started_at)}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
