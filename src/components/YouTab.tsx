import { Car, Users, Route, Calendar, UsersRound, Settings, ShoppingBag, ChevronRight, Crown, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Profile components
import ProfileHeaderCompact from '@/components/profile/ProfileHeaderCompact';

// Mock data
import { mockUserProfile } from '@/data/profileData';

const YouTab = () => {
  const navigate = useNavigate();

  const primaryActions = [
    { id: 'garage', label: 'My Garage', icon: Car, colorClass: 'bg-muted text-foreground' },
    { id: 'friends', label: 'My Friends', icon: UsersRound, colorClass: 'bg-muted text-foreground' },
    { id: 'clubs', label: 'My Clubs', icon: Users, colorClass: 'bg-clubs-muted text-clubs' },
    { id: 'events', label: 'My Events', icon: Calendar, colorClass: 'bg-events-muted text-events' },
    { id: 'routes', label: 'My Routes', icon: Route, colorClass: 'bg-routes-muted text-routes' },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, colorClass: 'bg-primary/10 text-primary' },
  ];

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
              <span className="font-bold text-foreground">Free Plan</span>
              <p className="text-caption">Basic access to clubs, forums & routes</p>
            </div>
            <button 
              onClick={() => navigate('/upgrade')}
              className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm active:scale-[0.98]"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Actions (2x3 Grid) */}
      <div className="px-4 pt-5 flex-1">
        <div className="grid grid-cols-3 gap-2">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className="bg-card rounded-xl border border-border/50 shadow-card p-3 text-center hover:shadow-elevated hover:border-border transition-all duration-200 flex flex-col items-center gap-2 active:scale-[0.98]"
              >
                <div className={`w-10 h-10 rounded-lg ${action.colorClass} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xs font-semibold text-foreground leading-tight">{action.label}</span>
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