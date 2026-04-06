import { useState, useEffect } from 'react';
import { Users, MessageSquare, Mail, ChevronRight, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStats } from '@/hooks/useUserStats';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

const CommunityTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useUserStats();
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setActivityLoading(false); return; }
    (async () => {
      try {
        const { data: friendships } = await supabase
          .from('friends')
          .select('user_id, friend_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted');
        const friendIds = (friendships || []).map(f => f.user_id === user.id ? f.friend_id : f.user_id);
        if (friendIds.length > 0) {
          const { data } = await supabase
            .from('event_attendees')
            .select('user_id, created_at, events:event_id(id, title, date_start, type), profiles:user_id(id, display_name, avatar_url)')
            .in('user_id', friendIds)
            .order('created_at', { ascending: false })
            .limit(8);
          setActivity(data || []);
        }
      } catch { /* continue */ }
      setActivityLoading(false);
    })();
  }, [user?.id]);

  const sections = [
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

      {/* Friends Activity Feed */}
      <div className="px-4 mb-4">
        {!activityLoading && activity.length === 0 && stats.friendsCount === 0 ? (
          <div className="bg-card rounded-xl p-5 border border-border/50 text-center">
            <UserPlus className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <h3 className="font-semibold text-foreground mb-1">Find your people</h3>
            <p className="text-xs text-muted-foreground mb-3">Add friends to see their activity here</p>
            <Button size="sm" onClick={() => navigate('/my-friends')} style={{ backgroundColor: '#d30d37' }} className="text-white">
              Find Friends
            </Button>
          </div>
        ) : activity.length > 0 ? (
          <div className="space-y-2">
            <p className="text-label text-community">Friend Activity</p>
            {activity.map((item: any, i: number) => (
              <button
                key={i}
                onClick={() => navigate('/', { state: { showEventId: item.events?.id } })}
                className="w-full bg-card rounded-xl p-3 flex items-center gap-3 border border-border/50 text-left hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold overflow-hidden flex-shrink-0">
                  {item.profiles?.avatar_url
                    ? <img src={item.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                    : (item.profiles?.display_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{item.profiles?.display_name}</span>
                    <span className="text-muted-foreground"> is attending </span>
                    <span className="font-medium">{item.events?.title}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Navigation Sections */}
      <div className="px-4 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => navigate(section.route)}
              className="w-full bg-card rounded-xl p-4 flex items-center gap-4 text-left border border-border/50 shadow-card hover:shadow-elevated hover:border-community/30 active:scale-[0.99] transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
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

      {/* Quick Stats */}
      <div className="px-4 mt-4">
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-card">
          <p className="text-label mb-2 text-community">Your Activity</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => navigate('/my-clubs')} className="text-center hover:bg-community-muted rounded-lg py-1 transition-colors">
              <p className="text-xl font-black text-community">{stats.clubsCount}</p>
              <p className="text-caption">Clubs</p>
            </button>
            <button onClick={() => navigate('/my-discussions')} className="text-center border-x border-border/50 hover:bg-community-muted rounded-lg py-1 transition-colors">
              <p className="text-xl font-black text-community">{stats.discussionsCount}</p>
              <p className="text-caption">Posts</p>
            </button>
            <button onClick={() => navigate('/my-friends')} className="text-center hover:bg-community-muted rounded-lg py-1 transition-colors">
              <p className="text-xl font-black text-community">{stats.friendsCount}</p>
              <p className="text-caption">Friends</p>
            </button>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
};

export default CommunityTab;
