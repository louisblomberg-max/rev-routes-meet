import { MapPin, User, Star, Route, Clock, Navigation, Bookmark, Share2, Flag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RevRoute } from '@/models';
import { toast } from 'sonner';
import { useState } from 'react';

interface RouteDetailContentProps {
  route: RevRoute;
  onNavigate: () => void;
  onViewFull: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const RouteDetailContent = ({ route, onNavigate, onViewFull, isSaved, onToggleSave }: RouteDetailContentProps) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = (route as any).photos as string[] | undefined;
  const hasPhotos = photos && photos.length > 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: route.name, text: `Check out ${route.name} on RevNet` }).catch(() => {});
    } else {
      toast.success('Link copied');
    }
  };

  const handleSave = () => {
    onToggleSave();
    toast.success(isSaved ? 'Removed from saved' : 'Saved to My Routes');
  };

  return (
    <div className="space-y-4">
      {/* Photo carousel / placeholder */}
      <div className="relative h-40 -mx-5 -mt-1 rounded-t-2xl overflow-hidden">
        {hasPhotos ? (
          <>
            <img src={photos[photoIndex]} alt={route.name} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-routes/80 to-routes/40 flex items-center justify-center">
            <Route className="w-12 h-12 text-routes-foreground/60" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 className="text-lg font-bold text-white">{route.name}</h2>
        </div>
      </div>

      {/* Uploaded by */}
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px] bg-muted">{route.createdBy?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-muted-foreground">Uploaded by <span className="font-medium text-foreground">{route.createdBy || 'Unknown'}</span></span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="bg-routes/10 text-routes border-routes/20 text-xs">
          {route.type}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {route.vehicleType === 'both' ? 'Cars & Bikes' : route.vehicleType === 'car' ? 'Cars' : 'Bikes'}
        </Badge>
        {route.difficulty && (
          <Badge variant="outline" className="text-xs capitalize">{route.difficulty}</Badge>
        )}
        {route.surfaceType && (
          <Badge variant="outline" className="text-xs capitalize">{route.surfaceType}</Badge>
        )}
      </div>

      {/* Description */}
      {route.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{route.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
          <Route className="w-4 h-4 text-routes" />
          <div>
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="text-sm font-semibold text-foreground">{route.distance}</p>
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-semibold text-foreground">
              {route.durationMinutes ? `${Math.floor(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m` : '—'}
            </p>
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          <div>
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="text-sm font-semibold text-foreground">{route.rating}/5</p>
          </div>
        </div>
        {route.elevationGain != null && (
          <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-2">
            <Flag className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Elevation</p>
              <p className="text-sm font-semibold text-foreground">{route.elevationGain}m</p>
            </div>
          </div>
        )}
      </div>

      {/* Safety tags */}
      {route.safetyTags && route.safetyTags.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Safety notes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {route.safetyTags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Route preview */}
      {route.polyline ? (
        <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Route className="w-4 h-4 text-routes" />
            <span className="text-xs font-medium text-foreground">Route visible on map</span>
          </div>
          <p className="text-xs text-muted-foreground">
            The route path is displayed on the map behind this sheet. Drag down to see it.
          </p>
          <Button variant="link" size="sm" className="text-routes mt-1 px-0" onClick={onViewFull}>
            View full route details →
          </Button>
        </div>
      ) : (
        <div className="bg-muted/30 rounded-xl p-4 text-center border border-dashed border-border">
          <Route className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Route preview not available</p>
          <Button variant="link" size="sm" className="text-routes mt-1" onClick={onViewFull}>
            View full route →
          </Button>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex gap-2">
        <Button className="flex-1 gap-2 bg-routes hover:bg-routes/90 text-white py-5" onClick={onNavigate}>
          <Navigation className="w-4 h-4" /> Start Navigation
        </Button>
      </div>

      {/* Actions row */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className={`flex-1 gap-2 ${isSaved ? 'bg-routes/10 border-routes/30 text-routes' : ''}`}
          onClick={handleSave}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-routes' : ''}`} />
          {isSaved ? 'Saved' : 'Save route'}
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" /> Share route
        </Button>
        <Button variant="outline" size="icon" className="shrink-0 h-10 w-10" onClick={() => toast('Report submitted')}>
          <Flag className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RouteDetailContent;
