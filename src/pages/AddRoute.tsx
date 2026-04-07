import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import { ArrowLeft, Upload, Pencil, Undo2, Trash2, Lock, MapPin, Clock, Route, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const ROUTE_TYPES = ['Scenic', 'Coastal', 'Off-Road', 'Twisties', 'Urban', 'Track'];
const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Expert'];
const SURFACES = ['Tarmac', 'Gravel', 'Dirt', 'Mixed'];

const AddRoute = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan } = usePlan();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEdit = !!editId;
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEdit);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);

  const [step, setStep] = useState(isEdit ? 3 : 1);
  const [method, setMethod] = useState<'draw' | 'gpx' | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [routeType, setRouteType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [surface, setSurface] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [routeGeoJson, setRouteGeoJson] = useState<any>(null);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationMin, setDurationMin] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [gpxFileName, setGpxFileName] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const goBack = () => {
    if (step === 1) { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }
    else setStep(step - 1);
  };

  // Plan gate
  if (currentPlan === 'free') {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Lock className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold mb-1">Pro Driver Required</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center">Creating routes requires Pro Driver or Club & Business.</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={() => navigate('/subscription')} style={{ backgroundColor: '#d30d37' }} className="text-white">Upgrade</Button>
        </div>
      </div>
    );
  }

  // Load edit data
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!editId || !user?.id) { setIsLoadingEdit(false); return; }
    (async () => {
      const { data } = await supabase.from('routes').select('*').eq('id', editId).single();
      if (!data) { toast.error('Route not found'); navigate('/my-routes'); return; }
      if (data.created_by !== user.id) { toast.error('Not your route'); navigate('/my-routes'); return; }
      setTitle(data.name || '');
      setDescription(data.description || '');
      setRouteType(data.type ? data.type.charAt(0).toUpperCase() + data.type.slice(1) : '');
      setDifficulty(data.difficulty ? data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1) : '');
      setSurface(data.surface_type ? data.surface_type.charAt(0).toUpperCase() + data.surface_type.slice(1) : '');
      setVisibility((data.visibility as any) || 'public');
      setDistanceKm(data.distance_meters ? data.distance_meters / 1000 : 0);
      setDurationMin(data.duration_minutes || 0);
      setExistingPhotos(data.photos || []);
      if (data.geometry) setRouteGeoJson(data.geometry);
      setIsLoadingEdit(false);
    })();
  }, [editId, user?.id]);

  // Initialize draw map
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (step !== 2 || method !== 'draw' || !mapContainerRef.current) return;
    if (mapRef.current) { mapRef.current.resize(); return; }
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-1.5, 52.5], zoom: 6,
    });
    mapRef.current = map;
    map.on('click', (e) => setWaypoints(prev => [...prev, [e.lngLat.lng, e.lngLat.lat]]));
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 12, duration: 1000 }),
      () => {}, { timeout: 5000 }
    );
    return () => { map.remove(); mapRef.current = null; };
  }, [step, method]);

  // Snap to road + draw markers
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const map = mapRef.current;
    if (!map || waypoints.length === 0) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    waypoints.forEach((wp, i) => {
      const el = document.createElement('div');
      const color = i === 0 ? '#22c55e' : i === waypoints.length - 1 ? '#ef4444' : '#4f7fff';
      el.style.cssText = `width:24px;height:24px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3);`;
      el.textContent = String(i + 1);
      markersRef.current.push(new mapboxgl.Marker({ element: el }).setLngLat(wp).addTo(map));
    });
    if (waypoints.length < 2) return;
    const snap = async () => {
      setIsSnapping(true);
      try {
        const pts = waypoints.length > 25
          ? [waypoints[0], ...waypoints.filter((_, i) => i > 0 && i < waypoints.length - 1 && i % Math.ceil(waypoints.length / 23) === 0), waypoints[waypoints.length - 1]]
          : waypoints;
        const coords = pts.map(p => p.join(',')).join(';');
        const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`);
        const data = await res.json();
        if (data.routes?.[0]) {
          const route = data.routes[0];
          setRouteGeoJson(route.geometry);
          setDistanceKm(Math.round(route.distance / 100) / 10);
          setDurationMin(Math.round(route.duration / 60));
          const gj = { type: 'Feature' as const, properties: {}, geometry: route.geometry };
          if (map.getSource('route')) { (map.getSource('route') as mapboxgl.GeoJSONSource).setData(gj); }
          else {
            map.addSource('route', { type: 'geojson', data: gj });
            map.addLayer({ id: 'route-bg', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#fff', 'line-width': 7, 'line-opacity': 0.8 } });
            map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#4f7fff', 'line-width': 4 } });
          }
        }
      } catch { toast.error('Could not snap to road'); }
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
      let pts = Array.from(doc.querySelectorAll('trkpt'));
      if (!pts.length) pts = Array.from(doc.querySelectorAll('rtept'));
      if (!pts.length) pts = Array.from(doc.querySelectorAll('wpt'));
      if (pts.length < 2) { toast.error('GPX file has too few points'); return; }
      const coords: [number, number][] = pts.map(pt => [parseFloat(pt.getAttribute('lon') || '0'), parseFloat(pt.getAttribute('lat') || '0')]).filter(([a, b]) => a && b);
      const step = Math.max(1, Math.floor(coords.length / 24));
      setWaypoints([coords[0], ...coords.filter((_, i) => i % step === 0 && i > 0 && i < coords.length - 1), coords[coords.length - 1]]);
      setRouteGeoJson({ type: 'LineString', coordinates: coords });
      let km = 0;
      for (let i = 1; i < coords.length; i++) {
        const [a1, b1] = coords[i - 1]; const [a2, b2] = coords[i];
        const dLat = (b2 - b1) * Math.PI / 180; const dLng = (a2 - a1) * Math.PI / 180;
        const x = Math.sin(dLat / 2) ** 2 + Math.cos(b1 * Math.PI / 180) * Math.cos(b2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        km += 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
      }
      setDistanceKm(Math.round(km * 10) / 10);
      setDurationMin(Math.round(km * 2));
      setGpxFileName(file.name);
      toast.success(`Loaded ${coords.length} points from ${file.name}`);
    } catch { toast.error('Failed to parse GPX file'); }
  };

  const handlePublish = async () => {
    if (!title.trim()) { toast.error('Route name is required'); return; }
    if (waypoints.length < 2 && !routeGeoJson) { toast.error('Create a route first'); return; }
    if (!user?.id) return;
    setIsPublishing(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id || user.id;
      // Upload new photos
      const photoUrls: string[] = [];
      for (const file of photoFiles) {
        const ext = file.name.split('.').pop();
        const path = `routes/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: ue } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
        if (!ue) { const { data: u } = supabase.storage.from('avatars').getPublicUrl(path); photoUrls.push(u.publicUrl); }
      }
      const allPhotos = [...existingPhotos, ...photoUrls];

      if (isEdit && editId) {
        const { error } = await supabase.from('routes').update({
          name: title.trim(), description: description.trim() || null,
          type: routeType.toLowerCase() || null, difficulty: difficulty.toLowerCase() || null,
          surface_type: surface.toLowerCase() || null, visibility,
          photos: allPhotos.length > 0 ? allPhotos : null,
        }).eq('id', editId).eq('created_by', userId);
        if (error) throw error;
        toast.success('Route updated!');
        navigate('/my-routes');
        return;
      }

      const { error } = await supabase.from('routes').insert({
        name: title.trim(), description: description.trim() || null, photos: allPhotos.length > 0 ? allPhotos : null,
        type: routeType.toLowerCase() || null, difficulty: difficulty.toLowerCase() || null,
        surface_type: surface.toLowerCase() || null, visibility, geometry: routeGeoJson,
        distance_meters: Math.round(distanceKm * 1000), duration_minutes: durationMin,
        lat: waypoints[0]?.[1] ?? null, lng: waypoints[0]?.[0] ?? null,
        created_by: userId, status: 'published',
      });
      if (error) throw error;
      toast.success('Route published!');
      navigate('/', { replace: true, state: { refreshMap: true } });
    } catch (err: any) { toast.error(err?.message || 'Failed to publish'); }
    finally { setIsPublishing(false); }
  };

  return (
    <div className="mobile-container bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={goBack} className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-lg font-bold flex-1">{isEdit ? 'Edit Route' : 'Create Route'}</h1>
          <span className="text-xs text-muted-foreground">Step {step}/3</span>
        </div>
        {/* Step indicator */}
        <div className="px-4 pb-2 flex gap-1">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'bg-routes flex-[2]' : s < step ? 'bg-routes/60 flex-1' : 'bg-muted flex-1'}`} />
          ))}
        </div>
      </div>

      {/* ═══ STEP 1: Choose Method ═══ */}
      {step === 1 && (
        <div className="px-4 py-6 space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">How do you want to create your route?</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose a method to get started</p>
          </div>
          <button onClick={() => { setMethod('draw'); setStep(2); }}
            className="w-full p-6 rounded-2xl border-2 border-border/50 bg-card hover:border-routes/50 transition-all text-left space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-routes/10 flex items-center justify-center"><Pencil className="w-7 h-7 text-routes" /></div>
            <h3 className="text-lg font-bold">Draw Route</h3>
            <p className="text-sm text-muted-foreground">Tap points on the map — we snap them to the road automatically</p>
          </button>
          <button onClick={() => { setMethod('gpx'); setStep(2); }}
            className="w-full p-6 rounded-2xl border-2 border-border/50 bg-card hover:border-routes/50 transition-all text-left space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-routes/10 flex items-center justify-center"><Upload className="w-7 h-7 text-routes" /></div>
            <h3 className="text-lg font-bold">Upload GPX</h3>
            <p className="text-sm text-muted-foreground">Import from Strava, Komoot, your sat nav, or any GPX file</p>
          </button>
        </div>
      )}

      {/* ═══ STEP 2: Create Route ═══ */}
      {step === 2 && method === 'draw' && (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
          <div ref={mapContainerRef} className="flex-1" />
          <div className="bg-card border-t border-border/30 p-4 space-y-3">
            {waypoints.length === 0 && <p className="text-sm text-muted-foreground text-center">Tap on the map to add waypoints</p>}
            {waypoints.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-routes" />{waypoints.length} points</span>
                {distanceKm > 0 && <span className="flex items-center gap-1"><Route className="w-3.5 h-3.5 text-routes" />{distanceKm} km</span>}
                {durationMin > 0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-routes" />~{durationMin} min</span>}
                {isSnapping && <span className="text-xs text-muted-foreground animate-pulse">Snapping...</span>}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setWaypoints(prev => prev.slice(0, -1))} disabled={waypoints.length === 0} className="gap-1"><Undo2 className="w-3 h-3" /> Undo</Button>
              <Button variant="outline" size="sm" onClick={() => { setWaypoints([]); setRouteGeoJson(null); setDistanceKm(0); setDurationMin(0); }} disabled={waypoints.length === 0} className="gap-1"><Trash2 className="w-3 h-3" /> Clear</Button>
              <div className="flex-1" />
              <Button onClick={() => setStep(3)} disabled={waypoints.length < 2 || isSnapping} style={{ backgroundColor: '#4f7fff' }} className="text-white gap-1">
                Next →
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && method === 'gpx' && (
        <div className="px-4 py-8 space-y-6">
          {!gpxFileName ? (
            <div className="bg-card rounded-2xl border-2 border-dashed border-border/50 p-8 text-center space-y-4">
              <Upload className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <div>
                <p className="text-sm font-medium">Upload a .gpx file</p>
                <p className="text-xs text-muted-foreground mt-1">Supported: Strava, Komoot, Garmin, TomTom</p>
              </div>
              <label className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-white" style={{ backgroundColor: '#4f7fff' }}>
                Choose File<input type="file" accept=".gpx" onChange={handleGPXUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border/50 p-4 text-center space-y-2">
                <p className="text-sm font-semibold">{gpxFileName}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>{waypoints.length} points</span>
                  <span>{distanceKm} km</span>
                  <span>~{durationMin} min</span>
                </div>
              </div>
              <Button onClick={() => setStep(3)} className="w-full h-11 rounded-xl text-white" style={{ backgroundColor: '#4f7fff' }}>
                Looks good — Next →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ═══ STEP 3: Details & Publish ═══ */}
      {step === 3 && (
        <div className="px-4 py-4 space-y-5">
          {/* Route summary */}
          <div className="bg-routes/5 rounded-2xl border border-routes/20 p-4 flex items-center justify-around">
            <div className="text-center"><p className="text-lg font-bold text-routes">{distanceKm}</p><p className="text-[10px] text-muted-foreground">km</p></div>
            <div className="w-px h-8 bg-routes/20" />
            <div className="text-center"><p className="text-lg font-bold text-routes">~{durationMin}</p><p className="text-[10px] text-muted-foreground">min</p></div>
            <div className="w-px h-8 bg-routes/20" />
            <div className="text-center"><p className="text-lg font-bold text-routes">{waypoints.length}</p><p className="text-[10px] text-muted-foreground">points</p></div>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-4">
            <div><Label>Route Name *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Peak District Scenic Drive" className="mt-1" /></div>
            <div><Label>Description</Label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the route, notable landmarks, tips..." className="w-full mt-1 border border-border/50 rounded-xl px-3 py-2 text-sm bg-background min-h-[80px] resize-none" /></div>
            <div>
              <Label>Photos (optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">Scenery, start point, highlights</p>
              <div className="flex gap-2 flex-wrap">
                {existingPhotos.map((url, i) => (
                  <div key={`ex-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/50">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setExistingPhotos(p => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white text-xs">×</button>
                  </div>
                ))}
                {photoPreviews.map((preview, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/50">
                    <img src={preview} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => { setPhotoPreviews(p => p.filter((_, idx) => idx !== i)); setPhotoFiles(p => p.filter((_, idx) => idx !== i)); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white text-xs">×</button>
                  </div>
                ))}
                {photoPreviews.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:border-routes/50 transition-colors">
                    <Camera className="w-5 h-5 text-muted-foreground" /><span className="text-[9px] text-muted-foreground mt-1">Add</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(ev) => {
                      Array.from(ev.target.files || []).slice(0, 5 - photoPreviews.length).forEach(file => {
                        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
                        const reader = new FileReader();
                        reader.onload = (r) => setPhotoPreviews(p => [...p, r.target?.result as string]);
                        reader.readAsDataURL(file);
                        setPhotoFiles(p => [...p, file]);
                      });
                    }} />
                  </label>
                )}
              </div>
            </div>
            <div><Label>Route Type</Label><div className="flex flex-wrap gap-2 mt-1">{ROUTE_TYPES.map(t => (
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

          <Button onClick={handlePublish} disabled={isPublishing || !title.trim()}
            className="w-full h-12 rounded-xl text-base font-semibold" style={{ backgroundColor: '#4f7fff' }}>
            {isPublishing ? (isEdit ? 'Saving...' : 'Publishing...') : isEdit ? 'Save Changes' : 'Publish Route'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddRoute;
