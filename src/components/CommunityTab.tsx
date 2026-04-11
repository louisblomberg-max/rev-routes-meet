import { useState, useEffect } from 'react';
import { Users, MessageSquare, Mail, ChevronRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const CommunityTab = () => {
  const navigate = useNavigate();
  const [sosCount, setSosCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('help_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      setSosCount(count || 0);
    };
    fetchCount();

    const channel = supabase
      .channel('community-help-requests-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'help_requests' }, () => {
        fetchCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const sections = [
    { id: 'sos', icon: AlertTriangle, title: 'Breakdown Help', description: 'Request help or assist nearby members', color: 'bg-red-500', route: '/sos-feed', badge: sosCount },
    { id: 'clubs', icon: Users, title: 'Clubs', description: 'Discover and join automotive clubs', color: 'bg-community', route: '/clubs' },
    { id: 'forums', icon: MessageSquare, title: 'Advice & Forums', description: 'Ask questions, share insights, and discuss', color: 'bg-community', route: '/forums' },
    { id: 'messages', icon: Mail, title: 'Messages', description: 'Message friends and stay connected', color: 'bg-community', route: '/messages' },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 md:max-w-[768px] md:mx-auto" style={{ backgroundColor: 'hsl(var(--background-warm))' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 safe-top">
        <p className="text-label mb-1 text-community text-center">Your Network</p>
        <h1 className="heading-display text-foreground text-center">Community</h1>
      </div>

      {/* Navigation Sections */}
      <div className="px-4 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isSos = section.id === 'sos';
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="relative w-full bg-card rounded-xl p-4 flex items-center gap-4 text-left border border-border/50 shadow-card hover:shadow-elevated hover:border-community/30 active:scale-[0.99] transition-all duration-200"
            >
              <div className={`relative w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
                {isSos && section.badge != null && section.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-600 border-2 border-card text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {section.badge > 99 ? '99+' : section.badge}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="heading-sm text-foreground">{section.title}</h3>
                <p className="text-caption mt-0.5 leading-relaxed line-clamp-2 text-left">{section.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>

      <div className="h-4" />
    </div>
  );
};

export default CommunityTab;
