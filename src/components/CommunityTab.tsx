import { Users, MessageSquare, Mail, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityTab = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'clubs',
      icon: Users,
      title: 'Clubs',
      description: 'Join car & bike clubs and meet like-minded enthusiasts',
      color: 'bg-clubs',
      route: '/clubs',
    },
    {
      id: 'forums',
      icon: MessageSquare,
      title: 'Advice & Forums',
      description: 'Ask questions, share knowledge, and discuss all things automotive',
      color: 'bg-primary',
      route: '/forums',
    },
    {
      id: 'messages',
      icon: Mail,
      title: 'Messages',
      description: 'Private conversations with your friends and connections',
      color: 'bg-services',
      route: '/messages',
    },
  ];

  return (
    <div className="h-[calc(100vh-80px)] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 safe-top">
        <p className="text-label mb-0.5">Your Network</p>
        <h1 className="text-2xl font-bold text-foreground">Community</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Connect with fellow enthusiasts
        </p>
      </div>

      {/* Main Sections */}
      <div className="px-4 pt-3 space-y-2 flex-1">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-xl p-3 flex items-center gap-3 text-left border border-border/50 shadow-card hover:shadow-elevated hover:border-border active:scale-[0.99] transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-1">{section.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="px-4 pt-3">
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card">
          <p className="text-label mb-2">Your Activity</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">3</p>
              <p className="text-[10px] text-muted-foreground">Clubs</p>
            </div>
            <div className="text-center border-x border-border/50">
              <p className="text-xl font-bold text-foreground">12</p>
              <p className="text-[10px] text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">47</p>
              <p className="text-[10px] text-muted-foreground">Friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Hint */}
      <div className="px-4 pt-3 pb-1">
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">5 new posts in your clubs</p>
              <p className="text-[10px] text-muted-foreground">Check out what's happening</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;