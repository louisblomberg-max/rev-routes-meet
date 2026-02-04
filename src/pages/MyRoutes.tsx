import { useState } from 'react';
import { ArrowLeft, Route, MapPin, Star, Plus, Clock, Bookmark, PenLine, ChevronRight, Navigation, Trash2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { mockRoutes } from '@/data/mockData';

// Extended mock data for user's routes
const mySavedRoutes = [
  { ...mockRoutes[0], savedAt: '2 days ago' },
  { ...mockRoutes[3], savedAt: '1 week ago' },
  { ...mockRoutes[5], savedAt: '2 weeks ago' },
];

const myCreatedRoutes = [
  {
    id: 'created1',
    name: 'South Downs Sunrise Run',
    distance: '42 miles',
    type: 'Scenic',
    vehicleType: 'both' as const,
    rating: 4.8,
    saves: 156,
    drives: 89,
    createdAt: '3 weeks ago',
  },
  {
    id: 'created2',
    name: 'Kent Coastal Loop',
    distance: '58 miles',
    type: 'Coastal',
    vehicleType: 'car' as const,
    rating: 4.6,
    saves: 78,
    drives: 45,
    createdAt: '1 month ago',
  },
];

const routeTypeColors: Record<string, string> = {
  'Scenic': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Twisty': 'bg-routes/15 text-routes',
  'Coastal': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Mixed': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const MyRoutes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedRoutes, setSavedRoutes] = useState(mySavedRoutes);
  const [createdRoutes, setCreatedRoutes] = useState(myCreatedRoutes);

  const handleUnsaveRoute = (routeId: string) => {
    setSavedRoutes(savedRoutes.filter(r => r.id !== routeId));
    toast('Route removed from saved');
  };

  const handleDeleteRoute = (routeId: string) => {
    setCreatedRoutes(createdRoutes.filter(r => r.id !== routeId));
    toast('Route deleted');
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">My Routes</h1>
              <p className="text-xs text-muted-foreground">{savedRoutes.length} saved, {createdRoutes.length} created</p>
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/add/route')}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="saved" className="gap-1.5">
              <Bookmark className="w-4 h-4" />
              Saved ({savedRoutes.length})
            </TabsTrigger>
            <TabsTrigger value="created" className="gap-1.5">
              <PenLine className="w-4 h-4" />
              Created ({createdRoutes.length})
            </TabsTrigger>
          </TabsList>

          {/* Saved Routes */}
          <TabsContent value="saved" className="mt-4 space-y-3">
            {savedRoutes.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/30 p-8 text-center">
                <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No saved routes</h3>
                <p className="text-sm text-muted-foreground mb-4">Discover and save routes you want to drive</p>
                <Button variant="outline" onClick={() => navigate('/')}>
                  Discover Routes
                </Button>
              </div>
            ) : (
              savedRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => navigate(`/route/${route.id}`)}
                    className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <Badge className={`text-[10px] py-0 h-5 mb-1.5 ${routeTypeColors[route.type] || 'bg-muted text-foreground'}`}>
                          {route.type}
                        </Badge>
                        <h3 className="font-bold text-foreground truncate">{route.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-sm shrink-0">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-foreground">{route.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Route className="w-4 h-4 text-routes" />
                        <span>{route.distance}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>Saved {route.savedAt}</span>
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex border-t border-border/30 divide-x divide-border/30">
                    <button
                      onClick={() => navigate(`/route/${route.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Start
                    </button>
                    <button
                      onClick={() => handleUnsaveRoute(route.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                      Unsave
                    </button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* Created Routes */}
          <TabsContent value="created" className="mt-4 space-y-3">
            {createdRoutes.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/30 p-8 text-center">
                <PenLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No routes created</h3>
                <p className="text-sm text-muted-foreground mb-4">Share your favorite drives with the community</p>
                <Button onClick={() => navigate('/add/route')}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Route
                </Button>
              </div>
            ) : (
              createdRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => navigate(`/route/${route.id}`)}
                    className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <Badge className={`text-[10px] py-0 h-5 mb-1.5 ${routeTypeColors[route.type] || 'bg-muted text-foreground'}`}>
                          {route.type}
                        </Badge>
                        <h3 className="font-bold text-foreground truncate">{route.name}</h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/route/${route.id}`)}>
                            View Route
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Route
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteRoute(route.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5">
                        <Route className="w-4 h-4 text-routes" />
                        <span>{route.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-foreground">{route.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{route.saves} saves</span>
                      <span>{route.drives} drives</span>
                      <span>Created {route.createdAt}</span>
                    </div>
                  </button>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyRoutes;