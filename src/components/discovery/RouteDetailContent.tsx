import { Star, Route, Clock, Navigation, Bookmark, Share2, ArrowLeft } from 'lucide-react';
import { RevRoute } from '@/models';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface RouteDetailContentProps {
  route: RevRoute;
  onNavigate: () => void;
  onViewFull: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const RouteDetailContent = ({ route, onNavigate, isSaved, onToggleSave }: RouteDetailContentProps) => {
  const [routeUserRating, setRouteUserRating] = useState(0);
  const [routeHoveredStar, setRouteHoveredStar] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const fullMapRef = useRef<HTMLDivElement>(null);
  const fullMapInstanceRef = useRef<mapboxgl.Map | null>(null);

  const data = route as any;
  const photos: string[] = data.photos || [];
  const geometry = data.geometry || data.route_data;

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: route.name, text: `Check out ${route.name} on RevNet` }).catch(() => {});
    else { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }
  };

  // Full-screen map
  useEffect(() => {
    if (!showFullMap || !fullMapRef.current || fullMapInstanceRef.current) return;
    const map = new mapboxgl.Map({
      container: fullMapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [data.lng || -1.5, data.lat || 52.5],
      zoom: 10,
    });
    fullMapInstanceRef.current = map;
    map.on('load', () => {
      if (!geometry) return;
      map.addSource('full-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry } });
      map.addLayer({ id: 'rt-bg', type: 'line', source: 'full-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#fff', 'line-width': 8, 'line-opacity': 0.9 } });
      map.addLayer({ id: 'rt-line', type: 'line', source: 'full-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#4f7fff', 'line-width': 5 } });
      const coords = geometry.type === 'LineString' ? geometry.coordinates : geometry.coordinates?.[0] || [];
      if (coords.length > 1) {
        const bounds = coords.reduce((b: mapboxgl.LngLatBounds, c: number[]) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coords[0], coords[0]));
        map.fitBounds(bounds, { padding: 60, duration: 800 });
        const mkEl = (color: string) => { const el = document.createElement('div'); el.style.cssText = `width:16px;height:16px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);`; return el; };
        new mapboxgl.Marker({ element: mkEl('#22c55e') }).setLngLat(coords[0]).addTo(map);
        new mapboxgl.Marker({ element: mkEl('#ef4444') }).setLngLat(coords[coords.length - 1]).addTo(map);
      }
    });
    return () => { map.remove(); fullMapInstanceRef.current = null; };
  }, [showFullMap]);

  return (
    <div className="space-y-3">
      {/* Photos grid — no banner, no scroll */}
      {photos.length === 0 && (
        <div className="h-36 bg-gradient-to-br from-routes/10 to-routes/20 rounded-2xl flex items-center justify-center -mx-5 -mt-1 rounded-t-2xl">
          <div className="text-center"><span className="text-4xl">🗺️</span><p className="text-xs font-semibold text-routes mt-1">{route.name}</p></div>
        </div>
      )}
      {photos.length === 1 && <img src={photos[0]} className="w-full h-44 object-cover rounded-2xl -mx-5 -mt-1 rounded-t-2xl" style={{ width: 'calc(100% + 2.5rem)' }} alt="" />}
      {photos.length === 2 && (
        <div className="flex gap-2 h-36 -mx-5 -mt-1" style={{ width: 'calc(100% + 2.5rem)', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
          <img src={photos[0]} className="flex-1 object-cover rounded-2xl" alt="" />
          <img src={photos[1]} className="flex-1 object-cover rounded-2xl" alt="" />
        </div>
      )}
      {photos.length === 3 && (
        <div className="space-y-1.5">
          <img src={photos[0]} className="w-full h-32 object-cover rounded-xl" alt="" />
          <div className="flex gap-1.5 h-20">
            <img src={photos[1]} className="flex-1 object-cover rounded-xl" alt="" />
            <img src={photos[2]} className="flex-1 object-cover rounded-xl" alt="" />
          </div>
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
            className={`w-8 h-8 rounded-lg flex items-center justify-center border text-sm ${isSaved ? 'bg-routes/10 border-routes text-routes' : 'bg-muted/50 border-border/50 text-muted-foreground'}`}>
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleShare} className="w-8 h-8 rounded-lg flex items-center justify-center border bg-muted/50 border-border/50 text-muted-foreground">
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {route.type && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-routes/10 text-routes">{route.type}</span>}
        {route.difficulty && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground capitalize">{route.difficulty}</span>}
        {(data.surface_type || route.surfaceType) && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground capitalize">{data.surface_type || route.surfaceType}</span>}
      </div>

      {/* Stats inline */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {data.distance_meters && <span className="flex items-center gap-1"><Route className="w-3 h-3 text-routes" />{(data.distance_meters / 1000).toFixed(1)}km</span>}
        {(data.duration_minutes || route.durationMinutes) && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />~{data.duration_minutes || route.durationMinutes}min</span>}
        {route.rating && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{route.rating}</span>}
      </div>

      {/* Description — compact */}
      {route.description && <p className="text-xs text-muted-foreground line-clamp-2">{route.description}</p>}

      {/* Action buttons */}
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

      {/* Rating — compact inline */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <span className="text-[11px] font-medium text-muted-foreground">Rate this route</span>
        {ratingSubmitted ? (
          <span className="text-[11px] text-muted-foreground">Rated {routeUserRating}/5 ⭐</span>
        ) : (
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onMouseEnter={() => setRouteHoveredStar(s)} onMouseLeave={() => setRouteHoveredStar(0)}
                onClick={() => { setRouteUserRating(s); setRatingSubmitted(true); toast.success(`Rated ${s}/5!`); }}>
                <Star className={`w-5 h-5 ${s <= (routeHoveredStar || routeUserRating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-screen route map overlay */}
      {showFullMap && (
        <div className="fixed inset-0" style={{ zIndex: 99999 }}>
          <div ref={fullMapRef} className="absolute inset-0" />
          <div className="absolute top-12 left-4 z-10">
            <button onClick={() => { setShowFullMap(false); fullMapInstanceRef.current?.remove(); fullMapInstanceRef.current = null; }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white shadow-lg text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-100" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <p className="font-bold text-sm">{route.name}</p>
            <div className="flex gap-3 mt-1 text-xs text-gray-500">
              {data.distance_meters && <span>{(data.distance_meters / 1000).toFixed(1)} km</span>}
              {data.duration_minutes && <span>~{data.duration_minutes} min</span>}
              {route.difficulty && <span className="capitalize">{route.difficulty}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDetailContent;
