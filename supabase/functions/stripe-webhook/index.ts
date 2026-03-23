import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
        const userId = session.metadata?.user_id;
        if (!userId) { log("No user_id in metadata"); break; }

        if (session.mode === "subscription") {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = sub.items.data[0]?.price?.id;
          const interval = sub.items.data[0]?.price?.recurring?.interval;
          const billingCycle = interval === "year" ? "yearly" : "monthly";

          // Determine plan from price
          const proPrices = ["price_1TEA0oRdtkGP5enY8IV9H8O8", "price_1TEA16RdtkGP5enYQp4d3D0H"];
          const clubPrices = ["price_1TEA1SRdtkGP5enYw6c3hiTs", "price_1TEA1jRdtkGP5enYuuGccgS9"];
          let plan = "free";
          if (proPrices.includes(priceId)) plan = "pro";
          if (clubPrices.includes(priceId)) plan = "club";

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
