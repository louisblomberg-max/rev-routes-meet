import { Car, Users, Route, Calendar, UsersRound, Settings, ShoppingBag, ChevronRight, Crown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Profile components
import ProfileHeaderCompact from '@/components/profile/ProfileHeaderCompact';

// Mock data
import { mockUserProfile } from '@/data/profileData';

const YouTab = () => {
  const navigate = useNavigate();

  const primaryActions = [
    { 
      id: 'garage', 
      label: 'Garage', 
      icon: Car, 
      count: 2,
      colorClass: 'bg-muted text-foreground',
      route: '/my-garage',
      description: 'vehicles'
    },
    { 
      id: 'friends', 
      label: 'Friends', 
      icon: UsersRound, 
      count: 24,
      colorClass: 'bg-muted text-foreground',
      route: '/my-friends',
      description: 'friends'
    },
    { 
      id: 'clubs', 
      label: 'Clubs', 
      icon: Users, 
      count: 3,
      colorClass: 'bg-clubs/15 text-clubs',
      route: '/clubs',
      description: 'joined'
    },
    { 
      id: 'events', 
      label: 'Events', 
      icon: Calendar, 
      count: 5,
      colorClass: 'bg-events/15 text-events',
      route: '/my-events',
      description: 'upcoming'
    },
    { 
      id: 'routes', 
      label: 'Routes', 
      icon: Route, 
      count: 8,
      colorClass: 'bg-routes/15 text-routes',
      route: '/my-routes',
      description: 'saved'
    },
    { 
      id: 'discussions', 
      label: 'Discussions', 
      icon: MessageSquare, 
      count: 12,
      colorClass: 'bg-services/15 text-services',
      route: '/my-discussions',
      description: 'posts'
    },
  ];

  const handleActionClick = (action: typeof primaryActions[0]) => {
    navigate(action.route);
  };

  return (
    <div className="h-full bg-background pb-20 flex flex-col">
      
      {/* 1. Profile Header (Compact) */}
      <div className="px-4 pt-4">
        <ProfileHeaderCompact 
          profile={mockUserProfile} 
          onTap={() => navigate('/profile')} 
        />
      </div>

      {/* 2. Plan / Subscription Card */}
      <div className="px-4 pt-3">
        <div className="bg-card rounded-xl border border-border/50 shadow-card p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-foreground">Free Plan</span>
              <p className="text-[10px] text-muted-foreground">Basic access</p>
            </div>
            <button 
              onClick={() => navigate('/upgrade')}
              className="bg-primary text-primary-foreground font-semibold py-1.5 px-3 rounded-lg hover:bg-primary/90 transition-colors text-xs active:scale-[0.98]"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Actions (2x3 Grid) */}
      <div className="px-4 pt-3 flex-1">
        <div className="grid grid-cols-3 gap-2">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="bg-card rounded-xl border border-border/50 shadow-card p-2.5 text-center hover:shadow-elevated hover:border-border transition-all duration-200 flex flex-col items-center gap-1 active:scale-[0.97] group"
              >
                <div className={`w-9 h-9 rounded-lg ${action.colorClass} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-foreground leading-tight">{action.label}</span>
                  <span className="text-[9px] text-muted-foreground">
                    {action.count} {action.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Utility (Bottom) */}
      <div className="px-4 pt-2 pb-1">
        <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden divide-y divide-border/50">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors active:bg-muted">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-foreground">RevNet Shop</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors active:bg-muted"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-semibold text-foreground">Settings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTab;