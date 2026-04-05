import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, Deno.env.get('STRIPE_TICKET_WEBHOOK_SECRET')!);
  } catch {
    return new Response('Webhook error', { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const ticketId = session.metadata?.ticket_id;
    const eventId = session.metadata?.event_id;
    if (!ticketId || !eventId) return new Response('Missing metadata', { status: 400 });

    await supabase.from('event_tickets').update({
      status: 'confirmed',
      stripe_payment_intent_id: session.payment_intent as string,
    }).eq('id', ticketId);

    const { data: ticket } = await supabase.from('event_tickets').select('user_id, vehicle_id').eq('id', ticketId).single();
    if (ticket) {
      await supabase.from('event_attendees').upsert({
        event_id: eventId,
        user_id: ticket.user_id,
        status: 'attending',
      }, { onConflict: 'event_id,user_id' });

      await supabase.from('events').update({
        attendee_count: supabase.rpc ? undefined : 0,
      }).eq('id', eventId);
    }
  }

  return new Response('OK', { status: 200 });
});
