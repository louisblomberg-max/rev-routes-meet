import { ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GlobalHeaderProps {
  title?: string;
  isRoot?: boolean;
  showBell?: boolean;
  rightAction?: React.ReactNode;
}

const GlobalHeader = ({ title, isRoot = false, showBell = true, rightAction }: GlobalHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id || !showBell) return;
    const load = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count || 0);
    };
    load();

    const channel = supabase.channel('header-notif-count')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, showBell]);

  return (
    <div
      className="sticky top-0 z-30 safe-top"
      style={{
        background: '#f3f3e8',
        borderBottom: '0.5px solid #e8e8e0',
      }}
    >
      <div className="flex items-center px-4" style={{ height: 52 }}>
        {/* Left */}
        <div className="w-20 flex items-center">
          {isRoot ? (
            <div className="flex items-center">
              <span style={{ fontSize: 17, fontWeight: 700, color: '#d30d37' }}>REV</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#111111' }}>NET</span>
            </div>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full btn-press"
              style={{ background: 'transparent' }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#111111' }} />
            </button>
          )}
        </div>

        {/* Center */}
        <div className="flex-1 text-center">
          {title && (
            <span style={{ fontSize: 17, fontWeight: 500, color: '#111111' }}>
              {title}
            </span>
          )}
        </div>

        {/* Right */}
        <div className="w-20 flex items-center justify-end gap-2">
          {rightAction}
          {showBell && (
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 flex items-center justify-center rounded-full btn-press"
            >
              <Bell className="w-[20px] h-[20px]" style={{ color: '#111111' }} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#d30d37',
                    color: '#ffffff',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '0 4px',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalHeader;
