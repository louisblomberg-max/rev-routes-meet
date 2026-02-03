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
    <div className="h-full bg-background overflow-y-auto pb-24">
      
      {/* 1. Profile Header (Compact) */}
      <div className="px-5 pt-6">
        <ProfileHeaderCompact 
          profile={mockUserProfile} 
          onTap={() => navigate('/profile')} 
        />
      </div>

      {/* 2. Plan / Subscription Card */}
      <div className="px-5 pt-4">
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Free Plan</span>
              </div>
              <p className="text-sm text-muted-foreground">Basic access to clubs, forums & routes</p>
            </div>
          </div>
          <button className="w-full mt-2 bg-primary text-primary-foreground font-medium py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* 3. Primary Actions (2x3 Grid) */}
      <div className="px-5 pt-6">
        <div className="grid grid-cols-3 gap-2.5">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className="bg-card rounded-xl border border-border/30 shadow-sm p-3.5 text-left hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* 4. Live & Safety Card */}
      <div className="px-5 pt-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Live & Safety
        </h2>
        <button className="w-full bg-card rounded-2xl border border-border/30 shadow-sm p-4 text-left hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-routes/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-routes" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Live Tools</span>
                <span className="text-xs text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full">
                  Off
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Location, Group Drives, Breakdown Help
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0" />
          </div>
          
          {/* Quick Stats Row */}
          <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Location off</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Route className="w-4 h-4" />
              <span>{mockUserProfile.liveFeatures.groupDrivesCount} drives</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>{mockUserProfile.liveFeatures.breakdownHelpCount} assists</span>
            </div>
          </div>
        </button>
      </div>


      {/* 6. Utility (Bottom) */}
      <div className="px-5 pt-6 pb-8">
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          <button
            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-medium text-foreground">RevNet Shop</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
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
