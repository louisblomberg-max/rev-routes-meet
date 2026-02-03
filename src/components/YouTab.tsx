import { Settings, ShoppingBag, ChevronRight, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Profile components
import ProfileHeader from '@/components/profile/ProfileHeader';
import GarageSection from '@/components/profile/GarageSection';
import ActivitySection from '@/components/profile/ActivitySection';
import ClubsSection from '@/components/profile/ClubsSection';
import FriendsSection from '@/components/profile/FriendsSection';
import LiveFeaturesSection from '@/components/profile/LiveFeaturesSection';
import AchievementsSection from '@/components/profile/AchievementsSection';

// Mock data
import { mockUserProfile, mockActivities, mockFriends, mockClubMemberships } from '@/data/profileData';

const YouTab = () => {
  const navigate = useNavigate();

  const utilityItems = [
    { id: 'settings', label: 'Settings', icon: Settings, route: '/settings' },
    { id: 'shop', label: 'RevNet Shop', icon: ShoppingBag },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-24">
      
      {/* 1. Profile Header */}
      <div className="px-5 pt-6">
        <ProfileHeader profile={mockUserProfile} />
      </div>

      {/* 2. Garage */}
      <div className="px-5 pt-6">
        <GarageSection vehicles={mockUserProfile.garage} isOwnProfile={true} />
      </div>

      {/* Plan Card */}
      <div className="px-5 pt-6">
        <div className="bg-card rounded-2xl border border-border/30 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {mockUserProfile.plan === 'enthusiast' ? (
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
                    {mockUserProfile.plan === 'free' ? 'Free' : 'Enthusiast'} Plan
                  </h3>
                  {mockUserProfile.plan === 'enthusiast' && (
                    <span className="text-xs text-events">Active</span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {mockUserProfile.plan === 'free' 
                ? 'Access clubs, forums, events, messaging, and save routes'
                : 'Always-on location, group drives, priority help, and more'
              }
            </p>
            {mockUserProfile.plan === 'free' ? (
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

      {/* 3. Recent Activity */}
      <div className="px-5 pt-6">
        <ActivitySection activities={mockActivities} />
      </div>

      {/* 4. Clubs */}
      <div className="px-5 pt-6">
        <ClubsSection memberships={mockClubMemberships} />
      </div>

      {/* 5. Friends */}
      <div className="px-5 pt-6">
        <FriendsSection friends={mockFriends} isOwnProfile={true} />
      </div>

      {/* 6. Live Features */}
      <div className="px-5 pt-6">
        <LiveFeaturesSection liveFeatures={mockUserProfile.liveFeatures} isOwnProfile={true} />
      </div>

      {/* 7. Achievements */}
      <div className="px-5 pt-6">
        <AchievementsSection achievements={mockUserProfile.achievements} />
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
