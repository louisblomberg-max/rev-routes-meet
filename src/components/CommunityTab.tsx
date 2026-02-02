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
      color: 'bg-events',
      route: '/forums',
    },
    {
      id: 'messages',
      icon: Mail,
      title: 'Messages',
      description: 'Private conversations with your friends and connections',
      color: 'bg-primary',
      route: '/messages',
    },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Community</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with fellow enthusiasts
        </p>
      </div>

      {/* Main Sections - Large Premium Cards */}
      <div className="px-5 pt-4 space-y-5">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-2xl p-6 flex items-center gap-5 text-left border border-border/30 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className={`w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{section.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/60 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityTab;
