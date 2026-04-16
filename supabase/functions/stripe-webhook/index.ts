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
          break;
        }

        // ── Subscription checkout (existing logic) ──
        const userId = session.metadata?.user_id;
        if (!userId) { log("No user_id in metadata"); break; }

        if (session.mode === "subscription") {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price?.id;
          const interval = sub.items.data[0]?.price?.recurring?.interval;
          const billingCycle = interval === "year" ? "yearly" : "monthly";

          // Determine plan from price
          const enthusiastPrices = [
            "price_1TMa1ORdtkGP5enYDSGCiONH",
            "price_1TMa1gRdtkGP5enYVOQ3tlml",
          ];
          const businessPrices = [
            "price_1TMa37RdtkGP5enYFNGPw6gE",
            "price_1TMa3VRdtkGP5enYMvaHECON",
          ];
          let plan = "free";
          if (enthusiastPrices.includes(priceId)) plan = "enthusiast";
          if (businessPrices.includes(priceId)) plan = "business";

          log("Activating subscription", { userId, plan, billingCycle });

          // Update subscriptions table
          await supabaseAdmin.from("subscriptions").update({
            plan,
            status: "active",
            billing_cycle: billingCycle,
            stripe_subscription_id: sub.id,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            pending_plan: null,
          }).eq("user_id", userId);

          // Update profile plan via security definer function
          await supabaseAdmin.rpc("update_user_plan", { user_id: userId, new_plan: plan });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        log("Subscription cancelled", { subId: sub.id });

        await supabaseAdmin.from("subscriptions").update({
          status: "cancelled",
        }).eq("stripe_subscription_id", sub.id);

        // Find user and downgrade to free
        const { data: subRow } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();

        if (subRow?.user_id) {
          await supabaseAdmin.rpc("update_user_plan", { user_id: subRow.user_id, new_plan: "free" });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const interval = sub.items.data[0]?.price?.recurring?.interval;
        const billingCycle = interval === "year" ? "yearly" : "monthly";

        log("Subscription updated", { subId: sub.id, billingCycle });

        await supabaseAdmin.from("subscriptions").update({
          billing_cycle: billingCycle,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq("stripe_subscription_id", sub.id);
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
