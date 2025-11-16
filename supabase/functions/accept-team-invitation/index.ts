import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACCEPT-TEAM-INVITATION] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { invitation_token } = await req.json();
    if (!invitation_token) {
      throw new Error("Missing required field: invitation_token");
    }
    logStep("Request data validated", { invitation_token });

    // Find the invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('team_invitations')
      .select('*')
      .eq('token', invitation_token)
      .eq('invitee_email', user.email)
      .eq('status', 'pending')
      .single();

    if (inviteError || !invitation) {
      logStep("Invitation not found or invalid");
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired invitation" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check if invitation expired
    if (new Date(invitation.expires_at) < new Date()) {
      logStep("Invitation expired");
      
      await supabaseClient
        .from('team_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return new Response(
        JSON.stringify({ 
          error: "Invitation has expired" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabaseClient
      .from('team_members')
      .select('*')
      .eq('team_owner_id', invitation.inviter_id)
      .eq('member_id', user.id)
      .eq('role', invitation.role)
      .single();

    if (existingMember) {
      logStep("User is already a team member");
      return new Response(
        JSON.stringify({ 
          error: "You are already a member of this team" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Add role to user
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: invitation.role
      })
      .select()
      .single();

    if (roleError && !roleError.message.includes('duplicate')) {
      logStep("Error adding role", { error: roleError });
      throw roleError;
    }

    // Add to team members
    const { data: teamMember, error: memberError } = await supabaseClient
      .from('team_members')
      .insert({
        team_owner_id: invitation.inviter_id,
        member_id: user.id,
        role: invitation.role,
        invitation_id: invitation.id
      })
      .select()
      .single();

    if (memberError) {
      logStep("Error adding team member", { error: memberError });
      throw memberError;
    }

    // Update invitation status
    await supabaseClient
      .from('team_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    logStep("Invitation accepted successfully", { teamMemberId: teamMember.id });

    return new Response(
      JSON.stringify({
        success: true,
        team_member: teamMember,
        message: "Successfully joined the team"
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
