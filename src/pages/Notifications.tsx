import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Notifications = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 safe-top border-b border-border/50">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="heading-md text-foreground flex-1">Notifications</h1>
        <button onClick={() => navigate('/settings/notifications')} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-32 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="heading-sm text-foreground mb-1">No notifications yet</h3>
        <p className="text-sm text-muted-foreground max-w-[260px]">
          When someone interacts with you or your content, you'll see it here.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>
          Explore Discovery
        </Button>
      </div>
    </div>
  );
};

export default Notifications;
