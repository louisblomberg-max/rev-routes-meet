import { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Car, 
  Bike, 
  Package, 
  CircleDot, 
  Shirt,
  Watch,
  SlidersHorizontal,
  Heart,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { mockMarketplaceListings } from '@/data/mockData';

const MarketplaceTab = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedListings, setSavedListings] = useState<string[]>([]);

  const categories = [
    { id: 'Cars', icon: Car, gradient: 'from-blue-500 to-blue-600' },
    { id: 'Bikes', icon: Bike, gradient: 'from-orange-500 to-red-500' },
    { id: 'Parts', icon: Package, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'Wheels', icon: CircleDot, gradient: 'from-purple-500 to-violet-500' },
    { id: 'Gear', icon: Shirt, gradient: 'from-pink-500 to-rose-500' },
    { id: 'Accessories', icon: Watch, gradient: 'from-amber-500 to-orange-500' },
  ];

  const filteredListings = mockMarketplaceListings
    .filter(l => !activeCategory || l.category === activeCategory)
    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleSaved = (id: string) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const featuredListing = mockMarketplaceListings[0];

  return (
    <div className="h-full bg-gradient-to-b from-muted/30 to-background overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Buy & Sell</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          </div>
          <button className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input 
              type="text"
              placeholder="Search cars, bikes, parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-14 pr-4 bg-white/95 backdrop-blur-sm border border-white/50 rounded-2xl shadow-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <button className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-sm border border-white/50 shadow-md flex items-center justify-center hover:bg-white hover:shadow-lg transition-all">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className={`flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? `bg-gradient-to-r ${cat.gradient} text-white shadow-md`
                    : 'bg-white/90 backdrop-blur-sm text-muted-foreground border border-white/50 shadow-sm hover:shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Listing */}
      {!activeCategory && !searchQuery && (
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Featured</span>
            </div>
            <button className="text-xs text-primary font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[16/9] flex items-center justify-center">
              <Car className="w-20 h-20 text-white/10" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-white">{featuredListing.price}</p>
                  <h3 className="text-sm font-medium text-white/90 mt-1">{featuredListing.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <MapPin className="w-3 h-3" />
                      <span>{featuredListing.location}</span>
                    </div>
                    {featuredListing.mileage && (
                      <span className="text-xs text-white/70">• {featuredListing.mileage}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => toggleSaved(featuredListing.id)}
                  className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                >
                  <Heart className={`w-5 h-5 ${savedListings.includes(featuredListing.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent / All Listings */}
      <div className="px-4 pt-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {activeCategory || 'Recent Listings'}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{filteredListings.length} items</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredListings.map((listing) => {
            const category = categories.find(c => c.id === listing.category);
            const Icon = category?.icon || Package;
            const isSaved = savedListings.includes(listing.id);

            return (
              <button
                key={listing.id}
                className="group bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50 shadow-md text-left hover:shadow-xl hover:scale-[1.02] active:scale-[0.99] transition-all duration-300"
              >
                {/* Image Placeholder */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center">
                  <Icon className="w-10 h-10 text-muted-foreground/20" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaved(listing.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  </button>
                  <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-gradient-to-r ${category?.gradient || 'from-gray-500 to-gray-600'} text-[10px] font-semibold text-white`}>
                    {listing.category}
                  </div>
                </div>

                {/* Details */}
                <div className="p-3">
                  <p className="text-lg font-bold text-foreground">{listing.price}</p>
                  <h3 className="text-xs font-medium text-foreground mt-1 line-clamp-2 leading-relaxed">{listing.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>{listing.location}</span>
                    {listing.mileage && (
                      <span className="ml-1">• {listing.mileage}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No listings found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Saved Items Hint */}
      {savedListings.length > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{savedListings.length} saved items</p>
                <p className="text-[10px] text-muted-foreground">Tap to view your wishlist</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceTab;
