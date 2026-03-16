import { useState } from 'react';
import { MapPin, Star, Clock, Phone, Globe, Navigation, Bookmark, Share2, Shield, BadgeCheck, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RevService } from '@/models';
import { toast } from 'sonner';

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface ServiceDetailContentProps {
  service: RevService;
  onNavigate: () => void;
  onViewFull?: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const ServiceDetailContent = ({ service, onNavigate, onViewFull, isSaved, onToggleSave }: ServiceDetailContentProps) => {
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([
    { id: '1', author: 'Alex M.', rating: 5, text: 'Excellent service, very professional. Would highly recommend!', date: '2 days ago' },
    { id: '2', author: 'Jordan K.', rating: 4, text: 'Great work on my car. Slightly slow but quality was top notch.', date: '1 week ago' },
  ]);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: service.name, text: `Check out ${service.name} on RevNet` }).catch(() => {});
    } else {
      toast.success('Link copied');
    }
  };

  const handleSave = () => {
    onToggleSave();
    toast.success(isSaved ? 'Removed from saved' : 'Saved to your collection');
  };

  const handleSubmitReview = () => {
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    const newReview: Review = {
      id: Date.now().toString(),
      author: 'You',
      rating: userRating,
      text: reviewText.trim(),
      date: 'Just now',
    };
    setReviews(prev => [newReview, ...prev]);
    setRatingSubmitted(true);
    setReviewText('');
    toast.success('Review submitted — thanks!');
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative h-36 -mx-5 -mt-1 rounded-t-2xl overflow-hidden">
        {service.coverImage ? (
          <img src={service.coverImage} alt={service.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-services/80 to-services/40 flex items-center justify-center">
            {service.logo ? (
              <img src={service.logo} alt={service.name} className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <MapPin className="w-12 h-12 text-services-foreground/60" />
            )}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h2 className="text-lg font-bold text-white">{service.name}</h2>
          {service.tagline && <p className="text-xs text-white/80">{service.tagline}</p>}
        </div>
      </div>

      {/* Status + category */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-services/10 text-services border-services/20 text-xs">
          {service.category}
        </Badge>
        <Badge
          variant="outline"
          className={`text-xs ${service.isOpen ? 'bg-services/10 text-services border-services/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}
        >
          {service.isOpen ? 'Open now' : 'Closed'}
        </Badge>
        {service.isVerified && (
          <Badge variant="outline" className="text-xs bg-routes/10 text-routes border-routes/20 gap-1">
            <BadgeCheck className="w-3 h-3" /> Verified
          </Badge>
        )}
        {service.insuranceVerified && (
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" /> Insured
          </Badge>
        )}
      </div>

      {/* Service types */}
      {service.serviceTypes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {service.serviceTypes.map(st => (
            <span key={st} className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">{st}</span>
          ))}
        </div>
      )}

      {/* Description */}
      {(service as any).description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{(service as any).description}</p>
      )}

      {/* Info rows */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-3 text-sm">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
          <span className="text-foreground font-medium">{service.rating}</span>
          <span className="text-muted-foreground">({service.reviewCount} reviews by RevNet users)</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{service.address}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{service.openingHours}</span>
        </div>
        {service.phone && (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <a href={`tel:${service.phone}`} className="text-foreground hover:underline">{service.phone}</a>
          </div>
        )}
      </div>

      {/* Contact buttons */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2" disabled={!service.website} onClick={() => service.website && window.open(service.website, '_blank')}>
          <Globe className="w-4 h-4" /> Website
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={onNavigate}>
          <Navigation className="w-4 h-4" /> Directions
        </Button>
      </div>

      {/* Actions row */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className={`flex-1 gap-2 ${isSaved ? 'bg-services/10 border-services/30 text-services' : ''}`}
          onClick={handleSave}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-services' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </div>

      {/* Rate this service */}
      <div className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Rate & Review</h3>
        <p className="text-[11px] text-muted-foreground">Ratings & reviews are submitted by RevNet community members</p>
        {ratingSubmitted ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>You rated this service {userRating}/5</span>
          </div>
        ) : (
          <>
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
            <Textarea
              placeholder="Write a review (optional)..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[60px] text-sm bg-background"
              maxLength={500}
            />
            <Button size="sm" onClick={handleSubmitReview} disabled={userRating === 0} className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Submit review
            </Button>
          </>
        )}
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Reviews ({reviews.length})</h3>
          {reviews.map((review) => (
            <div key={review.id} className="bg-muted/30 rounded-xl p-3 border border-border/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{review.author}</span>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`}
                  />
                ))}
              </div>
              {review.text && <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceDetailContent;
