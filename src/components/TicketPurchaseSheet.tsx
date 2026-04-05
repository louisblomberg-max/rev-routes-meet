import { useState, useEffect } from 'react';
import { X, Car, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number | null;
  sold_count: number;
}

interface TicketPurchaseSheetProps {
  event: any;
  ticketTypes: TicketType[];
  onClose: () => void;
  onSuccess: () => void;
}

const TicketPurchaseSheet = ({ event, ticketTypes, onClose, onSuccess }: TicketPurchaseSheetProps) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<TicketType | null>(ticketTypes[0] || null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('vehicles').select('id, make, model, year, colour, vehicle_type')
      .eq('user_id', user.id).then(({ data }) => setVehicles(data || []));
  }, [user?.id]);

  const handlePay = async () => {
    if (!user?.id || !selectedType) return;
    setPaying(true);
    try {
      // 1. Create pending ticket
      const { data: ticket, error: ticketError } = await supabase.from('event_tickets').insert({
        event_id: event.id,
        user_id: user.id,
        ticket_type_id: selectedType.id,
        vehicle_id: selectedVehicleId || null,
        amount_paid: selectedType.price,
        status: 'pending',
      }).select().single();
      if (ticketError || !ticket) { toast.error('Failed to create ticket'); setPaying(false); return; }

      // 2. Create checkout session
      const { data, error } = await supabase.functions.invoke('create-ticket-checkout', {
        body: {
          ticket_id: ticket.id,
          event_id: event.id,
          ticket_type_id: selectedType.id,
          amount: Math.round(selectedType.price * 100),
          event_title: event.title,
          organiser_stripe_account_id: event.stripe_connect_account_id || null,
          success_url: `${window.location.origin}/ticket-success?ticket_id=${ticket.id}`,
          cancel_url: window.location.href,
        },
      });
      if (error || !data?.url) { toast.error('Failed to start checkout'); setPaying(false); return; }
      window.location.href = data.url;
    } catch {
      toast.error('Something went wrong');
      setPaying(false);
    }
  };

  const eventDate = event.date_start || event.startDate;

  return (
    <Drawer open onClose={onClose} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="max-h-[80vh] bg-card rounded-t-[20px]">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full" style={{ backgroundColor: '#e8e8e0' }} />
        </div>
        <button onClick={onClose} className="absolute top-3 right-4 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="overflow-y-auto px-5 pb-6 max-h-[calc(80vh-40px)] space-y-5">
          {/* Header */}
          <div>
            <h2 className="text-lg font-bold text-foreground truncate">{event.title}</h2>
            {eventDate && <p className="text-sm text-muted-foreground">{format(new Date(eventDate), 'EEE d MMM yyyy · HH:mm')}</p>}
          </div>

          {/* Ticket types */}
          {ticketTypes.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Ticket</p>
              {ticketTypes.map(t => {
                const remaining = t.capacity ? t.capacity - t.sold_count : null;
                const isSelected = selectedType?.id === t.id;
                return (
                  <button key={t.id} onClick={() => setSelectedType(t)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${isSelected ? 'border-[#d30d37] bg-[#fce8ed]' : 'border-border/50 bg-background'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[15px] font-semibold">{t.name}</p>
                        {t.description && <p className="text-[13px] text-muted-foreground mt-0.5">{t.description}</p>}
                        {remaining !== null && <p className="text-[11px] text-muted-foreground mt-1">{remaining} left</p>}
                      </div>
                      <p className="text-[15px] font-bold" style={{ color: '#d30d37' }}>£{Number(t.price).toFixed(2)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Vehicle selection */}
          {vehicles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Vehicle</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setSelectedVehicleId(null)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${!selectedVehicleId ? 'border-[#d30d37] bg-[#fce8ed]' : 'border-border/50'}`}>
                  Not bringing
                </button>
                {vehicles.map(v => (
                  <button key={v.id} onClick={() => setSelectedVehicleId(v.id)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${selectedVehicleId === v.id ? 'border-[#d30d37] bg-[#fce8ed]' : 'border-border/50'}`}>
                    <Car className="w-3 h-3" /> {v.make} {v.model} {v.year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedType && (
            <div className="bg-muted/30 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Summary</p>
              <div className="flex justify-between text-sm"><span>Event</span><span className="font-medium truncate ml-2">{event.title}</span></div>
              <div className="flex justify-between text-sm"><span>Ticket</span><span className="font-medium">{selectedType.name}</span></div>
              {selectedVehicleId && vehicles.find(v => v.id === selectedVehicleId) && (
                <div className="flex justify-between text-sm"><span>Vehicle</span><span className="font-medium">{vehicles.find(v => v.id === selectedVehicleId)?.make} {vehicles.find(v => v.id === selectedVehicleId)?.model}</span></div>
              )}
              <div className="border-t border-border/50 pt-2 mt-2 flex justify-between text-sm font-bold">
                <span>Total</span><span style={{ color: '#d30d37' }}>£{Number(selectedType.price).toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">Payment processed securely by Stripe</p>
            </div>
          )}

          {/* Pay button */}
          <button onClick={handlePay} disabled={paying || !selectedType}
            className="w-full h-[52px] rounded-xl text-white font-semibold text-[14px] transition-all disabled:opacity-50"
            style={{ backgroundColor: '#d30d37' }}>
            {paying ? 'Processing...' : `Pay £${selectedType ? Number(selectedType.price).toFixed(2) : '0.00'}`}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TicketPurchaseSheet;
