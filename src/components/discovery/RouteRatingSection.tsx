import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RouteRatingSectionProps {
  routeId: string;
  currentRating: number;
}

const RouteRatingSection = ({ routeId, currentRating }: RouteRatingSectionProps) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!user) {
      toast.error('You must be signed in to rate a route');
      return;
    }
    const { error } = await supabase.from('route_reviews').upsert(
      { route_id: routeId, user_id: user.id, rating: userRating, review_text: null },
      { onConflict: 'route_id,user_id' }
    );
    if (error) {
      toast.error('Failed to save rating');
      return;
    }
    setSubmitted(true);
    toast.success(`Rated ${userRating}/5 — thanks!`);
  };

  return (
    <div className="bg-card rounded-2xl border border-border/30 p-5">
      <h2 className="font-semibold text-foreground mb-3">Rate this route</h2>
      {submitted ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>You rated this route {userRating}/5</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setUserRating(star)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= (hoveredStar || userRating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSubmit}
            disabled={userRating === 0}
            className="text-xs"
          >
            Submit rating
          </Button>
        </div>
      )}
    </div>
  );
};

export default RouteRatingSection;
