import { Car, Users, Route, Calendar, UsersRound, Settings, ShoppingBag, ChevronRight, Crown, MessageSquare, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Profile components
import ProfileHeaderCompact from '@/components/profile/ProfileHeaderCompact';

// Mock data
import { mockUserProfile } from '@/data/profileData';

// Plan context
import { usePlan } from '@/contexts/PlanContext';

const YouTab = () => {
  const navigate = useNavigate();
  const { currentPlan, hasAccess, getPlanLabel, getRequiredPlan } = usePlan();

  const primaryActions = [
    { 
      id: 'garage', 
      label: 'My Garage', 
      icon: Car, 
      count: 2,
      colorClass: 'bg-muted text-foreground',
      route: '/my-garage',
      description: 'vehicles',
      featureId: 'garage_showcase',
    },
    { 
      id: 'friends', 
      label: 'My Friends', 
      icon: UsersRound, 
      count: 24,
      colorClass: 'bg-muted text-foreground',
      route: '/my-friends',
      description: 'friends',
      featureId: 'my_friends',
    },
    { 
      id: 'clubs', 
      label: 'My Clubs', 
      icon: Users, 
      count: 3,
      colorClass: 'bg-clubs/15 text-clubs',
      route: '/clubs',
      description: 'joined',
      featureId: 'join_clubs',
    },
    { 
      id: 'events', 
      label: 'My Events', 
      icon: Calendar, 
      count: 5,
      colorClass: 'bg-events/15 text-events',
      route: '/my-events',
      description: 'upcoming',
      featureId: 'save_events',
    },
    { 
      id: 'routes', 
      label: 'My Routes', 
      icon: Route, 
      count: 8,
      colorClass: 'bg-routes/15 text-routes',
      route: '/my-routes',
      description: 'saved',
      featureId: 'save_routes',
    },
    { 
      id: 'discussions', 
      label: 'My Discussions', 
      icon: MessageSquare, 
      count: 12,
      colorClass: 'bg-services/15 text-services',
      route: '/my-discussions',
      description: 'posts',
      featureId: 'my_discussions',
    },
  ];

  const handleActionClick = (action: typeof primaryActions[0]) => {
    if (!hasAccess(action.featureId)) {
      const required = getRequiredPlan(action.featureId);
      toast.info(`${action.label} requires ${getPlanLabel(required)}`, {
        description: 'Upgrade your plan to unlock this feature.',
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/upgrade'),
        },
      });
      return;
    }
    navigate(action.route);
  };

  return (
    <div className="h-full bg-background pb-20 flex flex-col">
      
      {/* 1. Profile Header (Compact) */}
      <div className="px-4 pt-5">
        <ProfileHeaderCompact 
          profile={mockUserProfile} 
          onTap={() => navigate('/profile')} 
        />
      </div>

      {/* 2. Plan / Subscription Card */}
      <div className="px-4 pt-4">
        <div className="bg-card rounded-xl border border-border/50 shadow-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-foreground">{getPlanLabel(currentPlan)} Plan</span>
              <p className="text-caption">
                {currentPlan === 'free' && 'Basic access to clubs, forums & routes'}
                {currentPlan === 'pro' && 'Create routes, events & live features'}
                {currentPlan === 'club' && 'Full access including club management'}
              </p>
            </div>
            {currentPlan !== 'club' && (
              <button 
                onClick={() => navigate('/upgrade')}
                className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm active:scale-[0.98]"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Primary Actions (2x3 Grid) */}
      <div className="px-4 pt-5 flex-1">
        <div className="grid grid-cols-3 gap-2.5">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            const locked = !hasAccess(action.featureId);
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`relative bg-card rounded-xl border border-border/50 shadow-card p-3 text-center hover:shadow-elevated hover:border-border transition-all duration-200 flex flex-col items-center gap-1.5 active:scale-[0.97] group ${locked ? 'opacity-60' : ''}`}
              >
                {locked && (
                  <div className="absolute top-1.5 right-1.5">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <div className={`w-11 h-11 rounded-xl ${action.colorClass} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xs font-semibold text-foreground leading-tight">{action.label}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {locked ? getPlanLabel(getRequiredPlan(action.featureId)) : `${action.count} ${action.description}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Utility (Bottom) */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden divide-y divide-border/50">
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors active:bg-muted">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-semibold text-foreground">RevNet Shop</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors active:bg-muted"
          >
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-semibold text-foreground">Settings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTab;
