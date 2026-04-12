import { Star, Route, Clock, Navigation, Bookmark, Share2 } from 'lucide-react';
import { RevRoute } from '@/models';
import { toast } from 'sonner';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface RouteDetailContentProps {
  route: RevRoute;
  onNavigate: () => void;
  onViewFull: () => void;
  onClose?: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

const RouteDetailContent = ({ route, onNavigate, onClose, isSaved, onToggleSave }: RouteDetailContentProps) => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [dbPhotos, setDbPhotos] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const cleanupBodyStyles = () => {
    setTimeout(() => {
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.removeAttribute('data-scroll-locked');
      document.body.removeAttribute('style');
      const drawer = document.querySelector('[data-vaul-drawer]') as HTMLElement;
      if (drawer) {
        drawer.style.pointerEvents = 'auto';
        drawer.style.touchAction = 'auto';
        drawer.style.removeProperty('pointer-events');
        drawer.style.removeProperty('touch-action');
      }
    }, 50);
  };

  useEffect(() => {
    if (!showGallery) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowGallery(false);
        cleanupBodyStyles();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showGallery]);

  const data = route as any;
  const propsPhotos: string[] = data.photos || [];
  const geometry = data.geometry || data.route_data;
  const routeId = data.id || route.id;

  // Fetch photos directly from DB to bypass any data passing issues
  useEffect(() => {
    if (!routeId) return;
    supabase
      .from('routes')
      .select('photos')
      .eq('id', routeId)
      .single()
      .then(({ data: d }) => {
        if (d?.photos && d.photos.length > 0) {
          setDbPhotos(d.photos);
        }
      });
  }, [routeId]);

  const photos = dbPhotos.length > 0 ? dbPhotos : propsPhotos;



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

  return (
    <div className="space-y-3">
      {/* Mobile: show 2 square photos. Desktop (md+): show 3 square photos */}
      {photos.length >= 1 && (
        <>
          {/* Mobile — 2 photos */}
          <div className="md:hidden">
            {photos.length === 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                <div style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                </div>
                <div style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={photos[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                </div>
              </div>
            )}
          </div>

          {/* Desktop — 3 photos */}
          <div className="hidden md:block">
            {photos.length === 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                <div style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={photos[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                </div>
              </div>
            ) : photos.length === 2 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {photos.slice(0, 2).map((p, i) => (
                  <div key={i} style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {photos.slice(0, 3).map((p, i) => (
                  <div key={i} style={{ aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* View all button — Mobile: show if 3+ photos. Desktop: show if 4+ photos */}
      {photos.length > 2 && (
        <button
          className="md:hidden"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setGalleryIndex(0); setShowGallery(true); }}
          style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: 600, color: '#4f7fff', border: '1px solid rgba(79,127,255,0.2)', borderRadius: '12px', background: 'rgba(79,127,255,0.05)', cursor: 'pointer' }}
        >
          View all {photos.length} photos
        </button>
      )}
      {photos.length > 3 && (
        <button
          className="hidden md:block"
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); setGalleryIndex(0); setShowGallery(true); }}
          style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: 600, color: '#4f7fff', border: '1px solid rgba(79,127,255,0.2)', borderRadius: '12px', background: 'rgba(79,127,255,0.05)', cursor: 'pointer' }}
        >
          View all {photos.length} photos
        </button>
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
          <button
            onClick={() => navigate('/route-map', {
              state: {
                geometry,
                routeName: route.name,
                distance: data.distance_meters ? `${(data.distance_meters / 1000).toFixed(1)} km` : null,
                duration: data.duration_minutes || null,
                difficulty: route.difficulty || null,
              }
            })}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-routes/30 bg-routes/5 text-routes flex items-center justify-center gap-1.5"
          >
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

      {/* Full screen photo gallery */}
      {showGallery && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, background: '#000', display: 'flex', flexDirection: 'column', pointerEvents: 'all' }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', paddingTop: 'max(48px, env(safe-area-inset-top))', background: 'rgba(0,0,0,0.9)', flexShrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setShowGallery(false); cleanupBodyStyles(); }}
              style={{ color: 'white', background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ← Back
            </button>
            <span style={{ color: 'white', fontSize: '13px' }}>{galleryIndex + 1} / {photos.length}</span>
            <span style={{ width: '60px' }} />
          </div>

          {/* Main photo area */}
          <div
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
            onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (diff > 50 && galleryIndex < photos.length - 1) setGalleryIndex(prev => prev + 1);
              if (diff < -50 && galleryIndex > 0) setGalleryIndex(prev => prev - 1);
            }}
          >
            <img
              key={`photo-${galleryIndex}`}
              src={photos[galleryIndex]}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
              alt=""
            />
            {galleryIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setGalleryIndex(prev => prev - 1); }}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'all', WebkitTapHighlightColor: 'transparent' }}
              >‹</button>
            )}
            {galleryIndex < photos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setGalleryIndex(prev => prev + 1); }}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'all', WebkitTapHighlightColor: 'transparent' }}
              >›</button>
            )}
          </div>

          {/* Thumbnail strip */}
          <div
            ref={galleryScrollRef}
            style={{ display: 'flex', gap: '6px', padding: '10px 16px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))', background: 'rgba(0,0,0,0.9)', overflowX: 'auto', flexShrink: 0, WebkitOverflowScrolling: 'touch' }}
          >
            {photos.map((p, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setGalleryIndex(i); }}
                style={{ flexShrink: 0, width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', border: i === galleryIndex ? '2px solid #4f7fff' : '2px solid rgba(255,255,255,0.2)', padding: 0, cursor: 'pointer', background: 'none' }}
              >
                <img src={p} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RouteDetailContent;
