import { useState } from 'react';
import { Route, Star, Plus, Clock, Bookmark, PenLine, ChevronRight, Navigation, Trash2, MoreHorizontal, Lock } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useUserRoutes } from '@/hooks/useProfileData';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/contexts/PlanContext';

const routeTypeColors: Record<string, string> = {
  'Scenic': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Twisty': 'bg-routes/15 text-routes',
  'Coastal': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Mixed': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const MyRoutes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentPlan } = usePlan();
  const { saved, created, isLoading } = useUserRoutes();
  const { routes: routesRepo } = useData();
  const [activeTab, setActiveTab] = useState<'saved' | 'created'>('saved');

  const handleUnsave = (routeId: string) => {
    routesRepo.unsaveRoute(user?.id, routeId);
    toast('Route removed from saved');
  };

  const displayRoutes = activeTab === 'saved' ? saved : created;

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} />
            <div>
              <h1 className="text-lg font-bold text-foreground">My Routes</h1>
              <p className="text-xs text-muted-foreground">{saved.length} saved, {created.length} created</p>
            </div>
          </div>
          <Button size="sm" onClick={() => {
            if (currentPlan === 'free') {
              toast.info('Creating routes requires Pro Driver. Upgrade to unlock unlimited routes.', {
                action: { label: 'Upgrade', onClick: () => navigate('/subscription') },
              });
            } else {
              navigate('/add/route');
            }
          }} className="gap-1.5 rounded-lg">
            {currentPlan === 'free' && <Lock className="w-3.5 h-3.5" />}
            <Plus className="w-4 h-4" /> Create
          </Button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 pb-24">
        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1">
          <button onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'saved' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            <Bookmark className="w-4 h-4" /> Saved ({saved.length})
          </button>
          <button onClick={() => setActiveTab('created')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'created' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            <PenLine className="w-4 h-4" /> Created ({created.length})
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : displayRoutes.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">{activeTab === 'saved' ? 'No saved routes' : 'No created routes'}</h3>
            <p className="text-sm text-muted-foreground mb-4">{activeTab === 'saved' ? 'Discover and save routes you want to drive' : 'Share your favorite drives with the community'}</p>
            <Button variant="outline" onClick={() => activeTab === 'saved' ? navigate('/') : navigate('/add/route')}>
              {activeTab === 'saved' ? 'Discover Routes' : 'Create Route'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayRoutes.map(route => (
              <div key={route.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <button onClick={() => navigate('/', { state: { showRouteId: route.id } })} className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <Badge className={`text-[10px] py-0 h-5 mb-1.5 ${routeTypeColors[route.type] || 'bg-muted text-foreground'}`}>{route.type}</Badge>
                      <h3 className="font-bold text-foreground truncate">{route.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm shrink-0">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-foreground">{route.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Route className="w-4 h-4 text-routes" /><span>{route.distance}</span></div>
                    {'saves' in route && <span className="text-xs">{(route as any).saves} saves</span>}
                    {'drives' in route && <span className="text-xs">{(route as any).drives} drives</span>}
                  </div>
                </button>
                {activeTab === 'saved' && (
                  <div className="flex border-t border-border/30 divide-x divide-border/30">
                    <button onClick={() => navigate('/', { state: { showRouteId: route.id } })} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                      <Navigation className="w-4 h-4" /> Start
                    </button>
                    <button onClick={() => handleUnsave(route.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                      <Bookmark className="w-4 h-4 fill-current" /> Unsave
                    </button>
                  </div>
                )}
                {activeTab === 'created' && (
                  <div className="flex border-t border-border/30 divide-x divide-border/30">
                    <button onClick={() => navigate('/', { state: { showRouteId: route.id } })} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                      <Route className="w-4 h-4" /> View
                    </button>
                    <button onClick={() => toast.info('Route editing coming soon.')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                      <PenLine className="w-4 h-4" /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoutes;
