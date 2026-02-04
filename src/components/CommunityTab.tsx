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
    <div className="h-full bg-background overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6 safe-top">
        <p className="text-label mb-1">Your Network</p>
        <h1 className="heading-display text-foreground">Community</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Connect with fellow enthusiasts
        </p>
      </div>

      {/* Main Sections */}
      <div className="px-4 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-xl p-4 flex items-center gap-4 text-left border border-border/50 shadow-card hover:shadow-elevated hover:border-border active:scale-[0.99] transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="heading-sm text-foreground">{section.title}</h3>
                <p className="text-caption mt-0.5 leading-relaxed line-clamp-2">{section.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card">
          <p className="text-label mb-2">Your Activity</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xl font-black text-foreground">3</p>
              <p className="text-caption">Clubs</p>
            </div>
            <div className="text-center border-x border-border/50">
              <p className="text-xl font-black text-foreground">12</p>
              <p className="text-caption">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-foreground">47</p>
              <p className="text-caption">Friends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Hint */}
      <div className="px-4 mt-4">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">5 new posts in your clubs</p>
              <p className="text-caption mt-0.5">Check out what's happening</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTab;