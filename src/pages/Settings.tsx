import { ArrowLeft, Shield, Bell, Settings2, User, Users, CreditCard, LifeBuoy, ChevronRight, LogOut, HelpCircle, BookOpen, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlan, PlanId } from '@/contexts/PlanContext';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const { currentPlan, setPlan, subscriptionStatus, setSubscriptionStatus, effectivePlan, getPlanLabel } = usePlan();

  const settingsSections = [
    {
      id: 'privacy',
      icon: Shield,
      label: 'Privacy & Safety',
      description: 'Visibility, location, blocked users',
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
      description: 'Units, map style, navigation',
      color: 'bg-routes/10',
      iconColor: 'text-routes',
    },
    {
      id: 'account',
      icon: User,
      label: 'Account',
      description: 'Profile, email, password',
      color: 'bg-muted',
      iconColor: 'text-foreground/70',
    },
    {
      id: 'billing',
      icon: CreditCard,
      label: 'Plan & Billing',
      description: 'Plan, upgrade, history',
      color: 'bg-services/10',
      iconColor: 'text-services',
    },
    {
      id: 'social',
      icon: Users,
      label: 'Social & Discovery',
      description: 'Invite, find friends, requests',
      color: 'bg-clubs/10',
      iconColor: 'text-clubs',
    },
    {
      id: 'support',
      icon: LifeBuoy,
      label: 'Support & Legal',
      description: 'Help, feedback, terms',
      color: 'bg-muted',
      iconColor: 'text-muted-foreground',
    },
    {
      id: 'faq',
      icon: HelpCircle,
      label: 'FAQ',
      description: 'Common questions answered',
      color: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      id: 'howto',
      icon: BookOpen,
      label: 'How to Use',
      description: 'Get started with RevNet',
      color: 'bg-routes/10',
      iconColor: 'text-routes',
    },
  ];

  return (
    <div className="mobile-container bg-background h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top">
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

      {/* Settings Sections */}
      <div className="px-4 pt-3">
        <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  if (section.id === 'privacy') navigate('/settings/privacy');
                  if (section.id === 'notifications') navigate('/settings/notifications');
                  if (section.id === 'preferences') navigate('/settings/preferences');
                  if (section.id === 'account') navigate('/settings/account');
                  if (section.id === 'billing') navigate('/settings/billing');
                  if (section.id === 'social') navigate('/settings/social');
                  if (section.id === 'support') navigate('/settings/support');
                  if (section.id === 'faq') navigate('/settings/faq');
                  if (section.id === 'howto') navigate('/settings/howto');
                }}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-lg ${section.color} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-[18px] h-[18px] ${section.iconColor}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{section.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{section.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Dev Plan Switcher */}
      <div className="px-4 pt-3">
        <div className="bg-card rounded-xl border border-dashed border-amber-400/60 shadow-sm overflow-hidden">
          <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Dev: Plan Switcher</span>
          </div>
          <div className="p-3 space-y-3">
            <div className="flex gap-1.5">
              {(['free', 'pro', 'club'] as PlanId[]).map((plan) => (
                <button
                  key={plan}
                  onClick={() => {
                    setPlan(plan);
                    toast.success(`Plan set to ${getPlanLabel(plan)}`);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                    currentPlan === plan
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {getPlanLabel(plan)}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Subscription active</span>
              <Switch
                checked={subscriptionStatus === 'active'}
                onCheckedChange={(checked) => {
                  setSubscriptionStatus(checked ? 'active' : 'inactive');
                  toast.success(checked ? 'Subscription activated' : 'Subscription deactivated — treated as Free');
                }}
                className="scale-90"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Effective plan: <span className="font-semibold text-foreground">{getPlanLabel(effectivePlan)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 pb-4 space-y-3">
        {/* Logout Button */}
        <button className="w-full bg-card rounded-xl border border-border/30 shadow-sm flex items-center gap-3 px-3 py-3 hover:bg-destructive/5 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-[18px] h-[18px] text-destructive" />
          </div>
          <span className="flex-1 text-left text-sm font-medium text-destructive">Log Out</span>
        </button>

        {/* App Info */}
        <div className="text-center">
          <p className="text-[11px] text-muted-foreground">RevNet v1.0.0 · Made with ❤️ for car enthusiasts</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;