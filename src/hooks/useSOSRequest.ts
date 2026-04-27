import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface SOSRequestInput {
  title: string;
  description?: string | null;
  location?: string | null;
  lat: number;
  lng: number;
  urgency_level?: UrgencyLevel;
}

export function useSOSRequest() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createSOSRequest = useCallback(
    async (data: SOSRequestInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      setLoading(true);
      try {
        const { data: row, error } = await supabase
          .from('sos_requests')
          .insert({
            user_id: user.id,
            title: data.title,
            description: data.description ?? null,
            location: data.location ?? null,
            lat: data.lat,
            lng: data.lng,
            status: 'active',
            urgency_level: data.urgency_level ?? 'high',
          })
          .select('id')
          .single();
        if (error) throw error;
        return row;
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  const acceptSOSRequest = useCallback(
    async (requestId: string, requesterId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Atomic-ish: only flip if still active (no helper claimed yet).
      // Note: not truly atomic — relies on RLS + status='active' guard.
      const { data: updated, error: updErr } = await supabase
        .from('sos_requests')
        .update({ helper_id: user.id, status: 'helping' })
        .eq('id', requestId)
        .eq('status', 'active')
        .is('helper_id', null)
        .select('id')
        .single();

      if (updErr || !updated) {
        throw new Error('Someone else may have already accepted this SOS');
      }

      // Create a dedicated SOS conversation linking both parties
      const { data: convo, error: convoErr } = await supabase
        .from('conversations')
        .insert({
          sos_request_id: requestId,
          conversation_type: 'sos',
        })
        .select('id')
        .single();
      if (convoErr || !convo) throw convoErr ?? new Error('Failed to create conversation');

      const { error: partErr } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: convo.id, user_id: requesterId },
          { conversation_id: convo.id, user_id: user.id },
        ]);
      if (partErr) throw partErr;

      return convo.id;
    },
    [user?.id],
  );

  return { createSOSRequest, acceptSOSRequest, loading };
}
