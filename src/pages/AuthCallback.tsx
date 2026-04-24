import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Signing you in…');

  useEffect(() => {
    const handle = async () => {
      try {
        await delay(1000);

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
          setMessage('Something went wrong');
          setTimeout(() => navigate('/auth', { replace: true }), 1500);
          return;
        }

        const userId = session.user.id;

        // Retry profile fetch up to 5 times to allow trigger to create it
        let profile: any = null;
        for (let i = 0; i < 5; i++) {
          const { data } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('id', userId)
            .maybeSingle();
          if (data) {
            profile = data;
            break;
          }
          if (i < 4) await delay(800);
        }

        if (!profile || !profile.onboarding_complete) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } catch {
        navigate('/auth', { replace: true });
      }
    };

    handle();
  }, [navigate]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}
