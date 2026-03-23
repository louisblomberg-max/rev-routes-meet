import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    const { event_id } = await req.json();

    if (!event_id) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify event exists and has tickets available
    const { data: event, error: eventError } = await serviceClient
      .from("events")
      .select("id, title, max_attendees, is_ticketed, ticket_price, created_by")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!event.is_ticketed) {
      return new Response(JSON.stringify({ error: "This event is not ticketed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ticket_price = event.ticket_price;
    if (!ticket_price || ticket_price < 1) {
      return new Response(JSON.stringify({ error: "Event has no valid ticket price configured" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check attendee count
    const { count: attendeeCount } = await serviceClient
      .from("event_attendees")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event_id);

    if (event.max_attendees && attendeeCount !== null && attendeeCount >= event.max_attendees) {
      return new Response(JSON.stringify({ error: "Event is sold out" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already attending
    const { data: existing } = await serviceClient
      .from("event_attendees")
      .select("user_id")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Already attending this event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get organiser's Stripe Connect account
    const { data: organiserProfile } = await serviceClient
      .from("profiles")
      .select("stripe_connect_account_id")
      .eq("id", event.created_by)
      .single();

    const commissionAmount = Math.round(ticket_price * 100 * 0.05); // 5% in pence
    const ticketAmountPence = Math.round(ticket_price * 100);

    // Create checkout session
    const sessionParams: any = {
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Ticket: ${event.title}`,
              description: `Event ticket for ${event.title}`,
            },
            unit_amount: ticketAmountPence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/events/${event_id}?ticket=success`,
      cancel_url: `${req.headers.get("origin")}/events/${event_id}?ticket=cancelled`,
      metadata: {
        user_id: user.id,
        event_id: event_id,
        ticket_price: ticket_price.toString(),
        commission_amount: (commissionAmount / 100).toFixed(2),
        type: "event_ticket",
      },
    };

    // If organiser has Stripe Connect, use it for payouts
    if (organiserProfile?.stripe_connect_account_id) {
      sessionParams.payment_intent_data = {
        application_fee_amount: commissionAmount,
        transfer_data: {
          destination: organiserProfile.stripe_connect_account_id,
        },
      };
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    if (customers.data.length > 0) {
      sessionParams.customer = customers.data[0].id;
    } else {
      sessionParams.customer_email = user.email!;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Insert pending ticket record
    await serviceClient.from("event_tickets").insert({
      event_id: event_id,
      user_id: user.id,
      ticket_price: ticket_price,
      commission_amount: commissionAmount / 100,
      status: "pending",
      stripe_payment_intent_id: session.payment_intent as string || null,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("purchase-event-ticket error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
