import { Star, Route, Clock, Navigation, Bookmark, Share2, ArrowLeft } from 'lucide-react';
import { RevRoute } from '@/models';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { supabase } from '@/integrations/supabase/client';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface RouteDetailContentProps {
  route: RevRoute;
  onNavigate: () => void;
  onViewFull: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const RouteDetailContent = ({ route, onNavigate, isSaved, onToggleSave }: RouteDetailContentProps) => {
  const [showFullMap, setShowFullMap] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const fullMapRef = useRef<HTMLDivElement>(null);
  const fullMapInstanceRef = useRef<mapboxgl.Map | null>(null);

  const data = route as any;
  const photos: string[] = data.photos || [];
  const geometry = data.geometry || data.route_data;
  const routeId = data.id || route.id;

  useEffect(() => { supabase.auth.getUser().then(({ data: d }) => setCurrentUserId(d.user?.id || null)); }, []);

  // Fetch reviews
  useEffect(() => {
    if (!routeId) return;
    (async () => {
      try {
        const { data: revs } = await supabase.from('route_reviews')
          .select('*, profiles:user_id(display_name, avatar_url, username)')
          .eq('route_id', routeId).order('created_at', { ascending: false });
        if (revs) {
          setReviews(revs);
          const mine = revs.find((r: any) => r.user_id === currentUserId);
          if (mine) { setUserReview(mine); setSelectedRating(mine.rating); setReviewText(mine.review_text || ''); }
        }
      } catch { /* route_reviews table may not exist yet */ }
    })();
  }, [routeId, currentUserId]);

  const handleSubmitReview = async () => {
    if (!selectedRating || !currentUserId || !routeId) return;
    setIsSubmittingReview(true);
    const payload = { route_id: routeId, user_id: currentUserId, rating: selectedRating, review_text: reviewText.trim() || null };
    const { error } = userReview
      ? await supabase.from('route_reviews').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', userReview.id)
      : await supabase.from('route_reviews').insert(payload);
    if (error) toast.error('Failed to save review');
    else {
      toast.success(userReview ? 'Review updated!' : 'Review submitted!');
      setIsEditingReview(false);
      const { data: fresh } = await supabase.from('route_reviews').select('*, profiles:user_id(display_name, avatar_url, username)').eq('route_id', routeId).order('created_at', { ascending: false });
      if (fresh) { setReviews(fresh); setUserReview(fresh.find((r: any) => r.user_id === currentUserId) || null); }
    }
    setIsSubmittingReview(false);
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: route.name, text: `Check out ${route.name} on RevNet` }).catch(() => {});
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }
  };

  // Full-screen map
  useEffect(() => {
    if (!showFullMap || !fullMapRef.current || fullMapInstanceRef.current) return;
    const map = new mapboxgl.Map({ container: fullMapRef.current, style: 'mapbox://styles/mapbox/streets-v12', center: [data.lng || -1.5, data.lat || 52.5], zoom: 10 });
    fullMapInstanceRef.current = map;
    map.on('load', () => {
      if (!geometry) return;
      map.addSource('fr', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry } });
      map.addLayer({ id: 'fr-bg', type: 'line', source: 'fr', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#fff', 'line-width': 8, 'line-opacity': 0.9 } });
      map.addLayer({ id: 'fr-line', type: 'line', source: 'fr', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#4f7fff', 'line-width': 5 } });
      const coords = geometry.type === 'LineString' ? geometry.coordinates : geometry.coordinates?.[0] || [];
      if (coords.length > 1) {
        const bounds = coords.reduce((b: mapboxgl.LngLatBounds, c: number[]) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coords[0], coords[0]));
        map.fitBounds(bounds, { padding: 60, duration: 800 });
        const mk = (color: string) => { const el = document.createElement('div'); el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);`; return el; };
        new mapboxgl.Marker({ element: mk('#22c55e') }).setLngLat(coords[0]).addTo(map);
        new mapboxgl.Marker({ element: mk('#ef4444') }).setLngLat(coords[coords.length - 1]).addTo(map);
      }
    });
    return () => { map.remove(); fullMapInstanceRef.current = null; };
  }, [showFullMap]);

  return (
    <div className="space-y-3">
      {/* Photos grid — no banner, no negative margins */}
      {photos.length === 0 && (
        <div className="h-36 bg-gradient-to-br from-routes/10 to-routes/20 rounded-2xl flex items-center justify-center">
          <div className="text-center"><span className="text-4xl">🗺️</span><p className="text-xs font-semibold text-routes mt-1">{route.name}</p></div>
        </div>
      )}
      {photos.length === 1 && <img src={photos[0]} className="w-full h-44 object-cover rounded-2xl" alt="" />}
      {photos.length === 2 && (
        <div className="flex gap-2 h-36">
          <img src={photos[0]} className="flex-1 object-cover rounded-2xl" alt="" />
          <img src={photos[1]} className="flex-1 object-cover rounded-2xl" alt="" />
        </div>
      )}
      {photos.length === 3 && (
        <div className="space-y-1.5">
          <img src={photos[0]} className="w-full h-32 object-cover rounded-xl" alt="" />
          <div className="flex gap-1.5 h-20"><img src={photos[1]} className="flex-1 object-cover rounded-xl" alt="" /><img src={photos[2]} className="flex-1 object-cover rounded-xl" alt="" /></div>
        </div>
      )}
      {photos.length >= 4 && (
        <div className="grid grid-cols-2 gap-1.5 h-44">
          {photos.slice(0, 4).map((p, i) => <img key={i} src={p} className="w-full h-full object-cover rounded-xl" alt="" />)}
        </div>
      )}

      {/* Name + save/share */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold flex-1 leading-tight">{route.name}</h2>
        <div className="flex gap-1.5">
          <button onClick={() => { onToggleSave(); toast.success(isSaved ? 'Removed' : 'Saved'); }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isSaved ? 'bg-routes/10 border-routes text-routes' : 'bg-muted/50 border-border/50 text-muted-foreground'}`}>
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleShare} className="w-8 h-8 rounded-lg flex items-center justify-center border bg-muted/50 border-border/50 text-muted-foreground"><Share2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {route.type && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-routes/10 text-routes">{route.type}</span>}
        {route.difficulty && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground capitalize">{route.difficulty}</span>}
        {(data.surface_type || route.surfaceType) && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground capitalize">{data.surface_type || route.surfaceType}</span>}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {data.distance_meters && <span className="flex items-center gap-1"><Route className="w-3 h-3 text-routes" />{(data.distance_meters / 1000).toFixed(1)}km</span>}
        {(data.duration_minutes || route.durationMinutes) && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{data.duration_minutes || route.durationMinutes}min</span>}
        {reviews.length > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} ({reviews.length})</span>}
      </div>

      {route.description && <p className="text-xs text-muted-foreground line-clamp-2">{route.description}</p>}

      {/* Buttons */}
      <div className="flex gap-2">
        {geometry && (
          <button onClick={() => setShowFullMap(true)} className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-routes/30 bg-routes/5 text-routes flex items-center justify-center gap-1.5">
            <Route className="w-3.5 h-3.5" /> View Route
          </button>
        )}
        <button onClick={onNavigate} className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-routes text-white flex items-center justify-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" /> Navigate
        </button>
      </div>

      {/* Reviews */}
      <div className="space-y-2 pt-2 border-t border-border/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold">Reviews {reviews.length > 0 && `(${reviews.length})`}</h3>
          {!userReview && !isEditingReview && currentUserId && (
            <button onClick={() => setIsEditingReview(true)} className="text-[10px] font-semibold text-routes">+ Write review</button>
          )}
        </div>

        {isEditingReview && (
          <div className="bg-muted/30 rounded-xl p-3 space-y-2 border border-border/30">
            <div className="flex gap-1">{[1,2,3,4,5].map(s => (
              <button key={s} onMouseEnter={() => setHoveredStar(s)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setSelectedRating(s)}>
                <Star className={`w-5 h-5 ${s <= (hoveredStar || selectedRating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />
              </button>
            ))}</div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience... (optional)" className="w-full border border-border/50 rounded-lg px-3 py-2 text-xs bg-background resize-none min-h-[50px]" />
            <div className="flex gap-2">
              <button onClick={() => setIsEditingReview(false)} className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-border/50">Cancel</button>
              <button onClick={handleSubmitReview} disabled={isSubmittingReview || !selectedRating} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-routes text-white disabled:opacity-50">{isSubmittingReview ? 'Saving...' : userReview ? 'Update' : 'Submit'}</button>
            </div>
          </div>
        )}

        {userReview && !isEditingReview && (
          <div className="bg-routes/5 rounded-xl p-2.5 border border-routes/20">
            <div className="flex items-center justify-between">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= userReview.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} />)}</div>
              <button onClick={() => setIsEditingReview(true)} className="text-[10px] text-routes font-semibold">Edit</button>
            </div>
            {userReview.review_text && <p className="text-[11px] text-muted-foreground mt-1">{userReview.review_text}</p>}
          </div>
        )}

        {reviews.filter(r => r.user_id !== currentUserId).slice(0, 3).map(r => (
          <div key={r.id} className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold overflow-hidden flex-shrink-0">
              {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} className="w-full h-full object-cover" alt="" /> : (r.profiles?.display_name?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium">{r.profiles?.display_name || 'User'}</span>
                <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-2.5 h-2.5 ${s <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} />)}</div>
              </div>
              {r.review_text && <p className="text-[10px] text-muted-foreground">{r.review_text}</p>}
            </div>
          </div>
        ))}

        {reviews.length === 0 && !isEditingReview && <p className="text-[10px] text-muted-foreground text-center py-1">No reviews yet</p>}
      </div>

      {/* Full-screen map */}
      {showFullMap && (
        <div className="fixed inset-0" style={{ zIndex: 99999 }}>
          <div ref={fullMapRef} className="absolute inset-0" />
          <div className="absolute top-12 left-4 z-10">
            <button onClick={() => { setShowFullMap(false); fullMapInstanceRef.current?.remove(); fullMapInstanceRef.current = null; }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white shadow-lg text-sm font-semibold"><ArrowLeft className="w-4 h-4" /> Back</button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <p className="font-bold text-sm">{route.name}</p>
            <div className="flex gap-3 mt-1 text-xs text-gray-500">
              {data.distance_meters && <span>{(data.distance_meters / 1000).toFixed(1)} km</span>}
              {data.duration_minutes && <span>~{data.duration_minutes} min</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDetailContent;
