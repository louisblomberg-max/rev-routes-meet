import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, CheckCheck, Calendar, Users, MessageCircle, Route, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const TYPE_ICONS: Record<string, typeof Bell> = {
  event: Calendar,
  club: Users,
  message: MessageCircle,
  route: Route,
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (err) { setError(err.message); setIsLoading(false); return; }
    setNotifications(data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`notifications:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as any, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    const { error: err } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (err) { toast.error('Failed to mark as read'); return; }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All marked as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="mobile-container bg-background min-h-screen">
      {/* Header */}
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
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
          <p className="font-semibold text-foreground mb-1">Failed to load notifications</p>
          <Button variant="outline" onClick={fetchNotifications} className="mt-4 gap-2">
            <RotateCcw className="w-4 h-4" /> Retry
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No notifications yet</h3>
          <p className="text-sm text-muted-foreground max-w-[260px]">
            When someone interacts with you or your content, you'll see it here.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>
            Explore Discovery
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            return (
              <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.read ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`w-5 h-5 ${!notif.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-foreground'}`}>{notif.title}</p>
                  {notif.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>}
                  <p className="text-[11px] text-muted-foreground/70 mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
