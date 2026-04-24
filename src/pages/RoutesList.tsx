import { useNavigate } from 'react-router-dom';
import { Route, Plus } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import AccessGuard from '@/components/AccessGuard';

const RoutesList = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container bg-background min-h-dvh">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 safe-top border-b border-border/50">
        <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" />
        <h1 className="heading-md text-foreground flex-1">Routes</h1>
        <AccessGuard featureId="create_routes" mode="lock">
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/add/route')}>
            <Plus className="w-3.5 h-3.5" />
            Create
          </Button>
        </AccessGuard>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-32 text-center">
        <div className="w-16 h-16 rounded-2xl bg-routes-muted flex items-center justify-center mb-4">
          <Route className="w-8 h-8 text-routes" />
        </div>
        <h3 className="heading-sm text-foreground mb-1">No routes yet</h3>
        <p className="text-sm text-muted-foreground max-w-[260px]">
          Community-created driving routes will show up here. Create your own or explore the map.
        </p>
      </div>
    </div>
  );
};

export default RoutesList;
