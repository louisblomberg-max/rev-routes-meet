import { Users, MessageSquare, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStats } from '@/hooks/useUserStats';

const CommunityTab = () => {
  const navigate = useNavigate();
  const stats = useUserStats();

  const sections = [
    {
      id: 'clubs',
      icon: Users,
      title: 'Your Clubs',
      description: 'Join car & bike clubs and meet like-minded enthusiasts',
      iconColor: 'text-clubs',
      route: '/clubs',
    },
    {
      id: 'forums',
      icon: MessageSquare,
      title: 'Advice & Forums',
      description: 'Ask questions, share knowledge, and discuss all things automotive',
      iconColor: 'text-primary',
      route: '/forums',
    },
    {
      id: 'messages',
      icon: Mail,
      title: 'Messages',
      description: 'Private conversations with your friends and connections',
      iconColor: 'text-routes',
      route: '/messages',
    },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 safe-top">
        <h1 className="heading-display text-foreground">Community</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          Connect with fellow enthusiasts
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-4 space-y-3">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-2xl p-5 flex items-center gap-4 text-left shadow-premium hover:shadow-elevated active:scale-[0.99] transition-all duration-300 animate-card-enter"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${section.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-card-title text-foreground">{section.title}</h3>
                <p className="text-caption mt-1 leading-relaxed line-clamp-2">{section.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Your Activity */}
      <div className="px-4 mt-6">
        <p className="text-label mb-3 px-1">Your Activity</p>
        <div className="bg-card rounded-2xl p-5 shadow-premium">
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => navigate('/my-clubs')} className="text-center hover:bg-accent/50 rounded-xl py-3 transition-colors">
              <p className="text-xl font-bold text-foreground">{stats.clubsCount}</p>
              <p className="text-caption">Clubs</p>
            </button>
            <button onClick={() => navigate('/my-discussions')} className="text-center border-x border-border/30 hover:bg-accent/50 rounded-xl py-3 transition-colors">
              <p className="text-xl font-bold text-foreground">{stats.discussionsCount}</p>
              <p className="text-caption">Posts</p>
            </button>
            <button onClick={() => navigate('/my-friends')} className="text-center hover:bg-accent/50 rounded-xl py-3 transition-colors">
              <p className="text-xl font-bold text-foreground">{stats.friendsCount}</p>
              <p className="text-caption">Friends</p>
            </button>
          </div>
        </div>
      </div>

      {/* Activity Hint */}
      <div className="px-4 mt-4">
        <div className="bg-muted/60 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">5 new posts in your clubs</p>
              <p className="text-caption mt-0.5">Check out what's happening</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
