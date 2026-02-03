import { Car, Users, Route, Calendar, UsersRound, MapPin, Shield, Settings, ShoppingBag, ChevronRight, Crown, Sparkles, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Profile components
import ProfileHeaderCompact from '@/components/profile/ProfileHeaderCompact';

// Mock data
import { mockUserProfile } from '@/data/profileData';

const YouTab = () => {
  const navigate = useNavigate();

  const primaryActions = [
    { id: 'garage', label: 'My Garage', icon: Car, color: 'bg-muted/80', iconColor: 'text-foreground/70' },
    { id: 'friends', label: 'My Friends', icon: UsersRound, color: 'bg-muted/80', iconColor: 'text-foreground/70' },
    { id: 'clubs', label: 'My Clubs', icon: Users, color: 'bg-clubs/10', iconColor: 'text-clubs' },
    { id: 'events', label: 'My Events', icon: Calendar, color: 'bg-events/10', iconColor: 'text-events' },
    { id: 'routes', label: 'My Routes', icon: Route, color: 'bg-routes/10', iconColor: 'text-routes' },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, color: 'bg-primary/10', iconColor: 'text-primary' },
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
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <span className="font-semibold text-foreground">Free Plan</span>
              <p className="text-sm text-muted-foreground">Basic access to clubs, forums & routes</p>
            </div>
            <button className="bg-primary text-primary-foreground font-medium py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5 text-sm">
              <Crown className="w-4 h-4" />
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {/* 3. Primary Actions (2x3 Grid) */}
      <div className="px-4 pt-5 flex-1">
        <div className="grid grid-cols-3 gap-3">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className="bg-card rounded-xl border border-border/30 shadow-sm p-4 text-left hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2"
              >
                <div className={`w-11 h-11 rounded-lg ${action.color} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Utility (Bottom) */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center">
              <ShoppingBag className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-medium text-foreground">RevNet Shop</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center">
              <Settings className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-medium text-foreground">Settings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTab;
