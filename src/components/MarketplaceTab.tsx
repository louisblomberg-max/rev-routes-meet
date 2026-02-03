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
  TrendingUp,
  Clock,
  ChevronRight,
  X,
  ArrowUpDown,
  Gauge,
  Calendar,
  PoundSterling
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { mockMarketplaceListings } from '@/data/mockData';

interface MarketplaceFilters {
  priceMin: number;
  priceMax: number;
  distance: number;
  condition: string[];
  sortBy: string;
  sellerType: string | null;
  negotiable: boolean;
}

const MarketplaceTab = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedListings, setSavedListings] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    priceMin: 0,
    priceMax: 100000,
    distance: 50,
    condition: [],
    sortBy: 'newest',
    sellerType: null,
    negotiable: false,
  });

  const categories = [
    { id: 'Cars', icon: Car, gradient: 'from-blue-500 to-blue-600' },
    { id: 'Bikes', icon: Bike, gradient: 'from-orange-500 to-red-500' },
    { id: 'Parts', icon: Package, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'Wheels', icon: CircleDot, gradient: 'from-purple-500 to-violet-500' },
    { id: 'Gear', icon: Shirt, gradient: 'from-pink-500 to-rose-500' },
    { id: 'Accessories', icon: Watch, gradient: 'from-amber-500 to-orange-500' },
  ];

  const conditionOptions = [
    { id: 'new', label: 'New' },
    { id: 'like-new', label: 'Like New' },
    { id: 'excellent', label: 'Excellent' },
    { id: 'good', label: 'Good' },
    { id: 'fair', label: 'Fair' },
  ];

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'distance', label: 'Distance: Nearest' },
  ];

  const sellerTypeOptions = [
    { id: 'private', label: 'Private' },
    { id: 'dealer', label: 'Dealer' },
    { id: 'trade', label: 'Trade' },
  ];

  const toggleCondition = (conditionId: string) => {
    setFilters(prev => ({
      ...prev,
      condition: prev.condition.includes(conditionId)
        ? prev.condition.filter(c => c !== conditionId)
        : [...prev.condition, conditionId]
    }));
  };

  const activeFiltersCount = [
    filters.priceMin > 0 || filters.priceMax < 100000,
    filters.distance < 50,
    filters.condition.length > 0,
    filters.sortBy !== 'newest',
    filters.sellerType !== null,
    filters.negotiable,
  ].filter(Boolean).length;

  const filteredListings = mockMarketplaceListings
    .filter(l => !activeCategory || l.category === activeCategory)
    .filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleSaved = (id: string) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setFilters({
      priceMin: 0,
      priceMax: 100000,
      distance: 50,
      condition: [],
      sortBy: 'newest',
      sellerType: null,
      negotiable: false,
    });
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
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`relative w-12 h-12 rounded-2xl backdrop-blur-sm border shadow-md flex items-center justify-center transition-all ${
              isFiltersOpen || activeFiltersCount > 0
                ? 'bg-primary text-white border-primary'
                : 'bg-white/95 border-white/50 hover:bg-white hover:shadow-lg'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            {activeFiltersCount > 0 && !isFiltersOpen && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && (
        <div className="px-4 pt-3 animate-fade-up">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Refine Search</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset all
                </button>
                <button 
                  onClick={() => setIsFiltersOpen(false)}
                  className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PoundSterling className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">Price Range</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  £{filters.priceMin.toLocaleString()} - £{filters.priceMax.toLocaleString()}
                </span>
              </div>
              <div className="px-1">
                <Slider
                  value={[filters.priceMin, filters.priceMax]}
                  onValueChange={([min, max]) => setFilters(prev => ({ ...prev, priceMin: min, priceMax: max }))}
                  min={0}
                  max={100000}
                  step={1000}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>£0</span>
                <span>£100,000+</span>
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-foreground">Distance</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {filters.distance === 50 ? 'Nationwide' : `${filters.distance} miles`}
                </span>
              </div>
              <Slider
                value={[filters.distance]}
                onValueChange={([val]) => setFilters(prev => ({ ...prev, distance: val }))}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>5 miles</span>
                <span>Nationwide</span>
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Condition</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {conditionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => toggleCondition(option.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      filters.condition.includes(option.id)
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Sort By</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFilters(prev => ({ ...prev, sortBy: option.id }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      filters.sortBy === option.id
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground">Seller Type</p>
              </div>
              <div className="flex gap-1.5">
                {sellerTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sellerType: prev.sellerType === option.id ? null : option.id 
                    }))}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      filters.sellerType === option.id
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Negotiable Toggle */}
            <div className="flex items-center justify-between py-1">
              <p className="text-xs font-medium text-foreground">Price Negotiable</p>
              <Switch
                checked={filters.negotiable}
                onCheckedChange={(checked) => setFilters(prev => ({ ...prev, negotiable: checked }))}
              />
            </div>

            {/* Apply Button */}
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

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

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && !isFiltersOpen && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {filters.priceMax < 100000 && (
              <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap">
                Under £{filters.priceMax.toLocaleString()}
              </span>
            )}
            {filters.distance < 50 && (
              <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap">
                Within {filters.distance} miles
              </span>
            )}
            {filters.condition.length > 0 && (
              <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap">
                {filters.condition.length} condition{filters.condition.length > 1 ? 's' : ''}
              </span>
            )}
            {filters.sellerType && (
              <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium whitespace-nowrap capitalize">
                {filters.sellerType}
              </span>
            )}
            <button 
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-[10px] font-medium whitespace-nowrap hover:bg-muted/80"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Featured Listing */}
      {!activeCategory && !searchQuery && !isFiltersOpen && (
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
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
