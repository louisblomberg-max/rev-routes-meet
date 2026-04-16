import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { usePlan } from '@/contexts/PlanContext';
import type { PlanId } from '@/models';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { setPlan } = usePlan();
  const [planName, setPlanName] = useState('Pro');

  useEffect(() => {
    const refreshSub = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data?.plan) {
        setPlan(data.plan as PlanId);
        const labels: Record<string, string> = { enthusiast: 'Enthusiast', business: 'Business' };
        setPlanName(labels[data.plan] || 'Pro');
      }
    };

    refreshSub();
  }, [setPlan]);

  return (
    <div className="mobile-container bg-background min-h-screen flex flex-col items-center justify-center px-6 text-center md:max-w-2xl md:mx-auto">
      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Welcome to {planName}!
      </h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-[300px]">
        Your subscription is now active. Enjoy all your new features.
      </p>
      <Button
        onClick={() => navigate('/')}
        className="h-12 px-8 text-base font-semibold rounded-full"
      >
        Go to RevNet
      </Button>
    </div>
  );
};

export default PaymentSuccess;
