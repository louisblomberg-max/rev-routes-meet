import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
 * Hook for notification badge counts.
 */
export const useNotificationBadge = () => {
  return {
    unreadMessages: 0,
    unreadNotifications: 0,
    helpAlerts: 0,
  };
};
