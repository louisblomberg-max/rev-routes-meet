import { useState } from 'react';
import { Ruler, Star, Car, Bike, Share2, Bookmark, Flag, Mountain, Gauge, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import NavigateButton from '@/components/NavigateButton';

const RouteDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state, routes: routesRepo } = useData();

  const route = state.routes.find(r => r.id === id);
  const isSavedInitial = state.savedRoutes.includes(id || '');
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const isCreator = route?.createdBy === state.currentUser?.id;

  if (!route) {
    return (
      <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-6">
        <Ruler className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold text-foreground mb-1">Route not found</h2>
        <p className="text-sm text-muted-foreground mb-6">This route may have been removed.</p>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Discovery</Button>
      </div>
    );
  }

  const handleSave = () => {
    if (isSaved) {
      routesRepo.unsaveRoute(state.currentUser?.id || '', route.id);
    } else {
      routesRepo.saveRoute(state.currentUser?.id || '', route.id);
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Route unsaved' : 'Route saved!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const routeStart = { lat: route.lat ?? 51.28, lng: route.lng ?? -1.08, title: route.name };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="relative h-56 bg-gradient-to-br from-routes to-routes/60">
        <BackButton className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur safe-top hover:bg-white" />
        <div className="absolute top-4 right-4 flex gap-2 safe-top">
          <button onClick={handleSave}
            className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center transition-colors active:scale-95 ${isSaved ? 'bg-primary text-white' : 'bg-white/90 hover:bg-white'}`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : 'text-foreground'}`} />
          </button>
          <button onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors active:scale-95">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }}>
          <path d="M 50 200 Q 150 100 250 150 T 350 120" stroke="white" strokeWidth="4" strokeDasharray="8,8" fill="none" />
        </svg>
      </div>

      <div className="px-4 -mt-6 relative pb-8 space-y-4">
        <div className="bg-card rounded-2xl shadow-lg p-5 border border-border/30">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className="bg-routes/15 text-routes text-xs">{route.type}</Badge>
            {route.difficulty && <Badge variant="outline" className="text-xs capitalize">{route.difficulty}</Badge>}
            {isCreator && <Badge variant="secondary" className="text-[10px]">Your Route</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-foreground">{route.name}</h1>

          <div className="mt-4 flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-routes" />
              <span className="text-sm font-medium">{route.distance}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span className="text-sm font-medium">{route.rating}</span>
            </div>
            {route.durationMinutes && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{route.durationMinutes} min</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {(route.vehicleType === 'car' || route.vehicleType === 'both') && <Car className="w-4 h-4" />}
              {(route.vehicleType === 'bike' || route.vehicleType === 'both') && <Bike className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Route details */}
        {(route.elevationGain || route.surfaceType || route.trafficLevel || route.scenicRating) && (
          <div className="bg-card rounded-2xl border border-border/30 p-5">
            <h2 className="font-semibold text-foreground mb-3">Route Info</h2>
            <div className="grid grid-cols-2 gap-3">
              {route.elevationGain && (
                <div className="flex items-center gap-2 text-sm"><Mountain className="w-4 h-4 text-muted-foreground" /><span>{route.elevationGain}m elevation</span></div>
              )}
              {route.surfaceType && (
                <div className="flex items-center gap-2 text-sm"><Gauge className="w-4 h-4 text-muted-foreground" /><span className="capitalize">{route.surfaceType}</span></div>
              )}
              {route.trafficLevel && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">{route.trafficLevel} traffic</div>
              )}
              {route.scenicRating && (
                <div className="flex items-center gap-1.5 text-sm">
                  {Array.from({ length: route.scenicRating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  <span className="text-muted-foreground ml-1">scenic</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-card rounded-2xl border border-border/30 p-5">
          <h2 className="font-semibold text-foreground mb-2">About this route</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {route.description || `A beautiful ${route.type.toLowerCase()} route perfect for a weekend drive. Features stunning views and great road surfaces throughout.`}
          </p>
        </div>

        {/* Safety Tags */}
        {route.safetyTags && route.safetyTags.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/30 p-5">
            <h2 className="font-semibold text-foreground mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Safety</h2>
            <div className="flex flex-wrap gap-1.5">
              {route.safetyTags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-900/20">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Navigate */}
        <NavigateButton destination={routeStart} colorClass="bg-routes hover:bg-routes/90" />

        {/* Report */}
        <button onClick={() => toast.info('Report submitted')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors mx-auto">
          <Flag className="w-4 h-4" /> Report this route
        </button>
      </div>
    </div>
  );
};

export default RouteDetail;
