import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const SENDGRID_API_URL = "https://api.sendgrid.com/v3/mail/send";
const SENDGRID_FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "notifications@cydena.app";
const SENDGRID_FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Cydena";

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
          message: "An invitation has already been sent to this email address."
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
    const origin = req.headers.get("origin") || "https://cydena.lovable.app";
    const invitationLink = `${origin}/accept-invitation?token=${invitation.token}`;

    logStep("Sending invitation email", { to: invitee_email, from: inviterName });

    // Send email via SendGrid
    if (!SENDGRID_API_KEY) {
      logStep("WARNING: SendGrid API key not configured, email not sent");
    } else {
      const emailResponse = await fetch(SENDGRID_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: invitee_email }] }],
          from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
          subject: `${inviterName} has invited you to join their team on Cydena`,
          content: [
            {
              type: "text/html",
              value: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <h1 style="color:#09090b;font-size:24px;margin:0 0 16px;">You're Invited!</h1>
      <p style="color:#71717a;font-size:16px;line-height:1.6;margin:0 0 24px;">
        <strong>${inviterName}</strong> has invited you to join their team on <strong>Cydena</strong> as a <strong>${role}</strong>.
      </p>
      <p style="color:#71717a;font-size:16px;line-height:1.6;margin:0 0 32px;">
        Click the button below to accept the invitation and get started.
      </p>
      <a href="${invitationLink}" style="display:inline-block;background-color:#6d28d9;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;">
        Accept Invitation
      </a>
      <p style="color:#a1a1aa;font-size:13px;line-height:1.5;margin:32px 0 0;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0 16px;">
      <p style="color:#a1a1aa;font-size:12px;margin:0;">Cydena — The Cybersecurity Talent Platform</p>
    </div>
  </div>
</body>
</html>`,
            },
          ],
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        logStep("SendGrid error", { status: emailResponse.status, error: errorText });
        // Don't throw - invitation was created, just log the email failure
      } else {
        logStep("Invitation email sent successfully");
      }
    }

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
