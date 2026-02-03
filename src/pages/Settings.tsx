import { ArrowLeft, Shield, Bell, Settings2, User, Users, CreditCard, LifeBuoy, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

const Settings = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      id: 'privacy',
      icon: Shield,
      label: 'Privacy & Safety',
      description: 'Profile visibility, location sharing, blocked users',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      description: 'Push, email, quiet hours',
      color: 'bg-events/10',
      iconColor: 'text-events',
    },
    {
      id: 'preferences',
      icon: Settings2,
      label: 'App Preferences',
      description: 'Units, map style, navigation app',
      color: 'bg-routes/10',
      iconColor: 'text-routes',
    },
    {
      id: 'account',
      icon: User,
      label: 'Account',
      description: 'Profile, email, password, connected accounts',
      color: 'bg-muted',
      iconColor: 'text-foreground/70',
    },
    {
      id: 'social',
      icon: Users,
      label: 'Social & Discovery',
      description: 'Invite contacts, find friends, requests',
      color: 'bg-clubs/10',
      iconColor: 'text-clubs',
    },
    {
      id: 'billing',
      icon: CreditCard,
      label: 'Plan & Billing',
      description: 'Current plan, upgrade, billing history',
      color: 'bg-services/10',
      iconColor: 'text-services',
    },
    {
      id: 'support',
      icon: LifeBuoy,
      label: 'Support & Legal',
      description: 'Help, feedback, terms, about',
      color: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
  ];

  return (
    <div className="mobile-container bg-background h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 safe-top shrink-0">
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

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 pb-6">
          {/* Settings Sections */}
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg ${section.color} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground">{section.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <button className="w-full bg-card rounded-xl border border-border/30 shadow-sm flex items-center gap-3 px-4 py-3 hover:bg-destructive/5 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-destructive">Log Out</span>
          </button>

          {/* App Info */}
          <div className="pt-2 text-center">
            <p className="text-xs text-muted-foreground">RevNet v1.0.0</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Made with ❤️ for car enthusiasts</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Settings;