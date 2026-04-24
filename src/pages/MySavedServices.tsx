import { Wrench, Bookmark, Star, MapPin, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useUserSavedServices } from '@/hooks/useProfileData';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

const MySavedServices = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saved, isLoading } = useUserSavedServices();
  const { services: servicesRepo } = useData();

  const handleUnsave = (serviceId: string) => {
    servicesRepo.unsaveService(user?.id, serviceId);
    toast('Service removed from saved');
  };

  return (
    <div className="mobile-container bg-background min-h-dvh md:max-w-2xl md:mx-auto">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/30 safe-top">
        <div className="px-4 py-3 flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-xl bg-card border border-border/50 hover:bg-muted" iconClassName="w-4 h-4" onClick={() => { sessionStorage.setItem('revnet_active_tab', 'you'); navigate('/'); }} />
          <div>
            <h1 className="text-lg font-bold text-foreground">Saved Services</h1>
            <p className="text-xs text-muted-foreground">{saved.length} saved</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
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
        ) : saved.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No saved services</h3>
            <p className="text-sm text-muted-foreground mb-4">Save mechanics, detailing shops, and more for quick access</p>
            <Button variant="outline" onClick={() => navigate('/')}>Discover Services</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map(service => (
              <div key={service.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <button onClick={() => navigate(`/service/${service.id}`)} className="w-full p-4 text-left hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <Badge className="text-[10px] py-0 h-5 mb-1.5 bg-services/15 text-services">{service.category}</Badge>
                      <h3 className="font-bold text-foreground truncate">{service.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm shrink-0">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-foreground">{service.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{service.address}</span>
                  </div>
                </button>
                <div className="flex border-t border-border/30 divide-x divide-border/30">
                  <button onClick={() => navigate(`/service/${service.id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
                    <Wrench className="w-4 h-4" /> View
                  </button>
                  <button onClick={() => handleUnsave(service.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                    <Bookmark className="w-4 h-4 fill-current" /> Unsave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySavedServices;
