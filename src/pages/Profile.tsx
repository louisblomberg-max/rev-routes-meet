import { ArrowLeft, Route, Calendar, ShoppingBag, Users, Settings, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileAvatar from '@/components/ProfileAvatar';

const Profile = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Route, label: 'My Routes', count: 3, color: 'text-routes' },
    { icon: Calendar, label: 'My Events', count: 2, color: 'text-events' },
    { icon: ShoppingBag, label: 'My Listings', count: 1, color: 'text-foreground' },
    { icon: Users, label: 'My Clubs', count: 2, color: 'text-clubs' },
  ];

  return (
    <div className="mobile-container bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-events/10 to-background pt-4 pb-8 safe-top">
        <div className="px-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center">
          <ProfileAvatar onClick={() => {}} size="lg" />
          <h1 className="mt-4 text-xl font-bold text-foreground">Alex Johnson</h1>
          <p className="text-muted-foreground">@alexj_drives</p>
          <p className="text-sm text-muted-foreground mt-1">Member since 2024</p>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">12</p>
            <p className="text-xs text-muted-foreground">Routes Saved</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-bold text-foreground">8</p>
            <p className="text-xs text-muted-foreground">Events Attended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">156</p>
            <p className="text-xs text-muted-foreground">Forum Posts</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full content-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{item.count}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div className="px-4 mt-6 mb-8">
        <button
          onClick={() => navigate('/settings')}
          className="w-full content-card flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="font-medium text-foreground">Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Profile;
