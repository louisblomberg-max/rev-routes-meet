/**
 * PlaceSheet — bottom sheet shown when user taps a map marker.
 * Contains: title, category badge, distance, Start Navigation, Save, Share.
 */

import { X, Navigation, Bookmark, Share2, MapPin, Calendar, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigation } from '@/contexts/NavigationContext';
import { formatDistance } from '@/services/navigationService';
import { toast } from 'sonner';

export interface PlaceItem {
  type: 'event' | 'route' | 'service' | 'club';
  id: string;
  title: string;
  lat: number;
  lng: number;
  subtitle?: string;
  rating?: number;
  date?: string;
  distance?: string;
  isOpen?: boolean;
  [key: string]: unknown;
}

interface PlaceSheetProps {
  item: PlaceItem | null;
  onClose: () => void;
  onViewFull: (type: string, id: string) => void;
}

const categoryConfig: Record<string, { label: string; colorClass: string; bgClass: string }> = {
  event: { label: 'Event', colorClass: 'text-events', bgClass: 'bg-events/10 border-events/20' },
  route: { label: 'Route', colorClass: 'text-routes', bgClass: 'bg-routes/10 border-routes/20' },
  service: { label: 'Service', colorClass: 'text-services', bgClass: 'bg-services/10 border-services/20' },
  club: { label: 'Club', colorClass: 'text-clubs', bgClass: 'bg-clubs/10 border-clubs/20' },
};

const PlaceSheet = ({ item, onClose, onViewFull }: PlaceSheetProps) => {
  const { startNavigation, status } = useNavigation();

  if (!item) return null;

  const config = categoryConfig[item.type] || categoryConfig.event;
  const isLoading = status === 'loading';

  const handleStartNavigation = async () => {
    await startNavigation({
      lat: item.lat,
      lng: item.lng,
      title: item.title,
    });
  };

  const handleSave = () => {
    toast.success('Saved to your collection');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: item.title, text: `Check out ${item.title} on RevNet` }).catch(() => {});
    } else {
      toast.success('Link copied');
    }
  };

  return (
    <div className="fixed left-0 right-0 bottom-0 z-40 animate-slide-up">
      <div className="bg-card rounded-t-2xl shadow-2xl border-t border-border/50 mx-0">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${config.bgClass} ${config.colorClass}`}>
                  {config.label}
                </span>
                {item.isOpen !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.isOpen ? 'bg-services/10 text-services' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {item.isOpen ? 'Open' : 'Closed'}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-foreground truncate">{item.title}</h2>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{item.subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            {item.distance && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {item.distance}
              </span>
            )}
            {item.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {item.date === 'TBD' ? <span className="italic">Date TBD</span> : item.date}
              </span>
            )}
            {item.rating !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                {item.rating}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleStartNavigation}
              disabled={isLoading}
              className="flex-1 gap-2 bg-routes hover:bg-routes/90 text-white py-5"
            >
              <Navigation className="w-4 h-4" />
              {isLoading ? 'Getting route…' : 'Start Navigation'}
            </Button>
            <Button
              onClick={handleSave}
              variant="outline"
              size="icon"
              className="shrink-0 h-11 w-11"
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="shrink-0 h-11 w-11"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* View full detail link */}
          <button
            onClick={() => onViewFull(item.type, item.id)}
            className="w-full mt-3 text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            View full details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceSheet;
