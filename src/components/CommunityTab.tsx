import { Users, MessageSquare, ShoppingBag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityTab = () => {
  const navigate = useNavigate();

  const sections = [
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
      title: 'Advice & Forums',
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

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="p-6 pt-8">
        <h1 className="text-2xl font-bold text-foreground">Community</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect with fellow enthusiasts
        </p>
      </div>

      {/* Main Sections - Large Cards */}
      <div className="px-4 space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-2xl p-6 flex items-center gap-5 text-left border border-border/50 hover:border-border transition-all hover:shadow-md"
            >
              <div className={`w-14 h-14 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityTab;
