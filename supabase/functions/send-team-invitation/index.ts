import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TEAM-INVITATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { invitee_email, role } = await req.json();
    if (!invitee_email || !role) {
      throw new Error("Missing required fields: invitee_email and role");
    }
    logStep("Request data validated", { invitee_email, role });

    // Check if seats are available
    const { data: seatsAvailable, error: seatsError } = await supabaseClient
      .rpc('check_seats_available', { 
        owner_id: user.id, 
        role_type: role 
      });

    if (seatsError) {
      logStep("Error checking seats", { error: seatsError });
      throw new Error(`Failed to check seat availability: ${seatsError.message}`);
    }

    if (!seatsAvailable) {
      logStep("No seats available");
      return new Response(
        JSON.stringify({ 
          error: "No available seats", 
          message: "Your subscription plan has reached its seat limit. Please upgrade to invite more team members." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabaseClient
      .from('team_invitations')
      .select('*')
      .eq('inviter_id', user.id)
      .eq('invitee_email', invitee_email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      logStep("Invitation already exists");
      return new Response(
        JSON.stringify({ 
          error: "Invitation already sent", 
          invitation: existingInvitation 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('team_invitations')
      .insert({
        inviter_id: user.id,
        invitee_email,
        role
      })
      .select()
      .single();

    if (inviteError) {
      logStep("Error creating invitation", { error: inviteError });
      throw inviteError;
    }

    logStep("Invitation created", { invitationId: invitation.id });

    // Get inviter profile for email
    const { data: inviterProfile } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const inviterName = inviterProfile?.full_name || inviterProfile?.email || 'Someone';
    const invitationLink = `${req.headers.get("origin")}/accept-invitation?token=${invitation.token}`;

    logStep("Email would be sent", { 
      to: invitee_email, 
      from: inviterName,
      link: invitationLink 
    });

    // TODO: Integrate with your email service (SendGrid, etc.) to send invitation email

    return new Response(
      JSON.stringify({
        success: true,
        invitation,
        message: `Invitation sent to ${invitee_email}`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
