import { useState, useEffect } from 'react';
import { Search, MapPin, Car, Bike, Package, Wrench, AlertCircle, RotateCcw } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Marketplace = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('marketplace_listings')
      .select('*, profiles(username, avatar_url, display_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, []);

  const categories = [
    { id: 'Cars', icon: Car },
    { id: 'Bikes', icon: Bike },
    { id: 'Parts', icon: Package },
    { id: 'Accessories', icon: Wrench },
  ];

  const filteredListings = listings
    .filter(l => !activeCategory || l.category === activeCategory)
    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 safe-top sticky top-0 bg-background z-10">
        <div className="flex items-center gap-4 mb-4">
          <BackButton className="w-10 h-10 rounded-full bg-card shadow-sm border border-border/50" />
          <h1 className="text-xl font-bold text-foreground">Marketplace</h1>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search cars, bikes, parts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/50"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border/50">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-destructive/50 mb-3" />
            <p className="text-muted-foreground mb-4">Something went wrong</p>
            <Button variant="outline" onClick={fetchListings} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {filteredListings.map((listing) => (
                <button
                  key={listing.id}
                  className="bg-card rounded-xl overflow-hidden border border-border/50 text-left hover:border-border transition-colors"
                  onClick={() => toast.info('Listing detail view coming soon.')}
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    {listing.category === 'Cars' && <Car className="w-12 h-12 text-muted-foreground/30" />}
                    {listing.category === 'Bikes' && <Bike className="w-12 h-12 text-muted-foreground/30" />}
                    {listing.category === 'Parts' && <Package className="w-12 h-12 text-muted-foreground/30" />}
                    {!['Cars', 'Bikes', 'Parts'].includes(listing.category) && <Package className="w-12 h-12 text-muted-foreground/30" />}
                  </div>
                  <div className="p-3">
                    <p className="text-lg font-bold text-foreground">£{listing.price?.toLocaleString() || '0'}</p>
                    <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2">{listing.title}</h3>
                    {listing.profiles?.display_name && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <MapPin className="w-3 h-3" />
                        <span>{listing.profiles.display_name}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No listings found</p>
                <Button onClick={() => toast.info('Create listing coming soon')} style={{ backgroundColor: '#d30d37' }} className="text-white mt-3">
                  Sell Something
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
