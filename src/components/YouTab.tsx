import { Route, Calendar, Users, Car, MessageSquare, UserPlus, ShoppingBag, Settings, ChevronRight, UsersRound, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const YouTab = () => {
  const navigate = useNavigate();
  const [currentPlan] = useState<'free' | 'enthusiast'>('free');

  const plans = {
    free: {
      name: 'Free',
      description: 'Access clubs, forums, events, messaging, and save routes',
    },
    enthusiast: {
      name: 'Enthusiast',
      description: 'Always-on location, group drives, priority help, and more',
    },
  };

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

      {/* Plan Card */}
      <div className="px-5 pt-4">
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {currentPlan === 'enthusiast' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-events to-primary flex items-center justify-center">
                    <Crown className="w-4 h-4 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">
                    {plans[currentPlan].name} Plan
                  </h3>
                  {currentPlan === 'enthusiast' && (
                    <span className="text-xs text-events">Active</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {plans[currentPlan].description}
            </p>
            {currentPlan === 'free' ? (
              <Button 
                className="w-full bg-gradient-to-r from-events to-primary hover:opacity-90 text-primary-foreground border-0"
                onClick={() => {/* Future: navigate to upgrade flow */}}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Enthusiast
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {/* Future: navigate to plan management */}}
              >
                Manage Plan
              </Button>
            )}
          </div>
        </div>
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
