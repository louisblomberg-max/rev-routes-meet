import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Globe, Clock, Star, Bookmark, BookmarkCheck, Flag, Shield } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import NavigateButton from '@/components/NavigateButton';

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      setLoading(true);
      const [serviceRes, reviewsRes] = await Promise.all([
        supabase.from('services').select('*').eq('id', id).maybeSingle(),
        supabase.from('service_reviews').select('*, profiles(username, avatar_url, display_name)').eq('service_id', id).order('created_at', { ascending: false }),
      ]);

      if (serviceRes.error || !serviceRes.data) {
        toast.error('Service not found');
        navigate(-1);
        return;
      }
      setService(serviceRes.data);
      if (reviewsRes.error) { toast.error('Failed to load reviews'); }
      setReviews(reviewsRes.data || []);

      if (user?.id) {
        const { data: saved } = await supabase
          .from('saved_services')
          .select('service_id')
          .eq('user_id', user.id)
          .eq('service_id', id)
          .maybeSingle();
        setIsSaved(!!saved);
      }
      setLoading(false);
    };
    fetchService();
  }, [id, user?.id]);

  const toggleSave = async () => {
    if (!user?.id || !id) return;
    if (isSaved) {
      const { error } = await supabase.from('saved_services').delete().eq('user_id', user.id).eq('service_id', id);
      if (error) { toast.error('Failed to remove saved service'); return; }
      setIsSaved(false);
      toast.success('Removed from saved');
    } else {
      const { error } = await supabase.from('saved_services').insert({ user_id: user.id, service_id: id });
      if (error) { toast.error('Failed to save service'); return; }
      setIsSaved(true);
      toast.success('Service saved');
    }
  };

  if (loading) {
    return (
      <div className="mobile-container min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!service) return null;

  const avgRating = service.rating || 0;

  return (
    <div className="mobile-container min-h-screen bg-background">
      {/* Header */}
      {service.cover_url && (
        <div className="relative h-48 w-full">
          <img src={service.cover_url} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4"><BackButton /></div>
        </div>
      )}
      {!service.cover_url && (
        <div className="px-4 pt-4"><BackButton /></div>
      )}

      <div className="px-4 py-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{service.name}</h1>
          {service.tagline && <p className="text-sm text-muted-foreground mt-1">{service.tagline}</p>}
        </div>

        {/* Quick info */}
        <div className="flex flex-wrap gap-2">
          {service.types?.map((t: string) => (
            <Badge key={t} variant="secondary" className="capitalize">{t.replace(/_/g, ' ')}</Badge>
          ))}
          {service.is_24_7 && <Badge variant="outline"><Clock className="w-3 h-3 mr-1" /> 24/7</Badge>}
          {service.is_emergency && <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" /> Emergency</Badge>}
        </div>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-semibold">{avgRating}</span>
            <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
          </div>
        )}

        {/* Address */}
        {service.address && !service.hide_exact_address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm text-foreground">{service.address}</span>
          </div>
        )}

        {/* Contact */}
        <div className="flex gap-2">
          {service.phone && (
            <a href={`tel:${service.phone}`}>
              <Button variant="outline" size="sm"><Phone className="w-4 h-4 mr-1" /> Call</Button>
            </a>
          )}
          {service.website && (
            <a href={service.website} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm"><Globe className="w-4 h-4 mr-1" /> Website</Button>
            </a>
          )}
        </div>

        {/* Description */}
        {service.description && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">About</h3>
            <p className="text-sm text-muted-foreground">{service.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={toggleSave}>
            {isSaved ? <BookmarkCheck className="w-4 h-4 mr-1" /> : <Bookmark className="w-4 h-4 mr-1" />}
            {isSaved ? 'Saved' : 'Save'}
          </Button>
          {service.lat && service.lng && (
            <div className="flex-1">
              <NavigateButton
                destination={{ lat: Number(service.lat), lng: Number(service.lng), title: service.name }}
              />
            </div>
          )}
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Reviews</h3>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{review.profiles?.display_name || review.profiles?.username || 'User'}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating || 0 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  {review.body && <p className="text-xs text-muted-foreground">{review.body}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;
