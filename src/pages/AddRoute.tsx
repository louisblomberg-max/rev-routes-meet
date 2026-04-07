import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import { Upload, Pencil, Undo2, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BackButton from '@/components/BackButton';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const ROUTE_TYPES = ['Scenic', 'Coastal', 'Off-Road', 'Twisties', 'Urban', 'Track'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const SURFACES = ['Tarmac', 'Gravel', 'Dirt', 'Mixed'];

const AddRoute = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan } = usePlan();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [routeType, setRouteType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [surface, setSurface] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [method, setMethod] = useState<'draw' | 'gpx' | null>(null);
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationMin, setDurationMin] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  if (currentPlan === 'free') {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Lock className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-1">Pro Driver Required</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">Creating and sharing routes requires a Pro Driver or Club & Business plan.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate('/subscription')} style={{ backgroundColor: '#d30d37' }} className="text-white">Upgrade</Button>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (method !== 'draw' || !mapContainerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-1.5, 52.5],
      zoom: 6,
    });
    mapRef.current = map;
    map.on('click', (e) => {
      setWaypoints(prev => [...prev, [e.lngLat.lng, e.lngLat.lat]]);
    });
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 12, duration: 1000 }),
      () => {}, { timeout: 5000 }
    );
    return () => { map.remove(); mapRef.current = null; };
  }, [method]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (waypoints.length < 2 || !mapRef.current) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    waypoints.forEach((wp, i) => {
      const el = document.createElement('div');
      el.style.cssText = `width:24px;height:24px;border-radius:50%;background:${i === 0 ? '#22c55e' : i === waypoints.length - 1 ? '#ef4444' : '#4f7fff'};border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;`;
      el.textContent = String(i + 1);
      const marker = new mapboxgl.Marker({ element: el }).setLngLat(wp).addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
    const snap = async () => {
      setIsSnapping(true);
      try {
        const coords = waypoints.map(p => p.join(',')).join(';');
        const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`);
        const data = await res.json();
        if (data.routes?.[0]) {
          const route = data.routes[0];
          setRouteGeoJson(route.geometry);
          setDistanceKm(Math.round(route.distance / 100) / 10);
          setDurationMin(Math.round(route.duration / 60));
          const map = mapRef.current!;
          const src = { type: 'Feature' as const, properties: {}, geometry: route.geometry };
          if (map.getSource('route')) {
            (map.getSource('route') as mapboxgl.GeoJSONSource).setData(src);
          } else {
            map.addSource('route', { type: 'geojson', data: src });
            map.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#4f7fff', 'line-width': 4 } });
          }
        }
      } catch { toast.error('Failed to snap route'); }
      setIsSnapping(false);
    };
    snap();
  }, [waypoints]);

  const handleGPXUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const doc = new DOMParser().parseFromString(text, 'text/xml');
      const coords: [number, number][] = [];
      doc.querySelectorAll('trkpt').forEach(pt => {
        const lat = parseFloat(pt.getAttribute('lat') || '0');
        const lng = parseFloat(pt.getAttribute('lon') || '0');
        if (lat && lng) coords.push([lng, lat]);
      });
      if (coords.length < 2) { toast.error('GPX file has too few points'); return; }
      const step = Math.max(1, Math.floor(coords.length / 25));
      setWaypoints(coords.filter((_, i) => i % step === 0));
      setRouteGeoJson({ type: 'LineString', coordinates: coords });
      setDistanceKm(Math.round(coords.length * 0.05 * 10) / 10);
      toast.success(`Loaded ${coords.length} points`);
    } catch { toast.error('Failed to parse GPX file'); }
  };

  const handlePublish = async () => {
    if (!title.trim()) { toast.error('Please enter a route name'); return; }
    if (waypoints.length < 2 && !routeGeoJson) { toast.error('Please create a route first'); return; }
    if (!user?.id) return;
    setIsPublishing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id || user.id;
      const { error } = await supabase.from('routes').insert({
        name: title.trim(),
        description: description.trim() || null,
        type: routeType.toLowerCase() || null,
        difficulty: difficulty.toLowerCase() || null,
        surface_type: surface.toLowerCase() || null,
        visibility,
        geometry: routeGeoJson,
        distance_meters: Math.round(distanceKm * 1000),
        duration_minutes: durationMin,
        lat: waypoints[0]?.[1] || null,
        lng: waypoints[0]?.[0] || null,
        created_by: userId,
        status: 'published',
      });
      if (error) throw error;
      toast.success('Route published!');
      navigate('/', { replace: true, state: { refreshMap: true } });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} />
          <h1 className="text-lg font-bold">Create Route</h1>
        </div>
      </div>
      <div className="px-4 py-4 space-y-5">
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
          <h2 className="text-base font-bold">Route Details</h2>
          <div><Label>Name *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your route a name" className="mt-1" /></div>
          <div><Label>Description</Label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the route..." className="w-full mt-1 border border-border/50 rounded-xl px-3 py-2 text-sm bg-background min-h-[80px] resize-none" /></div>
          <div><Label>Type</Label><div className="flex flex-wrap gap-2 mt-1">{ROUTE_TYPES.map(t => (
            <button key={t} onClick={() => setRouteType(routeType === t ? '' : t)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${routeType === t ? 'bg-routes text-white border-routes' : 'bg-muted/50 text-muted-foreground border-border/50'}`}>{t}</button>
          ))}</div></div>
          <div><Label>Difficulty</Label><div className="flex flex-wrap gap-2 mt-1">{DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(difficulty === d ? '' : d)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${difficulty === d ? 'bg-routes text-white border-routes' : 'bg-muted/50 text-muted-foreground border-border/50'}`}>{d}</button>
          ))}</div></div>
          <div><Label>Surface</Label><div className="flex flex-wrap gap-2 mt-1">{SURFACES.map(s => (
            <button key={s} onClick={() => setSurface(surface === s ? '' : s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${surface === s ? 'bg-routes text-white border-routes' : 'bg-muted/50 text-muted-foreground border-border/50'}`}>{s}</button>
          ))}</div></div>
          <div><Label>Visibility</Label><div className="grid grid-cols-2 gap-2 mt-1">
            <button onClick={() => setVisibility('public')} className={`p-3 rounded-xl border text-center text-xs font-semibold ${visibility === 'public' ? 'bg-routes/10 border-routes' : 'bg-muted/30 border-border/50'}`}>Public</button>
            <button onClick={() => setVisibility('private')} className={`p-3 rounded-xl border text-center text-xs font-semibold ${visibility === 'private' ? 'bg-routes/10 border-routes' : 'bg-muted/30 border-border/50'}`}>Private</button>
          </div></div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
          <h2 className="text-base font-bold">Create Route</h2>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMethod('draw')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${method === 'draw' ? 'bg-routes/10 border-routes' : 'bg-muted/30 border-border/50'}`}>
              <Pencil className="w-6 h-6 text-routes" /><p className="text-xs font-semibold">Draw Route</p><p className="text-[9px] text-muted-foreground">Tap points on map</p>
            </button>
            <button onClick={() => setMethod('gpx')} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${method === 'gpx' ? 'bg-routes/10 border-routes' : 'bg-muted/30 border-border/50'}`}>
              <Upload className="w-6 h-6 text-routes" /><p className="text-xs font-semibold">Upload GPX</p><p className="text-[9px] text-muted-foreground">Import from file</p>
            </button>
          </div>
        </div>

        {method === 'draw' && (
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-[400px]" />
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setWaypoints(prev => prev.slice(0, -1))} disabled={waypoints.length === 0} className="gap-1"><Undo2 className="w-3 h-3" /> Undo</Button>
                <Button variant="outline" size="sm" onClick={() => { setWaypoints([]); setRouteGeoJson(null); setDistanceKm(0); setDurationMin(0); }} disabled={waypoints.length === 0} className="gap-1"><Trash2 className="w-3 h-3" /> Clear</Button>
              </div>
              {waypoints.length > 0 && <p className="text-xs text-muted-foreground">{waypoints.length} waypoints · {distanceKm} km · ~{durationMin} min{isSnapping ? ' · Snapping...' : ''}</p>}
              {waypoints.length < 2 && <p className="text-xs text-muted-foreground">Tap on the map to add waypoints</p>}
            </div>
          </div>
        )}

        {method === 'gpx' && (
          <div className="bg-card rounded-2xl border border-border/50 p-5 text-center space-y-3">
            <Upload className="w-10 h-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground">Upload a .gpx file from your device</p>
            <label className="inline-block px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer text-white" style={{ backgroundColor: '#4f7fff' }}>
              Choose File<input type="file" accept=".gpx" onChange={handleGPXUpload} className="hidden" />
            </label>
            {waypoints.length > 0 && <p className="text-xs text-muted-foreground">{waypoints.length} points · {distanceKm} km</p>}
          </div>
        )}

        <Button onClick={handlePublish} disabled={isPublishing || !title.trim() || (waypoints.length < 2 && !routeGeoJson)}
          className="w-full h-12 rounded-xl text-base font-semibold" style={{ backgroundColor: '#4f7fff' }}>
          {isPublishing ? 'Publishing...' : 'Publish Route'}
        </Button>
      </div>
    </div>
  );
};

export default AddRoute;
