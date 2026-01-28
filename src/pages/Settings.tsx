import { ArrowLeft, User, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  const settingsItems = [
    { icon: User, label: 'Edit Profile', description: 'Update your name, bio, and photo' },
    { icon: Bell, label: 'Notifications', description: 'Manage push and email notifications' },
    { icon: Shield, label: 'Privacy', description: 'Control who can see your activity' },
    { icon: HelpCircle, label: 'Help & Support', description: 'FAQs and contact support' },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 pb-4 safe-top">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-4 space-y-2">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className="w-full content-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* App Info */}
      <div className="px-4 mt-8 text-center">
        <p className="text-sm text-muted-foreground">RevNet v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">Made with ❤️ for car enthusiasts</p>
      </div>
    </div>
  );
};

export default Settings;
