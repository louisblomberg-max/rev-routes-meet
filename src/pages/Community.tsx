import { ArrowLeft, MessageSquare, Users, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Community = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: MessageSquare,
      title: 'Forums & Advice',
      description: 'Get help, share knowledge, discuss all things automotive',
      color: 'bg-events',
      route: '/forums',
    },
    {
      icon: Users,
      title: 'Clubs',
      description: 'Find and join local car & bike clubs',
      color: 'bg-clubs',
      route: '/clubs',
    },
    {
      icon: HelpCircle,
      title: 'Help & Questions',
      description: 'Quick answers to common questions',
      color: 'bg-routes',
      route: '/help',
    },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-6 safe-top">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Community Hub</h1>
        </div>

        <p className="text-muted-foreground">
          Connect with fellow enthusiasts, get advice, and join clubs.
        </p>
      </div>

      {/* Sections */}
      <div className="px-4 space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.title}
              onClick={() => navigate(section.route)}
              className="w-full content-card flex items-start gap-4 text-left"
            >
              <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Community Stats */}
      <div className="px-4 mt-8">
        <div className="bg-gradient-to-r from-events/10 to-routes/10 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Community Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-events">12.4K</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-routes">847</p>
              <p className="text-xs text-muted-foreground">Active Clubs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-services">34.2K</p>
              <p className="text-xs text-muted-foreground">Forum Posts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
