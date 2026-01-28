import { Route, Calendar, Users, Car, MessageSquare, UserPlus, ShoppingBag, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const YouTab = () => {
  const navigate = useNavigate();

  const mainActions = [
    { id: 'events', label: 'My Events', icon: Calendar, count: 2 },
    { id: 'clubs', label: 'My Clubs', icon: Users, count: 4 },
    { id: 'routes', label: 'My Routes', icon: Route, count: 3 },
    { id: 'garage', label: 'My Garage', icon: Car, count: 2 },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, count: 7 },
  ];

  const secondaryActions = [
    { id: 'invite', label: 'Invite Friends', icon: UserPlus },
    { id: 'shop', label: 'RevNet Shop', icon: ShoppingBag },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-24">
      {/* Profile Card */}
      <div className="px-5 pt-10 pb-2">
        <button 
          onClick={() => navigate('/profile')}
          className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 text-left border border-border/30 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20">
            <span className="text-2xl font-bold text-primary">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground">Alex Morgan</h1>
            <p className="text-sm text-muted-foreground">@alexdrives</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Tap to view profile</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
        </button>
      </div>

      {/* Main Actions */}
      <div className="px-5 pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          My Activity
        </h2>
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          {mainActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-foreground/70" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                {item.count > 0 && (
                  <span className="text-sm text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">{item.count}</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Actions */}
      <div className="px-5 pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          More
        </h2>
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          {secondaryActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-foreground/70" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings - Isolated */}
      <div className="px-5 pt-8">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="flex-1 text-left font-medium text-foreground">Settings</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </button>
      </div>
    </div>
  );
};

export default YouTab;
