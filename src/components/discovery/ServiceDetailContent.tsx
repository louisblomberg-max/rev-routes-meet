import { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, Globe, Navigation, Bookmark, Share2, Shield, BadgeCheck, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RevService } from '@/models';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServiceDetailContentProps {
  service: RevService;
  onNavigate: () => void;
  onViewFull?: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const ServiceDetailContent = ({ service, onNavigate, onViewFull, isSaved, onToggleSave }: ServiceDetailContentProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const serviceId = (service as any).id;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id || null));
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    supabase.from('service_reviews')
      .select('*, profiles:user_id(display_name, avatar_url)')
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews(data || []);
        if (currentUserId) {
          const own = (data || []).find((r: any) => r.user_id === currentUserId);
          if (own) { setUserReview(own); setReviewRating(own.rating || 0); setReviewText(own.body || ''); }
        }
      });
  }, [serviceId, currentUserId]);

  const handleSubmitReview = async () => {
    if (!currentUserId || !serviceId || reviewRating === 0) { toast.error('Please select a rating'); return; }
    setIsSubmittingReview(true);
    try {
      if (userReview) {
        await supabase.from('service_reviews').update({ rating: reviewRating, body: reviewText.trim() || null }).eq('id', userReview.id);
      } else {
        await supabase.from('service_reviews').insert({ service_id: serviceId, user_id: currentUserId, rating: reviewRating, body: reviewText.trim() || null });
      }
      const { data } = await supabase.from('service_reviews')
        .select('*, profiles:user_id(display_name, avatar_url)')
        .eq('service_id', serviceId).order('created_at', { ascending: false });
      setReviews(data || []);
      setUserReview((data || []).find((r: any) => r.user_id === currentUserId) || null);
      toast.success(userReview ? 'Review updated' : 'Review submitted');
    } catch (err: any) { toast.error(err.message || 'Failed'); }
    finally { setIsSubmittingReview(false); }
  };

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

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative h-36 -mx-5 -mt-1 rounded-t-2xl overflow-hidden">
        {((service as any).cover_url || service.coverImage) ? (
          <img src={(service as any).cover_url || service.coverImage} alt={service.name} className="w-full h-full object-cover" />
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
          {((service as any).tagline || service.tagline) && <p className="text-xs text-white/80">{(service as any).tagline || service.tagline}</p>}
        </div>
      </div>

      {/* Status + category */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-services/10 text-services border-services/20 text-xs">
          {(service as any).category || (service as any).service_type || 'Service'}
        </Badge>
        {(service as any).is_24_7 && (
          <Badge variant="outline" className="text-xs bg-services/10 text-services border-services/20">24/7</Badge>
        )}
        {(service as any).is_emergency && (
          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">Emergency Service</Badge>
        )}
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
        {avgRating && (
          <div className="flex items-center gap-3 text-sm">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
            <span className="text-foreground font-medium">{avgRating}</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{service.address}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground">{service.openingHours || ((service as any).is_24_7 ? 'Open 24/7' : 'See hours')}</span>
        </div>
        {((service as any).phone || service.phone) && (
          <a href={`tel:${((service as any).phone || service.phone).replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-blue-600 font-medium">
            <Phone className="w-4 h-4 shrink-0" />
            {(service as any).phone || service.phone}
          </a>
        )}
      </div>

      {/* Contact buttons */}
      <div className="flex gap-2">
        {((service as any).phone || service.phone) && (
          <Button variant="outline" className="flex-1 gap-2" onClick={() => {
            const phone = (service as any).phone || service.phone;
            if (phone) window.location.href = `tel:${phone.replace(/\s/g, '')}`;
          }}>
            <Phone className="w-4 h-4" /> Call
          </Button>
        )}
        <Button variant="outline" className="flex-1 gap-2" disabled={!((service as any).website || service.website)} onClick={() => {
          const website = (service as any).website || service.website;
          if (website) {
            const url = website.startsWith('http') ? website : `https://${website}`;
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }}>
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

      {/* Reviews — real DB */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">Reviews</h3>
          {reviews.length > 0 && <span className="text-xs text-muted-foreground">{avgRating} ({reviews.length})</span>}
        </div>

        {currentUserId && (
          <div className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-2">
            <p className="text-xs font-semibold">{userReview ? 'Edit your review' : 'Write a review'}</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)}>
                  <Star className={`w-6 h-6 ${s <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..."
              className="w-full text-xs border border-border/30 rounded-lg px-3 py-2 bg-background resize-none min-h-[60px]" />
            <button onClick={handleSubmitReview} disabled={isSubmittingReview || reviewRating === 0}
              className="w-full py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: '#ff8000' }}>
              {isSubmittingReview ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        )}

        {reviews.length === 0 && <p className="text-xs text-muted-foreground text-center py-3">No reviews yet</p>}
        {reviews.filter(r => r.user_id !== currentUserId).slice(0, 5).map(r => (
          <div key={r.id} className="flex gap-3 p-3 rounded-xl bg-card border border-border/30">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="w-full h-full flex items-center justify-center text-xs font-bold">{r.profiles?.display_name?.[0] || '?'}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold truncate">{r.profiles?.display_name || 'Member'}</p>
                <div className="flex flex-shrink-0">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/20'}`} />)}</div>
              </div>
              {r.body && <p className="text-xs text-muted-foreground mt-0.5">{r.body}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceDetailContent;
