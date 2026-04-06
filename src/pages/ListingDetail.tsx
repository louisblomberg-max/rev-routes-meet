import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Share2, MapPin, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('marketplace_listings')
      .select('*, profiles:user_id(id, display_name, username, avatar_url, created_at)')
      .eq('id', id).single()
      .then(({ data }) => { setListing(data); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background px-4 pt-12">
      <Skeleton className="h-64 w-full rounded-xl mb-4" />
      <Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-6 w-32" />
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Tag className="w-16 h-16 text-muted-foreground/30 mb-4" />
      <h2 className="text-lg font-bold mb-1">Listing not found</h2>
      <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  const isOwner = user?.id === listing.user_id;
  const seller = listing.profiles;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-12 pb-3 safe-top flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="flex-1 font-bold truncate">Listing</h1>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center"><Share2 className="w-4 h-4" /></button>
      </div>

      {listing.photos?.[0] ? (
        <img src={listing.photos[0]} alt="" className="w-full h-64 object-cover" />
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center"><Tag className="w-16 h-16 text-muted-foreground/20" /></div>
      )}

      <div className="px-4 pt-4 space-y-4">
        <div>
          <p className="text-2xl font-bold" style={{ color: '#d30d37' }}>£{listing.price?.toLocaleString() || '0'}</p>
          <h2 className="text-xl font-bold mt-1">{listing.title}</h2>
          <div className="flex gap-2 mt-2">
            {listing.category && <Badge variant="outline">{listing.category}</Badge>}
            {listing.condition && <Badge variant="secondary">{listing.condition}</Badge>}
          </div>
        </div>

        {listing.description && <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Posted {listing.created_at ? formatDistanceToNow(new Date(listing.created_at), { addSuffix: true }) : 'recently'}</span>
        </div>

        {seller && (
          <button onClick={() => navigate(`/profile/${seller.id}`)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold overflow-hidden">
              {seller.avatar_url ? <img src={seller.avatar_url} className="w-full h-full object-cover" alt="" /> : (seller.display_name || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">{seller.display_name}</p>
              <p className="text-xs text-muted-foreground">@{seller.username || '—'}</p>
            </div>
          </button>
        )}

        {!isOwner && seller && (
          <Button onClick={() => navigate(`/messages/${seller.id}`)} className="w-full h-11 rounded-xl" style={{ backgroundColor: '#d30d37' }}>
            Message Seller
          </Button>
        )}

        {isOwner && (
          <Button variant="outline" className="w-full h-11 rounded-xl text-destructive border-destructive/30"
            onClick={async () => {
              if (!confirm('Delete this listing?')) return;
              await supabase.from('marketplace_listings').delete().eq('id', listing.id);
              toast.success('Listing deleted');
              navigate(-1);
            }}>
            Delete Listing
          </Button>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
