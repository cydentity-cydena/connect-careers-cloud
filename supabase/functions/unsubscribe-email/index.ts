import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing unsubscribe token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Decode the token to get user ID
    let userId: string;
    try {
      userId = atob(token);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid unsubscribe token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(
        JSON.stringify({ error: "Invalid user ID format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update user's email notification preference
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ email_notifications: false })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating email preferences:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update preferences" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`User ${userId} successfully unsubscribed from emails`);

    return new Response(
      JSON.stringify({ success: true, message: "Successfully unsubscribed from emails" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in unsubscribe-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);