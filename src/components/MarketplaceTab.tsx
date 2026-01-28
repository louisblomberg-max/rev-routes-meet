import { useState } from 'react';
import { Search, MapPin, Car, Bike, Package, Wrench, CircleDot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { mockMarketplaceListings } from '@/data/mockData';

const MarketplaceTab = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'Cars', icon: Car },
    { id: 'Bikes', icon: Bike },
    { id: 'Parts', icon: Package },
    { id: 'Wheels', icon: CircleDot },
    { id: 'Gear', icon: Wrench },
    { id: 'Accessories', icon: Wrench },
  ];

  const filteredListings = mockMarketplaceListings
    .filter(l => !activeCategory || l.category === activeCategory)
    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="px-5 pt-10 pb-2">
        <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Buy & sell cars, bikes, and parts
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-5 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search cars, bikes, parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border/30 rounded-xl h-11"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-5 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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

      {/* Listings Grid */}
      <div className="px-5 pt-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {filteredListings.map((listing) => (
            <button
              key={listing.id}
              className="bg-card rounded-xl overflow-hidden border border-border/30 text-left hover:shadow-md transition-all"
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                {listing.category === 'Cars' && <Car className="w-10 h-10 text-muted-foreground/30" />}
                {listing.category === 'Bikes' && <Bike className="w-10 h-10 text-muted-foreground/30" />}
                {listing.category === 'Parts' && <Package className="w-10 h-10 text-muted-foreground/30" />}
                {listing.category === 'Wheels' && <CircleDot className="w-10 h-10 text-muted-foreground/30" />}
                {listing.category === 'Gear' && <Wrench className="w-10 h-10 text-muted-foreground/30" />}
                {listing.category === 'Accessories' && <Wrench className="w-10 h-10 text-muted-foreground/30" />}
              </div>

              {/* Details */}
              <div className="p-3">
                <p className="text-base font-bold text-foreground">{listing.price}</p>
                <h3 className="text-sm font-medium text-foreground mt-1 line-clamp-2">{listing.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <MapPin className="w-3 h-3" />
                  <span>{listing.location}</span>
                </div>
                {listing.mileage && (
                  <p className="text-xs text-muted-foreground/70 mt-1">{listing.mileage}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceTab;
