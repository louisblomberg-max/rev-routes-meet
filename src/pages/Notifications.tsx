import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, isToday } from 'date-fns';
import { toast } from 'sonner';

const TYPE_EMOJI: Record<string, string> = {
  friend_request: '👥',
  event: '📅',
  club: '🏁',
  route: '🗺',
  system: '📣',
};

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, any> | null;
  read: boolean;
  created_at: string;
}

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('id, user_id, type, title, body, data, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications((data as Notification[]) || []);
    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Realtime
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`notif-rt-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const markRead = async (notif: Notification) => {
    if (!notif.read) {
      await supabase.from('notifications').update({ read: true }).eq('id', notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    // Navigate based on data
    const d = notif.data;
    if (d?.route) navigate(d.route);
    else if (d?.event) navigate(`/events/${d.event}`);
    else if (d?.club) navigate(`/clubs/${d.club}`);
    else if (d?.club_id) navigate(`/clubs/${d.club_id}`);
    else if (d?.url) navigate(d.url);
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const todayNotifs = notifications.filter(n => isToday(new Date(n.created_at)));
  const earlierNotifs = notifications.filter(n => !isToday(new Date(n.created_at)));

  const renderNotif = (notif: Notification) => {
    const emoji = TYPE_EMOJI[notif.type] || '🔔';
    return (
      <button
        key={notif.id}
        onClick={() => markRead(notif)}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
          !notif.read ? 'border-l-[3px] border-l-primary bg-primary/5' : 'border-l-[3px] border-l-transparent'
        }`}
      >
        <span className="text-xl mt-0.5 shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-foreground'}`}>{notif.title}</p>
          {notif.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>}
          <p className="text-[11px] text-muted-foreground/70 mt-1">
            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
          </p>
        </div>
        {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
      </button>
    );
  };

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 safe-top border-b border-border/50">
        <BackButton className="w-9 h-9 rounded-lg bg-card border border-border/50" iconClassName="w-4 h-4" />
        <h1 className="heading-md text-foreground flex-1">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
        <button onClick={() => navigate('/settings/notifications')} className="w-9 h-9 rounded-lg bg-card border border-border/50 flex items-center justify-center">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {isLoading ? (
        <div className="px-4 py-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">You're all caught up</h3>
          <p className="text-sm text-muted-foreground max-w-[260px]">
            No new notifications right now. Check back later!
          </p>
        </div>
      ) : (
        <div>
          {todayNotifs.length > 0 && (
            <>
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today</p>
              <div className="divide-y divide-border/30">{todayNotifs.map(renderNotif)}</div>
            </>
          )}
          {earlierNotifs.length > 0 && (
            <>
              <p className="px-4 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Earlier</p>
              <div className="divide-y divide-border/30">{earlierNotifs.map(renderNotif)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
