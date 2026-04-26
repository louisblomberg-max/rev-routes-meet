import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDeepLinkAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = async (event: URLOpenListenerEvent) => {
      const raw = event.url;
      if (!raw || !raw.startsWith('com.revnet.app://auth/callback')) return;

      const url = new URL(raw);
      const code = url.searchParams.get('code');
      const errorDesc = url.searchParams.get('error_description') ?? url.searchParams.get('error');

      try {
        if (errorDesc) throw new Error(errorDesc);

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const hash = raw.split('#')[1];
          if (hash) {
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              if (error) throw error;
            }
          }
        }

        navigate('/auth/callback', { replace: true });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Sign-in failed');
        navigate('/auth', { replace: true });
      } finally {
        try { await Browser.close(); } catch { /* browser may already be closed */ }
      }
    };

    const listenerPromise = App.addListener('appUrlOpen', handler);
    return () => {
      listenerPromise.then(l => l.remove()).catch(() => {});
    };
  }, [navigate]);
}
