import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const FROM_EMAIL = Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@cydena.com";
const FROM_NAME = Deno.env.get("SENDGRID_FROM_NAME") || "Cydena";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, htmlContent: string) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      content: [{ type: "text/html", value: htmlContent }],
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid error: ${error}`);
  }
  
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get all candidates with email
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, username")
      .not("email", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    // Get current user count
    const userCount = profiles?.length || 0;
    const targetCount = 500;
    const spotsRemaining = Math.max(0, targetCount - userCount);

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of profiles || []) {
      if (!profile.email) continue;

      // Get their referral code
      const { data: referralCode } = await supabaseAdmin
        .from("referral_codes")
        .select("code")
        .eq("user_id", profile.id)
        .single();

      const referralLink = referralCode?.code 
        ? `https://cydena.com/auth?ref=${referralCode.code}`
        : "https://cydena.com/auth";

      const firstName = profile.full_name?.split(" ")[0] || profile.username || "there";

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://cydena.com/logos/cydena-logo-full.png" alt="Cydena" style="height: 40px;">
  </div>
  
  <h1 style="color: #0ea5e9; margin-bottom: 10px;">Hey ${firstName}! 👋</h1>
  
  <p>We're at <strong>${userCount}</strong> members. Goal: <strong>500</strong> by end of week.</p>
  
  <p style="font-size: 18px; color: #0ea5e9;"><strong>Only ${spotsRemaining} spots to go!</strong></p>
  
  <h2 style="margin-top: 30px;">The Deal:</h2>
  
  <p><strong>Invite 2 people who sign up →</strong></p>
  <ul style="background: #f0f9ff; padding: 20px 20px 20px 40px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
    <li>🏆 <strong>"Community Builder" badge</strong> (permanent, visible on your profile)</li>
    <li>⚡ <strong>500 bonus XP</strong> (instant level boost)</li>
    <li>👀 <strong>Featured profile</strong> for 7 days (employers see you first)</li>
  </ul>
  
  <p><strong>Invite 5+ people →</strong> All the above PLUS:</p>
  <ul style="background: #fef3c7; padding: 20px 20px 20px 40px; border-radius: 8px; border-left: 4px solid #f59e0b;">
    <li>🎯 <strong>Direct intro</strong> to a hiring manager from our active job list</li>
  </ul>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">Share Your Referral Link</a>
  </div>
  
  <p style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-family: monospace; word-break: break-all; font-size: 14px;">
    ${referralLink}
  </p>
  
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    We're building the cybersecurity talent network that actually works. Help us grow it.
  </p>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    Cydena — The Cybersecurity Talent Platform<br>
    <a href="https://cydena.com" style="color: #0ea5e9;">cydena.com</a>
  </p>
</body>
</html>
      `;

      try {
        await sendEmail(
          profile.email,
          "🚀 Help Us Hit 500 Members — Get Rewarded",
          htmlContent
        );
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${profile.email}:`, emailError);
        errors.push(profile.email);
      }
    }

    console.log(`Referral blitz emails sent: ${sentCount}/${profiles?.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        total: profiles?.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-referral-blitz-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
