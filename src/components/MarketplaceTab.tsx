import { useState, useMemo } from 'react';
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
  PoundSterling,
  Sparkles,
  History,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
const mockMarketplaceListings: any[] = []; // TODO: wire to Supabase marketplace_listings
import { usePlan } from '@/contexts/PlanContext';
import { toast } from 'sonner';

interface MarketplaceFilters {
  priceMin: number;
  priceMax: number;
  distance: number;
  condition: string[];
  sortBy: string;
  sellerType: string | null;
  negotiable: boolean;
}
// Gated create button for marketplace
const MarketplaceCreateButton = ({ navigate }: { navigate: (path: string) => void }) => {
  const { hasAccess, getPlanLabel, getRequiredPlan } = usePlan();
  const allowed = hasAccess('create_marketplace_listing');
  
  const handleClick = () => {
    if (!allowed) {
      const required = getRequiredPlan('create_marketplace_listing');
      toast.info(`This requires ${getPlanLabel(required)}`, {
        description: 'Upgrade your plan to create listings.',
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/upgrade'),
        },
      });
      return;
    }
    toast.info('Create listing coming soon');
  };

  return (
    <button 
      onClick={handleClick}
      className={`relative w-11 h-11 rounded-xl bg-marketplace flex items-center justify-center shadow-sm hover:bg-marketplace/90 active:scale-[0.98] transition-all ${!allowed ? 'opacity-70' : ''}`}
    >
      <Plus className="w-5 h-5 text-marketplace-foreground" />
      {!allowed && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted border border-background flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
        </div>
      )}
    </button>
  );
};

const MarketplaceTab = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['BMW M3', 'Ducati', 'BBS Wheels']);
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

  const popularSearches = [
    'Porsche 911', 'Golf GTI', 'Honda CBR', 'Alloy Wheels', 'Exhaust System', 'Leather Jacket'
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

  // Enhanced search - searches across title, category, and location
  const filteredListings = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    let results = mockMarketplaceListings
      .filter(l => !activeCategory || l.category === activeCategory)
      .filter(l => {
        if (!query) return true;
        return (
          l.title.toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query) ||
          l.location.toLowerCase().includes(query) ||
          (l.mileage && l.mileage.toLowerCase().includes(query))
        );
      });

    // Apply sorting
    if (filters.sortBy === 'price-low') {
      results = [...results].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[£,]/g, ''));
        const priceB = parseInt(b.price.replace(/[£,]/g, ''));
        return priceA - priceB;
      });
    } else if (filters.sortBy === 'price-high') {
      results = [...results].sort((a, b) => {
        const priceA = parseInt(a.price.replace(/[£,]/g, ''));
        const priceB = parseInt(b.price.replace(/[£,]/g, ''));
        return priceB - priceA;
      });
    }

    return results;
  }, [searchQuery, activeCategory, filters.sortBy]);

  // Live search suggestions based on current query
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions: string[] = [];
    
    // Get matching titles
    mockMarketplaceListings.forEach(l => {
      if (l.title.toLowerCase().includes(query) && !suggestions.includes(l.title)) {
        suggestions.push(l.title);
      }
    });
    
    // Get matching categories
    categories.forEach(c => {
      if (c.id.toLowerCase().includes(query) && !suggestions.includes(c.id)) {
        suggestions.push(c.id);
      }
    });
    
    return suggestions.slice(0, 5);
  }, [searchQuery]);

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchFocused(false);
    
    // Add to recent searches
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const removeRecentSearch = (search: string) => {
    setRecentSearches(prev => prev.filter(s => s !== search));
  };

  const featuredListing = mockMarketplaceListings[0];

  return (
    <div className="h-full bg-background overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label mb-1 text-marketplace">Buy & Sell</p>
            <h1 className="heading-display text-foreground">Marketplace</h1>
          </div>
          <MarketplaceCreateButton navigate={navigate} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-2 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search by name, category, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full h-11 pl-11 pr-10 bg-card border border-border/50 rounded-lg shadow-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-marketplace/30 focus:border-marketplace/50 transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-muted flex items-center justify-center hover:bg-border"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <button 
            onClick={() => {
              setIsFiltersOpen(!isFiltersOpen);
              setIsSearchFocused(false);
            }}
            className={`relative w-11 h-11 rounded-lg border shadow-card flex items-center justify-center transition-all ${
              isFiltersOpen || activeFiltersCount > 0
                ? 'bg-marketplace text-marketplace-foreground border-marketplace'
                : 'bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFiltersCount > 0 && !isFiltersOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-marketplace text-marketplace-foreground text-2xs font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Dropdown */}
        {isSearchFocused && !isFiltersOpen && (
          <div className="absolute left-4 right-4 top-14 z-30 bg-card border border-border/50 rounded-xl shadow-elevated overflow-hidden animate-fade-up">
            {/* Live Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="p-3 border-b border-border/50">
                <p className="text-label mb-2">Suggestions</p>
                {searchSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="p-3 border-b border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Recent</p>
                  <button 
                    onClick={() => setRecentSearches([])}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                </div>
                {recentSearches.map((search, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <button
                      onClick={() => handleSearch(search)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <History className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{search}</span>
                    </button>
                    <button 
                      onClick={() => removeRecentSearch(search)}
                      className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {!searchQuery && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Popular</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-1.5 rounded-lg bg-muted/60 text-xs text-muted-foreground hover:bg-marketplace/10 hover:text-marketplace transition-all"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Category Search */}
            {!searchQuery && (
              <div className="p-3 bg-muted/30 border-t border-border/30">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Browse by Category</p>
                <div className="grid grid-cols-3 gap-2">
                  {categories.slice(0, 6).map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setIsSearchFocused(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/80 hover:bg-white hover:shadow-md transition-all"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground">{cat.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backdrop when search is focused */}
        {isSearchFocused && (
          <div 
            className="fixed inset-0 bg-black/20 z-20" 
            onClick={() => setIsSearchFocused(false)}
          />
        )}
      </div>

      {/* Active Search Indicator */}
      {searchQuery && !isSearchFocused && (
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between bg-marketplace/10 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-marketplace" />
              <span className="text-sm text-marketplace font-medium">
                Searching: "{searchQuery}"
              </span>
            </div>
            <button 
              onClick={clearSearch}
              className="text-xs text-marketplace hover:text-marketplace/80 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}

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
                        ? 'bg-marketplace text-white'
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
                        ? 'bg-marketplace text-white'
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
                        ? 'bg-marketplace text-white'
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
              className="w-full py-3 rounded-xl text-sm font-semibold bg-marketplace text-white hover:bg-marketplace/90 transition-colors shadow-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Category Chips */}
      {!isSearchFocused && (
        <div className="px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.id)}
                  className={`flex items-center gap-2 px-4 h-10 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap border ${
                    isActive
                      ? 'bg-marketplace text-marketplace-foreground border-marketplace shadow-sm'
                      : 'bg-card text-muted-foreground border-border/50 hover:border-border hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && !isFiltersOpen && !isSearchFocused && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {filters.priceMax < 100000 && (
              <span className="px-3 py-1.5 rounded-lg bg-marketplace/10 text-marketplace text-[10px] font-medium whitespace-nowrap">
                Under £{filters.priceMax.toLocaleString()}
              </span>
            )}
            {filters.distance < 50 && (
              <span className="px-3 py-1.5 rounded-lg bg-marketplace/10 text-marketplace text-[10px] font-medium whitespace-nowrap">
                Within {filters.distance} miles
              </span>
            )}
            {filters.condition.length > 0 && (
              <span className="px-3 py-1.5 rounded-lg bg-marketplace/10 text-marketplace text-[10px] font-medium whitespace-nowrap">
                {filters.condition.length} condition{filters.condition.length > 1 ? 's' : ''}
              </span>
            )}
            {filters.sellerType && (
              <span className="px-3 py-1.5 rounded-lg bg-marketplace/10 text-marketplace text-[10px] font-medium whitespace-nowrap capitalize">
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
      {featuredListing && !activeCategory && !searchQuery && !isFiltersOpen && !isSearchFocused && (
        <div className="px-4 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Featured</span>
            </div>
            <button className="text-xs text-marketplace font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="relative bg-foreground rounded-xl overflow-hidden shadow-elevated">
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

      {/* Results Count & Sort */}
      {!isSearchFocused && (
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {activeCategory || (searchQuery ? 'Search Results' : 'Recent Listings')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{filteredListings.length} items</span>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {!isSearchFocused && (
        <div className="px-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            {filteredListings.map((listing) => {
              const category = categories.find(c => c.id === listing.category);
              const Icon = category?.icon || Package;
              const isSaved = savedListings.includes(listing.id);

              return (
                <button
                  key={listing.id}
                  className="group bg-card rounded-xl overflow-hidden border border-border/50 shadow-card text-left hover:shadow-elevated hover:border-border active:scale-[0.99] transition-all duration-200"
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
                <Search className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Try a different search or adjust filters</p>
              <button 
                onClick={() => {
                  clearSearch();
                  setActiveCategory(null);
                  resetFilters();
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-marketplace text-white text-sm font-medium hover:bg-marketplace/90 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Saved Items Hint */}
      {savedListings.length > 0 && !isSearchFocused && (
        <div className="fixed bottom-24 left-4 right-4 z-10">
          <div className="bg-card border border-border/50 rounded-xl p-4 shadow-elevated flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-marketplace flex items-center justify-center">
                <Heart className="w-5 h-5 text-marketplace-foreground fill-current" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{savedListings.length} saved items</p>
                <p className="text-caption">Tap to view your wishlist</p>
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
