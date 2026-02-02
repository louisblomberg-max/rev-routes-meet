import { Route, Calendar, Users, Car, MessageSquare, UserPlus, ShoppingBag, Settings, ChevronRight, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const YouTab = () => {
  const navigate = useNavigate();

  const activityItems = [
    { id: 'events', label: 'My Events', icon: Calendar, count: 2 },
    { id: 'clubs', label: 'My Clubs', icon: Users, count: 4 },
    { id: 'routes', label: 'My Routes', icon: Route, count: 3 },
    { id: 'garage', label: 'My Garage', icon: Car, count: 2 },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, count: 7 },
  ];

  const socialItems = [
    { id: 'friends', label: 'Friends', icon: UsersRound, count: 23 },
    { id: 'invite', label: 'Invite Friends', icon: UserPlus },
  ];

  const utilityItems = [
    { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
    { id: 'shop', label: 'RevNet Shop', icon: ShoppingBag },
  ];

  const quickStats = [
    { label: 'Routes', value: 12 },
    { label: 'Events', value: 8 },
    { label: 'Posts', value: 156 },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-24">
      {/* Profile Card */}
      <div className="px-5 pt-10 pb-2">
        <button 
          onClick={() => navigate('/profile')}
          className="w-full bg-card rounded-2xl p-5 text-left border border-border/30 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20">
              <span className="text-2xl font-bold text-primary">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground">Alex Morgan</h1>
              <p className="text-sm text-muted-foreground">@alexdrives</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Tap to view profile</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
          </div>
          
          {/* Quick Stats */}
          <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-3 gap-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </button>
      </div>

      {/* My Activity */}
      <div className="px-5 pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          My Activity
        </h2>
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          {activityItems.map((item) => {
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

      {/* Social */}
      <div className="px-5 pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Social
        </h2>
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          {socialItems.map((item) => {
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
                {item.count && (
                  <span className="text-sm text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">{item.count}</span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Utility */}
      <div className="px-5 pt-6 pb-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Utility
        </h2>
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          {utilityItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => item.route && navigate(item.route)}
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default YouTab;
