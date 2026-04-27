import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface HelperProfile {
  available_to_help: boolean;
  help_radius_miles: number;
  quiet_hours_start: string; // 'HH:MM' or 'HH:MM:SS'
  quiet_hours_end: string;
  helper_rating: number;
  helper_count: number;
}

const DEFAULT_PROFILE: HelperProfile = {
  available_to_help: false,
  help_radius_miles: 5,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  helper_rating: 0,
  helper_count: 0,
};

const HELP_RADIUS_OPTIONS = [2, 5, 10, 20] as const;

const trimSeconds = (t: string | null | undefined): string => {
  if (!t) return '00:00';
  return t.length >= 5 ? t.slice(0, 5) : t;
};

export function useHelperProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HelperProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('available_to_help, help_radius_miles, quiet_hours_start, quiet_hours_end, helper_rating, helper_count')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile({
        available_to_help: data.available_to_help ?? false,
        help_radius_miles: data.help_radius_miles ?? 5,
        quiet_hours_start: trimSeconds(data.quiet_hours_start as unknown as string),
        quiet_hours_end: trimSeconds(data.quiet_hours_end as unknown as string),
        helper_rating: Number(data.helper_rating ?? 0),
        helper_count: Number(data.helper_count ?? 0),
      });
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const updateProfile = useCallback(
    async (updates: Partial<HelperProfile>) => {
      if (!user?.id) return { error: new Error('Not authenticated') };
      // Optimistic update
      setProfile((prev) => ({ ...prev, ...updates }));
      setSaving(true);
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      setSaving(false);
      if (error) {
        // Roll back by reloading from server on failure
        load();
      }
      return { error };
    },
    [user?.id, load],
  );

  return { profile, loading, saving, updateProfile, reload: load, HELP_RADIUS_OPTIONS };
}

/**
 * Check whether the given time-of-day falls inside the [start, end] window.
 * Handles wrap-around (e.g. 22:00 → 07:00 spans midnight).
 */
export function isInQuietHours(
  now: Date,
  startHHMM: string | null | undefined,
  endHHMM: string | null | undefined,
): boolean {
  const start = trimSeconds(startHHMM);
  const end = trimSeconds(endHHMM);
  if (!start || !end || start === end) return false;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  if (startMin < endMin) {
    return nowMin >= startMin && nowMin < endMin;
  }
  // Wraps midnight
  return nowMin >= startMin || nowMin < endMin;
}
