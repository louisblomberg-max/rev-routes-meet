import { MapPin, Star, Route, Clock, Navigation, Bookmark, Share2, Flag, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  const photos = data.photos as string[] | undefined;
  const hasPhotos = photos && photos.length > 0;
  const geometry = data.geometry || data.route_data;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: route.name, text: `Check out ${route.name} on RevNet` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    }
  };

  const handleSave = () => {
    onToggleSave();
    toast.success(isSaved ? 'Removed from saved' : 'Saved to My Routes');
  };

  // Full-screen map initialization
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
      if (geometry) {
        map.addSource('full-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry } });
        map.addLayer({ id: 'full-route-bg', type: 'line', source: 'full-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#fff', 'line-width': 8, 'line-opacity': 0.9 } });
        map.addLayer({ id: 'full-route-line', type: 'line', source: 'full-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#4f7fff', 'line-width': 5 } });

        const coords = geometry.type === 'LineString' ? geometry.coordinates : geometry.coordinates?.[0] || [];
        if (coords.length > 1) {
          const bounds = coords.reduce((b: mapboxgl.LngLatBounds, c: number[]) => b.extend(c as [number, number]), new mapboxgl.LngLatBounds(coords[0], coords[0]));
          map.fitBounds(bounds, { padding: 60, duration: 800 });

          const startEl = document.createElement('div');
          startEl.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
          new mapboxgl.Marker({ element: startEl }).setLngLat(coords[0]).addTo(map);

          const endEl = document.createElement('div');
          endEl.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
          new mapboxgl.Marker({ element: endEl }).setLngLat(coords[coords.length - 1]).addTo(map);
        }
      }
    });

    return () => { map.remove(); fullMapInstanceRef.current = null; };
  }, [showFullMap]);

  return (
    <div className="space-y-4">
      {/* Photos — horizontal scroll */}
      {hasPhotos ? (
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 snap-x snap-mandatory -mt-1">
          {photos.map((photo: string, i: number) => (
            <img key={i} src={photo} className="h-52 w-72 object-cover rounded-2xl flex-shrink-0 snap-start" alt={`Route photo ${i + 1}`} />
          ))}
        </div>
      ) : (
        <div className="h-40 -mx-5 -mt-1 rounded-t-2xl bg-gradient-to-br from-routes/10 to-routes/20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl">🗺️</span>
            <p className="text-sm font-semibold text-routes mt-2">{route.name}</p>
          </div>
        </div>
      )}

      {/* Title + actions */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold text-foreground leading-tight">{route.name}</h2>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={handleSave} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${isSaved ? 'bg-routes/10 border-routes text-routes' : 'bg-muted/50 border-border/50 text-muted-foreground'}`}>
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
          <button onClick={handleShare} className="w-9 h-9 rounded-xl flex items-center justify-center border bg-muted/50 border-border/50 text-muted-foreground">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {route.type && <Badge variant="outline" className="bg-routes/10 text-routes border-routes/20 text-xs">{route.type}</Badge>}
        {route.difficulty && <Badge variant="outline" className="text-xs capitalize">{route.difficulty}</Badge>}
        {(data.surface_type || route.surfaceType) && <Badge variant="outline" className="text-xs capitalize">{data.surface_type || route.surfaceType}</Badge>}
      </div>

      {route.description && <p className="text-sm text-muted-foreground leading-relaxed">{route.description}</p>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <Route className="w-4 h-4 text-routes mx-auto mb-1" />
          <p className="text-sm font-bold">{route.distance || (data.distance_meters ? `${(data.distance_meters / 1000).toFixed(1)}km` : '—')}</p>
          <p className="text-[10px] text-muted-foreground">Distance</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-sm font-bold">{data.duration_minutes ? `${data.duration_minutes}m` : route.durationMinutes ? `${route.durationMinutes}m` : '—'}</p>
          <p className="text-[10px] text-muted-foreground">Duration</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 text-center">
          <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-sm font-bold">{route.rating || '—'}</p>
          <p className="text-[10px] text-muted-foreground">Rating</p>
        </div>
      </div>

      {route.safetyTags && route.safetyTags.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Safety</p>
          <div className="flex flex-wrap gap-1.5">
            {route.safetyTags.map(tag => <Badge key={tag} variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">{tag}</Badge>)}
          </div>
        </div>
      )}

      {/* View full route map */}
      {geometry && (
        <button onClick={() => setShowFullMap(true)} className="w-full p-3 rounded-xl bg-routes/5 border border-routes/20 flex items-center gap-3 text-left hover:bg-routes/10 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-routes/10 flex items-center justify-center flex-shrink-0"><Route className="w-5 h-5 text-routes" /></div>
          <div className="flex-1">
            <p className="text-sm font-semibold">View Full Route Map</p>
            <p className="text-[10px] text-muted-foreground">See the complete route with start and end markers</p>
          </div>
        </button>
      )}

      {/* CTA */}
      <Button className="w-full gap-2 bg-routes hover:bg-routes/90 text-white py-5" onClick={onNavigate}>
        <Navigation className="w-4 h-4" /> Start Navigation
      </Button>

      {/* Rate */}
      <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Rate this route</h3>
        {ratingSubmitted ? (
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Star className="w-4 h-4 fill-amber-500 text-amber-500" /> You rated {routeUserRating}/5</p>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map(s => (
                <button key={s} onMouseEnter={() => setRouteHoveredStar(s)} onMouseLeave={() => setRouteHoveredStar(0)} onClick={() => setRouteUserRating(s)} className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={`w-7 h-7 transition-colors ${s <= (routeHoveredStar || routeUserRating) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={() => { if (!routeUserRating) { toast.error('Select a rating'); return; } setRatingSubmitted(true); toast.success(`Rated ${routeUserRating}/5`); }} disabled={!routeUserRating} className="text-xs">Submit</Button>
          </div>
        )}
      </div>

      {/* Full-screen route map overlay */}
      {showFullMap && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-10 safe-top px-4 pt-4">
            <button onClick={() => { setShowFullMap(false); if (fullMapInstanceRef.current) { fullMapInstanceRef.current.remove(); fullMapInstanceRef.current = null; } }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg text-sm font-semibold text-foreground">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
          <div ref={fullMapRef} className="flex-1" />
          <div className="absolute bottom-0 left-0 right-0 safe-bottom bg-white/90 backdrop-blur-sm px-4 py-3 border-t border-border/20">
            <div className="flex items-center justify-around text-sm">
              <span className="font-semibold truncate">{route.name}</span>
              {data.distance_meters && <span className="text-muted-foreground">{(data.distance_meters / 1000).toFixed(1)} km</span>}
              {data.duration_minutes && <span className="text-muted-foreground">~{data.duration_minutes} min</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDetailContent;
