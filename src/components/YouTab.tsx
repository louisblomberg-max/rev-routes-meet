import { Route, Calendar, Store, Users, MessageSquare, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from './ProfileAvatar';

const YouTab = () => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'routes', label: 'My Routes', icon: Route, count: 3 },
    { id: 'events', label: 'My Events', icon: Calendar, count: 2 },
    { id: 'listings', label: 'My Listings', icon: Store, count: 1 },
    { id: 'clubs', label: 'My Clubs', icon: Users, count: 4 },
    { id: 'discussions', label: 'My Discussions', icon: MessageSquare, count: 7 },
  ];

  return (
    <div className="h-full bg-background overflow-y-auto pb-20">
      {/* Header */}
      <div className="p-6 pt-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <ProfileAvatar size="lg" onClick={() => {}} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Alex Morgan</h1>
            <p className="text-sm text-muted-foreground">@alexdrives</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
              {item.count > 0 && (
                <span className="text-sm text-muted-foreground">{item.count}</span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div className="px-4 mt-6 pt-6 border-t border-border">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="flex-1 text-left font-medium text-foreground">Settings</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default YouTab;
