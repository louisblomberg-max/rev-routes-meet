import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionConfig {
  table: string;
  enabled: boolean;
  filter?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

/**
 * Real-time subscription hook using Supabase Realtime.
 */
export const useRealtimeSubscription = ({ table, enabled, filter, onInsert, onUpdate, onDelete }: SubscriptionConfig) => {
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete });
  callbacksRef.current = { onInsert, onUpdate, onDelete };

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}-${filter || 'all'}`;
    const filterObj: any = { event: '*', schema: 'public', table };
    if (filter) filterObj.filter = filter;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', filterObj, (payload) => {
        if (payload.eventType === 'INSERT') callbacksRef.current.onInsert?.(payload.new);
        if (payload.eventType === 'UPDATE') callbacksRef.current.onUpdate?.(payload.new);
        if (payload.eventType === 'DELETE') callbacksRef.current.onDelete?.(payload.old);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, enabled, filter]);
};

/**
 * Hook for notification badge counts — reads real unread counts from Supabase.
 */
export const useNotificationBadge = () => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [helpAlerts, setHelpAlerts] = useState(0);

  const fetchCounts = useCallback(async () => {
    if (!user?.id) return;

    // Unread notifications
    const { count: notifCount } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setUnreadNotifications(notifCount ?? 0);

    // Unread messages: messages in user's conversations where read_at is null and sender != user
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (participations?.length) {
      const convIds = participations.map(p => p.conversation_id);
      const { count: msgCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .is('read_at', null);
      setUnreadMessages(msgCount ?? 0);
    } else {
      setUnreadMessages(0);
    }

    // Active help requests nearby (just count active ones)
    const { count: helpCount } = await supabase
      .from('help_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');
    setHelpAlerts(helpCount ?? 0);
  }, [user?.id]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Realtime updates for notifications
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`badge-notif-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => { fetchCounts(); })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
      }, () => { fetchCounts(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchCounts]);

  return { unreadMessages, unreadNotifications, helpAlerts };
};
