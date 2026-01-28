import { Users, MessageSquare, ShoppingBag, ChevronRight, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityTab = () => {
  const navigate = useNavigate();

  const mainSections = [
    {
      id: 'clubs',
      icon: Users,
      title: 'Clubs',
      description: 'Join car & bike clubs, meet local enthusiasts',
      color: 'bg-clubs',
      route: '/clubs',
    },
    {
      id: 'forums',
      icon: MessageSquare,
      title: 'Forums & Advice',
      description: 'Get help, share knowledge, discuss all things automotive',
      color: 'bg-events',
      route: '/forums',
    },
    {
      id: 'marketplace',
      icon: ShoppingBag,
      title: 'Marketplace',
      description: 'Buy & sell cars, bikes, and parts',
      color: 'bg-services',
      route: '/marketplace',
    },
  ];

  const featuredClubs = [
    { name: 'JDM Legends UK', members: 2340, active: true },
    { name: 'Classic Car Collective', members: 1856, active: true },
    { name: 'Track Day Addicts', members: 967, active: false },
  ];

  const trendingTopics = [
    { title: 'Best mods for daily drivers?', replies: 47, category: 'Modding' },
    { title: 'Track day insurance explained', replies: 32, category: 'Track' },
    { title: 'EV conversion - worth it?', replies: 28, category: 'General' },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="p-6 pt-8">
        <h1 className="text-2xl font-bold text-foreground">Community</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with fellow enthusiasts
        </p>
      </div>

      {/* Main Sections */}
      <div className="px-4 space-y-3">
        {mainSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-xl p-4 flex items-center gap-4 text-left border border-border/50 hover:border-border transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Featured Clubs */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Popular Clubs</h2>
          <button 
            onClick={() => navigate('/clubs')}
            className="text-xs text-primary font-medium"
          >
            See all
          </button>
        </div>
        <div className="space-y-2">
          {featuredClubs.map((club, index) => (
            <div 
              key={index}
              className="bg-card rounded-lg p-3 flex items-center gap-3 border border-border/50"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{club.name}</p>
                <p className="text-xs text-muted-foreground">{club.members.toLocaleString()} members</p>
              </div>
              {club.active && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trending Discussions */}
      <div className="px-4 mt-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-events" />
            <h2 className="font-semibold text-foreground">Trending Now</h2>
          </div>
          <button 
            onClick={() => navigate('/forums')}
            className="text-xs text-primary font-medium"
          >
            See all
          </button>
        </div>
        <div className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <div 
              key={index}
              className="bg-card rounded-lg p-3 border border-border/50"
            >
              <p className="font-medium text-foreground text-sm">{topic.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {topic.category}
                </span>
                <span className="text-xs text-muted-foreground">{topic.replies} replies</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;
