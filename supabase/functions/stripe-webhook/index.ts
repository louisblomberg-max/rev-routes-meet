import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

const log = (step: string, details?: unknown) =>
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !webhookSecret) {
    log("ERROR", "Missing signature or webhook secret");
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    log("ERROR", { message: (err as Error).message });
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  log("Event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // ── Ticket purchase (has ticket_id in metadata) ──
        if (session.metadata?.ticket_id) {
          const { ticket_id, event_id } = session.metadata;
          log("Ticket purchase completed", { ticket_id, event_id });

          // Mark ticket as confirmed
          await supabaseAdmin.from("event_tickets").update({
            status: "confirmed",
            stripe_payment_intent_id: session.payment_intent as string,
          }).eq("id", ticket_id);

          // Get ticket details and add to attendees
          const { data: ticket } = await supabaseAdmin
            .from("event_tickets")
            .select("user_id, vehicle_id")
            .eq("id", ticket_id)
            .single();

          if (ticket) {
            await supabaseAdmin.from("event_attendees").upsert({
              event_id,
              user_id: ticket.user_id,
              status: "attending",
            }, { onConflict: "event_id,user_id" });

            // Increment attendee count
            const { data: evt } = await supabaseAdmin
              .from("events")
              .select("attendee_count")
              .eq("id", event_id)
              .single();
            if (evt) {
              await supabaseAdmin.from("events").update({
                attendee_count: (evt.attendee_count || 0) + 1,
              }).eq("id", event_id);
            }
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        log("Payment intent succeeded", { piId: pi.id });

        // Update event_purchases for one-time event post payments
        await supabaseAdmin.from("event_purchases").update({
          status: "confirmed",
        }).eq("stripe_payment_intent_id", pi.id);

        // Update event_tickets for ticket purchases
        const { data: ticketRows } = await supabaseAdmin.from("event_tickets").update({
          status: "confirmed",
        }).eq("stripe_payment_intent_id", pi.id).eq("status", "pending").select("event_id, user_id");

        // Auto-add confirmed ticket holders as event attendees
        if (ticketRows && ticketRows.length > 0) {
          for (const ticket of ticketRows) {
            if (ticket.event_id && ticket.user_id) {
              await supabaseAdmin.from("event_attendees").upsert({
                event_id: ticket.event_id,
                user_id: ticket.user_id,
                status: "attending",
              }, { onConflict: "event_id,user_id" });
            }
          }
        }
        break;
      }

      default:
        log("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    log("ERROR processing event", { message: (err as Error).message });
    return new Response("Processing error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
