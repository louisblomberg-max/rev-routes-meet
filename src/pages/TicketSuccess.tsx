import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Check, Share2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const TicketSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ticketId = searchParams.get('ticket_id');
  const isFreePass = searchParams.get('type') === 'free';
  const freeEventId = searchParams.get('event_id');
  const freeToken = searchParams.get('token');

  const [ticket, setTicket] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [vehicle, setVehicle] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticketId) { setLoading(false); return; }
    const load = async () => {
      if (isFreePass && freeEventId && freeToken) {
        // Free attendee pass
        const { data: e } = await supabase.from('events').select('id, title, date_start, date_end, location, banner_url').eq('id', freeEventId).single();
        setEvent(e);
        setTicket({ id: 'free', amount_paid: 0, qr_code_token: freeToken });
        const url = await QRCode.toDataURL(freeToken, { width: 200, margin: 2 });
        setQrDataUrl(url);
        setLoading(false);
        return;
      }

      // Paid ticket
      const { data: t } = await supabase.from('event_tickets').select('*').eq('id', ticketId).single();
      if (!t) { setLoading(false); return; }
      setTicket(t);

      const { data: e } = await supabase.from('events').select('id, title, date_start, date_end, location, banner_url').eq('id', t.event_id).single();
      setEvent(e);

      if (t.vehicle_id) {
        const { data: v } = await supabase.from('vehicles').select('make, model, year, colour').eq('id', t.vehicle_id).single();
        setVehicle(v);
      }

      if (t.qr_code_token) {
        const url = await QRCode.toDataURL(t.qr_code_token, { width: 200, margin: 2 });
        setQrDataUrl(url);
      }
      setLoading(false);
    };
    load();
  }, [ticketId]);

  const handleShare = async () => {
    const text = `I'm going to ${event?.title}! Got my ticket on RevNet.`;
    if (navigator.share) {
      try { await navigator.share({ title: event?.title, text, url: window.location.href }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Skeleton className="w-16 h-16 rounded-full mb-4" />
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!ticket || !event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold mb-1">Ticket not found</h2>
        <p className="text-sm text-muted-foreground mb-6">This ticket may not exist or you don't have access.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const refNumber = ticket.id.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12" style={{ backgroundColor: '#f3f3e8' }}>
      {/* Success header */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#dcfce7' }}>
        <Check className="w-10 h-10" style={{ color: '#16a34a' }} />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-1">You're going!</h1>
      <p className="text-sm text-muted-foreground mb-8">Your ticket has been confirmed</p>

      {/* Ticket card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden">
        {event.banner_url && (
          <img src={event.banner_url} alt="" className="w-full h-32 object-cover" />
        )}
        <div className="p-5 space-y-3">
          <h2 className="text-lg font-bold">{event.title}</h2>
          {event.date_start && (
            <p className="text-sm text-muted-foreground">{format(new Date(event.date_start), 'EEE d MMM yyyy · HH:mm')}</p>
          )}
          {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}

          <div className="border-t border-dashed border-border/50 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Attendee</span><span className="font-medium">{user?.displayName || 'You'}</span></div>
            {vehicle && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Vehicle</span><span className="font-medium">{vehicle.make} {vehicle.model} {vehicle.year}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="font-medium">£{Number(ticket.amount_paid).toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reference</span><span className="font-mono text-xs">{refNumber}</span></div>
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="flex justify-center pt-3">
              <img src={qrDataUrl} alt="Ticket QR Code" className="w-[160px] h-[160px]" />
            </div>
          )}
          <p className="text-[10px] text-center text-muted-foreground">Show this QR code at the event entrance</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm mt-6 space-y-3">
        <Button onClick={() => navigate(`/event/${event.id}`)} className="w-full h-11 rounded-xl" style={{ backgroundColor: '#d30d37' }}>
          View Event
        </Button>
        <Button onClick={handleShare} variant="outline" className="w-full h-11 rounded-xl gap-2">
          <Share2 className="w-4 h-4" /> Share
        </Button>
        <button onClick={() => toast.info('Apple Wallet integration coming soon')} className="w-full text-center text-sm text-muted-foreground py-2">
          Add to Apple Wallet (coming soon)
        </button>
      </div>
    </div>
  );
};

export default TicketSuccess;
