import { useState, useEffect } from 'react';
import { BarChart3, Ticket, DollarSign, CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OrganiserDashboardProps {
  eventId: string;
}

const OrganiserDashboard = ({ eventId }: OrganiserDashboardProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      const [ticketsRes, profileRes] = await Promise.all([
        supabase.from('event_tickets').select('*').eq('event_id', eventId).eq('status', 'confirmed'),
        supabase.from('profiles').select('stripe_connect_account_id').eq('id', user.id).maybeSingle(),
      ]);

      const tickets = ticketsRes.data || [];
      setTicketsSold(tickets.length);
      setGrossRevenue(tickets.reduce((sum, t) => sum + (t.ticket_price || 0), 0));
      setHasStripeAccount(!!profileRes.data?.stripe_connect_account_id);
      setLoading(false);
    };

    fetchData();
  }, [eventId, user?.id]);

  const handleConnectBank = async () => {
    setConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {
        body: { user_id: user?.id },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Failed to start bank connection');
    } finally {
      setConnecting(false);
    }
  };

  const commission = grossRevenue * 0.05;
  const payout = grossRevenue * 0.95;

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border/30 p-5 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Organiser Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/30 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Tickets Sold</span>
          </div>
          <p className="text-lg font-bold text-foreground">{ticketsSold}</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Gross Revenue</span>
          </div>
          <p className="text-lg font-bold text-foreground">£{grossRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] text-muted-foreground">RevNet Commission (5%)</span>
          </div>
          <p className="text-lg font-bold text-destructive">-£{commission.toFixed(2)}</p>
        </div>
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
          <div className="flex items-center gap-1.5 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] text-primary font-medium">Your Payout</span>
          </div>
          <p className="text-lg font-bold text-primary">£{payout.toFixed(2)}</p>
        </div>
      </div>

      {!hasStripeAccount && (
        <Button
          onClick={handleConnectBank}
          disabled={connecting}
          variant="outline"
          className="w-full gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          {connecting ? 'Connecting…' : 'Connect Bank Account'}
        </Button>
      )}
    </div>
  );
};

export default OrganiserDashboard;
