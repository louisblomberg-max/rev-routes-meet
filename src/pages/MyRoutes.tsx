import { useState } from 'react';
import { Route, Star, Plus, Clock, Bookmark, PenLine, ChevronRight, Navigation, Trash2, MoreHorizontal } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

const routeTypeColors: Record<string, string> = {
  'Scenic': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Twisty': 'bg-routes/15 text-routes',
  'Coastal': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Mixed': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const MyRoutes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saved, created, isLoading } = useUserRoutes();
  const { routes: routesRepo } = useData();
  const [activeTab, setActiveTab] = useState<'saved' | 'created'>('saved');
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const handleUnsave = (routeId: string) => {
    routesRepo.unsaveRoute(user?.id, routeId);
    toast('Route removed from saved');
  };

  const handleDelete = async (routeId: string, routeName: string) => {
    if (!window.confirm(`Delete "${routeName}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('routes').delete().eq('id', routeId).eq('created_by', user?.id ?? '');
    if (error) {
      toast.error('Failed to delete route');
    } else {
      toast.success('Route deleted');
      setDeletedIds(prev => new Set([...prev, routeId]));
    }
  };

  const displayRoutes = (activeTab === 'saved' ? saved : created).filter(r => !deletedIds.has(r.id));

  return (
    <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-[#E9E6DF] border-b-2 border-[#E5E5E5] safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} />
            <div>
              <h1 className="text-lg font-bold text-foreground">My Routes</h1>
              <p className="text-xs text-muted-foreground">{saved.length} saved, {created.length} created</p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate('/add/route')} className="gap-1.5 rounded-lg">
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
                <button onClick={() => navigate('/route-map', { state: { routeId: route.id, geometry: route.geometry || route.route_data, routeName: route.name, distance: route.distance_meters ? `${(route.distance_meters / 1000).toFixed(1)} km` : null, duration: route.duration_minutes || null, difficulty: route.difficulty || null } })} className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
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
                    <button
                      onClick={() => {
                        if (route.lat && route.lng) {
                          navigate('/navigation', {
                            state: { destLat: route.lat, destLng: route.lng, destTitle: route.name, routeId: route.id }
                          });
                        } else {
                          navigate('/route-map', { state: { routeId: route.id, geometry: route.geometry || route.route_data, routeName: route.name, distance: route.distance_meters ? `${(route.distance_meters / 1000).toFixed(1)} km` : null, duration: route.duration_minutes || null, difficulty: route.difficulty || null } });
                          toast('Opening route details');
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                    >
                      <Navigation className="w-4 h-4" /> Start
                    </button>
                    <button onClick={() => handleUnsave(route.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                      <Bookmark className="w-4 h-4 fill-current" /> Unsave
                    </button>
                  </div>
                )}
                {activeTab === 'created' && (
                  <div className="flex border-t border-border/30 divide-x divide-border/30">
                    <button onClick={() => navigate('/route-map', { state: { routeId: route.id, geometry: route.geometry || route.route_data, routeName: route.name, distance: route.distance_meters ? `${(route.distance_meters / 1000).toFixed(1)} km` : null, duration: route.duration_minutes || null, difficulty: route.difficulty || null } })} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                      <Route className="w-4 h-4" /> View
                    </button>
                    <button onClick={() => navigate(`/add/route?edit=${route.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                      <PenLine className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(route.id, route.name); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
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
