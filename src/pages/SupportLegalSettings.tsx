import { MessageCircle, Mail, FileText, Shield, Scale, Bug, Star, ExternalLink, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SupportLegalSettings = () => {
  const navigate = useNavigate();

  const supportItems = [
    {
      icon: MessageCircle,
      label: 'Help Center',
      description: 'Browse FAQs and guides',
      action: () => navigate('/settings/faq'),
      external: false,
    },
    {
      icon: Mail,
      label: 'Contact Support',
      description: 'Get help from our team',
      action: () => { window.location.href = 'mailto:support@revnet.club'; },
      external: true,
    },
    {
      icon: Bug,
      label: 'Report a Bug',
      description: 'Let us know about issues',
      action: () => { window.location.href = 'mailto:bugs@revnet.club?subject=Bug%20Report'; },
      external: true,
    },
    {
      icon: Star,
      label: 'Send Feedback',
      description: 'Share your thoughts with us',
      action: () => { window.location.href = 'mailto:feedback@revnet.club?subject=Feedback'; },
      external: true,
    },
  ];

  const legalItems = [
    {
      icon: FileText,
      label: 'Terms of Service',
      description: 'Our terms and conditions',
      action: () => window.open('https://revnet.club/terms', '_blank'),
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      description: 'How we handle your data',
      action: () => window.open('https://revnet.club/privacy', '_blank'),
    },
    {
      icon: Scale,
      label: 'Licenses',
      description: 'Open source attributions',
      action: () => toast.info('Coming soon.'),
    },
  ];

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-3">
          <BackButton className="w-9 h-9 rounded-full bg-card shadow-sm border border-border/30" iconClassName="w-4 h-4" />
          <h1 className="text-lg font-bold text-foreground">Support & Legal</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-3 pb-6 overflow-y-auto space-y-4">
        {/* Support Section */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Support
          </p>
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
            {supportItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px] text-primary" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  {item.external ? (
                    <ExternalLink className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legal Section */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Legal
          </p>
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
            {legalItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px] text-muted-foreground" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Community Links */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 px-1">
            Community
          </p>
          <div className="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden divide-y divide-border/30">
            <button
              onClick={() => window.open('https://instagram.com/revnet_app', '_blank')}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">IG</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">Follow us on Instagram</p>
                <p className="text-xs text-muted-foreground truncate">@revnet_app</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </button>
            <button
              onClick={() => toast.info('Discord invite coming soon.')}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#5865F2] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">DC</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground leading-tight">Join our Discord</p>
                <p className="text-xs text-muted-foreground truncate">Chat with the community</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground/50 shrink-0" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-muted/50 rounded-xl p-4 text-center space-y-1">
          <p className="text-sm font-medium text-foreground">RevNet</p>
          <p className="text-xs text-muted-foreground">Version 1.0.0 (Build 100)</p>
          <p className="text-xs text-muted-foreground">© 2024 RevNet. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SupportLegalSettings;
