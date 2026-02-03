import { ArrowLeft, User, Bell, Shield, HelpCircle, ChevronRight, LogOut } from 'lucide-react';
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
    <div className="mobile-container bg-background h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 safe-top">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="px-4 flex-1">
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted/80 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="mt-4">
          <button className="w-full bg-card rounded-xl border border-border/30 shadow-sm flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-destructive">Log Out</span>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="px-4 py-4 text-center">
        <p className="text-xs text-muted-foreground">RevNet v1.0.0</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Made with ❤️ for car enthusiasts</p>
      </div>
    </div>
  );
};

export default Settings;
