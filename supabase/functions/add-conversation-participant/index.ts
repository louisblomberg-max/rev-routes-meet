import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

    // Verify calling user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerUserId = user.id;
    const { conversation_id, participant_user_id } = await req.json();

    if (!conversation_id || !participant_user_id) {
      return new Response(JSON.stringify({ error: "Missing conversation_id or participant_user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is a participant of this conversation
    const { data: callerParticipant } = await serviceClient
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversation_id)
      .eq("user_id", callerUserId)
      .maybeSingle();

    if (!callerParticipant) {
      return new Response(JSON.stringify({ error: "You are not a participant of this conversation" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check messaging privacy settings before adding participant
    const { data: canMessage, error: privacyError } = await serviceClient
      .rpc('can_message_user', {
        sender_id: callerUserId,
        recipient_id: participant_user_id,
      });

    if (privacyError || !canMessage) {
      return new Response(
        JSON.stringify({ error: "You cannot message this user based on their privacy settings" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Add the other user via service role (bypasses RLS)
    const { error: insertError } = await serviceClient
      .from("conversation_participants")
      .insert({ conversation_id, user_id: participant_user_id });

    if (insertError) {
      // Ignore duplicate key errors (user already in conversation)
      if (insertError.code === "23505") {
        return new Response(JSON.stringify({ success: true, already_exists: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to add participant" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("add-conversation-participant error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
