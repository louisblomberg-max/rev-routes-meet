import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  const { ticket_id, event_id, amount, event_title, organiser_stripe_account_id, success_url, cancel_url } = await req.json();

  const sessionParams: any = {
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'gbp',
        product_data: { name: event_title || 'Event Ticket' },
        unit_amount: amount,
      },
      quantity: 1,
    }],
    success_url,
    cancel_url,
    metadata: { ticket_id, event_id },
  };

  if (organiser_stripe_account_id) {
    sessionParams.payment_intent_data = {
      application_fee_amount: Math.round(amount * 0.05),
      transfer_data: { destination: organiser_stripe_account_id },
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  await supabase.from('event_tickets').update({ stripe_session_id: session.id }).eq('id', ticket_id);

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
});
